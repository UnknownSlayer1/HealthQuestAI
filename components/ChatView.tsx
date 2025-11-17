

import React from 'react';
import { Message, UserProfile } from '../types';
import { LogoIcon } from './Icons';
import WelcomeScreen from './WelcomeScreen';
import LoadingIndicator from './LoadingIndicator';

interface ChatViewProps {
  messages: Message[];
  isLoading: boolean;
  onPromptClick: (prompt: string) => void;
  userProfile: UserProfile;
}

const MarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
  const parseInline = (line: string) => {
    // Bold
    return line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  const lines = text.split('\n');
  // FIX: Explicitly type `elements` array for better type safety.
  const elements: React.ReactNode[] = [];
  // FIX: Use `React.ReactElement` to fix "Cannot find namespace 'JSX'" error.
  let listItems: React.ReactElement[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const flushList = () => {
    if (listItems.length > 0) {
      if (listType === 'ul') {
        elements.push(<ul key={`list-${elements.length}`} className="list-disc list-inside space-y-1 my-2 pl-4">{listItems}</ul>);
      } else if (listType === 'ol') {
        elements.push(<ol key={`list-${elements.length}`} className="list-decimal list-inside space-y-1 my-2 pl-4">{listItems}</ol>);
      }
      listItems = [];
      listType = null;
    }
  };

  lines.forEach((line, index) => {
    const isUl = line.startsWith('* ') || line.startsWith('- ');
    const isOl = /^\d+\.\s/.test(line);
    
    if ((isUl && listType === 'ol') || (isOl && listType === 'ul') || (!isUl && !isOl)) {
      flushList();
    }
    
    if (isUl && !listType) listType = 'ul';
    if (isOl && !listType) listType = 'ol';
    
    if (isUl) {
      listItems.push(<li key={index} dangerouslySetInnerHTML={{ __html: parseInline(line.substring(2)) }} />);
    } else if (isOl) {
      listItems.push(<li key={index} dangerouslySetInnerHTML={{ __html: parseInline(line.replace(/^\d+\.\s/, '')) }} />);
    } else if (line.startsWith('### ')) {
      elements.push(<h4 key={index} className="text-md font-semibold mt-3 mb-1" dangerouslySetInnerHTML={{ __html: parseInline(line.substring(4)) }} />);
    } else if (line.startsWith('## ')) {
      elements.push(<h3 key={index} className="text-lg font-bold mt-4 mb-2" dangerouslySetInnerHTML={{ __html: parseInline(line.substring(3)) }} />);
    } else if (line.startsWith('# ')) {
      elements.push(<h2 key={index} className="text-xl font-bold mt-5 mb-3" dangerouslySetInnerHTML={{ __html: parseInline(line.substring(2)) }} />);
    } else if (line.trim() !== '') {
      elements.push(<p key={index} className="my-2" dangerouslySetInnerHTML={{ __html: parseInline(line) }} />);
    }
  });

  flushList();

  return <div>{elements}</div>;
};

const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
  const isModel = message.role === 'model';
  return (
    <div className={`flex items-start gap-4 my-4 ${isModel ? '' : 'justify-end'}`}>
      {isModel && (
        <div className="flex-shrink-0 w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
          <LogoIcon className="w-6 h-6 text-cyan-400" />
        </div>
      )}
      <div className={`max-w-2xl p-4 rounded-lg ${isModel ? 'bg-slate-700' : 'bg-blue-600'}`}>
        {message.image && (
          <img src={message.image} alt="User upload" className="rounded-md mb-2 max-w-xs" />
        )}
        {isModel ? (
          <div className="text-white">
            <MarkdownRenderer text={message.text} />
          </div>
        ) : (
          <p className="text-white whitespace-pre-wrap">{message.text}</p>
        )}
        {message.sources && message.sources.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-600">
            <h4 className="text-xs font-semibold text-slate-400 mb-2">Sources:</h4>
            <div className="flex flex-col gap-2">
              {message.sources.map((source, index) => (
                <a
                  key={index}
                  href={source.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-cyan-400 hover:underline truncate"
                >
                  {source.title || source.uri}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


const ChatView: React.FC<ChatViewProps> = ({ messages, isLoading, onPromptClick, userProfile }) => {
  const chatContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    chatContainerRef.current?.scrollTo(0, chatContainerRef.current.scrollHeight);
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return <WelcomeScreen onPromptClick={onPromptClick} userProfile={userProfile} />;
  }
  
  return (
    <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
        {isLoading && (
          <div className="flex items-start gap-4 my-4">
            <div className="flex-shrink-0 w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
              <LogoIcon className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="w-64 max-w-2xl p-4 rounded-lg bg-slate-700 flex items-center">
              <LoadingIndicator />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatView;