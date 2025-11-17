import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import ChatInput from './components/ChatInput';
import UserProfileModal from './components/UserProfileModal';
import { generateResponse } from './services/geminiService';
import { Message, UserProfile, ChatSession } from './types';
import { MenuIcon, LogoIcon } from './components/Icons';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>(() => {
    // Lazy initializer to load from localStorage only on the initial render
    try {
      const storedHistory = localStorage.getItem('chatHistory');
      if (storedHistory) {
        return JSON.parse(storedHistory);
      }
    } catch (error) {
      console.error("Failed to parse chat history from localStorage", error);
    }
    return [];
  });
  
  // A single, authoritative effect to save chat history whenever it changes.
  useEffect(() => {
    try {
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    } catch (error) {
      console.error("Failed to save chat history to localStorage", error);
    }
  }, [chatHistory]);

  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const storedProfile = localStorage.getItem('userProfile');
      if (storedProfile) {
        return JSON.parse(storedProfile);
      }
    } catch (error) {
      console.error("Failed to parse user profile from localStorage", error);
    }
    return {
      name: '',
      age: '',
      height: '',
      weight: '',
      steps: '',
      notes: '',
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
    } catch (error) {
      console.error("Failed to save user profile to localStorage", error);
    }
  }, [userProfile]);


  const activeChat = chatHistory.find((chat) => chat.id === activeChatId);
  const messages = activeChat ? activeChat.messages : [];

  const handleNewChat = () => {
    setActiveChatId(null);
  };

  const handleSelectChat = (id: string) => {
    setActiveChatId(id);
  };

  const handleDeleteChat = (idToDelete: string) => {
    if (activeChatId === idToDelete) {
      setActiveChatId(null);
    }
    setChatHistory(prev => prev.filter(chat => chat.id !== idToDelete));
  };
  
  const handleOpenProfileModal = () => {
    setIsProfileModalOpen(true);
  };
  
  const handleMobileSidebarAction = (action: (...args: any[]) => void) => (...args: any[]) => {
      action(...args);
      setIsSidebarOpen(false);
  };

  const handleSendMessage = async (text: string, imageFile: File | null) => {
    if (!text.trim() && !imageFile) return;

    const imageToBase64 = (file: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });
      
    const userMessage: Message = { role: 'user', text };
    
    if (imageFile) {
        try {
            userMessage.image = await imageToBase64(imageFile);
        } catch (error) {
            console.error("Error reading image file", error);
            return;
        }
    }

    const isNewChat = !activeChatId;
    const chatToUpdateId = activeChatId || Date.now().toString();

    // Optimistically update the UI with the user's message
    setChatHistory(prev => {
        if (isNewChat) {
            const title = text.substring(0, 40) + (text.length > 40 ? '...' : '') || 'Image Query';
            const newSession: ChatSession = { id: chatToUpdateId, title, messages: [userMessage] };
            return [newSession, ...prev];
        }
        return prev.map(chat => 
            chat.id === chatToUpdateId ? { ...chat, messages: [...chat.messages, userMessage] } : chat
        );
    });

    if (isNewChat) {
        setActiveChatId(chatToUpdateId);
    }
    
    setIsLoading(true);

    const isProfileEmpty = Object.values(userProfile).every(value => value.trim() === '');
    const isPersonalQuery = /\b(i|my|me)\b/i.test(text);

    if (isProfileEmpty && isPersonalQuery) {
        const cannedResponse: Message = {
            role: 'model',
            text: "To receive personalized health advice, please fill out your user profile first. You can do this by clicking on the 'User profile' button in the sidebar."
        };
        
        setChatHistory(prev => {
            return prev.map(chat => 
                chat.id === chatToUpdateId ? { ...chat, messages: [...chat.messages, cannedResponse] } : chat
            );
        });
        
        setIsLoading(false);
        return; // Stop here, no API call
    }

    try {
      const modelResponse = await generateResponse(text, imageFile, userProfile);
      // Append the model's response using a functional update
      setChatHistory(prev => {
        // This check prevents updating a chat that was deleted/cleared while waiting for a response
        if (!prev.some(chat => chat.id === chatToUpdateId)) {
            return prev;
        }
        return prev.map(chat => 
            chat.id === chatToUpdateId ? { ...chat, messages: [...chat.messages, modelResponse] } : chat
        );
      });
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        role: 'model',
        text: 'An error occurred. Please try again.',
      };
      // Append an error message using a functional update
      setChatHistory(prev => {
        if (!prev.some(chat => chat.id === chatToUpdateId)) {
            return prev;
        }
        return prev.map(chat => 
            chat.id === chatToUpdateId ? { ...chat, messages: [...chat.messages, errorMessage] } : chat
        );
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
  };

  return (
    <div className="h-screen w-screen bg-slate-800 text-slate-100 font-sans">
      <div className="flex h-full w-full">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex">
          <Sidebar
            onNewChat={handleNewChat}
            onProfileClick={handleOpenProfileModal}
            chatHistory={chatHistory}
            activeChatId={activeChatId}
            onSelectChat={handleSelectChat}
            onDeleteChat={handleDeleteChat}
          />
        </div>
        
        {/* Mobile Drawer */}
        <div
            className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out md:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            role="dialog"
            aria-modal="true"
        >
            <Sidebar
              onNewChat={handleMobileSidebarAction(handleNewChat)}
              onProfileClick={handleMobileSidebarAction(handleOpenProfileModal)}
              chatHistory={chatHistory}
              activeChatId={activeChatId}
              onSelectChat={handleMobileSidebarAction(handleSelectChat)}
              onDeleteChat={handleDeleteChat}
              onClose={() => setIsSidebarOpen(false)}
            />
        </div>
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
        )}

        <div className="flex flex-col flex-1 min-w-0">
          <header className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-700/50 flex-shrink-0">
            <button onClick={() => setIsSidebarOpen(true)} aria-label="Open menu" className="p-1">
              <MenuIcon className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
                <LogoIcon className="w-7 h-7 text-cyan-400" />
                <h1 className="text-lg font-bold">HealthQuestAI</h1>
            </div>
            <div className="w-6" />
          </header>
          <main className="flex flex-col flex-1 overflow-hidden">
            <ChatView
              messages={messages}
              isLoading={isLoading}
              onPromptClick={(prompt) => handleSendMessage(prompt, null)}
              userProfile={userProfile}
            />
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
          </main>
        </div>
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          onSave={handleSaveProfile}
          currentProfile={userProfile}
        />
      </div>
    </div>
  );
};

export default App;