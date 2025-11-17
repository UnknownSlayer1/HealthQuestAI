import React from 'react';
import { LogoIcon, PlusIcon, UserProfileIcon, TrashIcon, CloseIcon } from './Icons';
import { ChatSession } from '../types';

interface SidebarProps {
  onNewChat: () => void;
  onProfileClick: () => void;
  chatHistory: ChatSession[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  onNewChat,
  onProfileClick,
  chatHistory,
  activeChatId,
  onSelectChat,
  onDeleteChat,
  onClose,
}) => {
  return (
    <div className="flex flex-col w-64 bg-slate-900 p-4 text-white h-full flex-shrink-0">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
            <LogoIcon className="w-8 h-8 mr-3 text-cyan-400" />
            <h1 className="text-xl font-bold">HealthQuestAI</h1>
        </div>
        {onClose && (
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white" aria-label="Close menu">
                <CloseIcon className="w-6 h-6" />
            </button>
        )}
      </div>
      <button
        onClick={onNewChat}
        className="flex items-center justify-between w-full p-2 mb-4 text-left rounded-md hover:bg-slate-800 transition-colors"
      >
        <span>New Chat</span>
        <PlusIcon className="w-5 h-5" />
      </button>

      <div className="flex-1 flex flex-col min-h-0 border-t border-slate-700/50 pt-2">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2 pt-2">History</h2>
        <div className="overflow-y-auto pr-2">
          <div className="flex flex-col gap-1">
            {chatHistory.map((session) => (
              <div key={session.id} className="group relative flex items-center w-full">
                <button
                  onClick={() => onSelectChat(session.id)}
                  className={`w-full text-left p-2 rounded-md truncate text-sm transition-colors pr-8 ${
                    activeChatId === session.id
                      ? 'bg-slate-800 font-semibold'
                      : 'hover:bg-slate-800/50'
                  }`}
                  title={session.title}
                >
                  {session.title}
                </button>
                 <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(session.id)
                  }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-500 hover:text-red-400 hover:bg-slate-700 opacity-0 group-hover:opacity-100 transition-all"
                  aria-label={`Delete chat: ${session.title}`}
                 >
                    <TrashIcon className="w-4 h-4" />
                 </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-700/50">
        <button
          onClick={onProfileClick}
          className="flex items-center w-full p-2 text-left rounded-md hover:bg-slate-800 transition-colors"
        >
          <UserProfileIcon className="w-6 h-6 mr-3" />
          <span>User profile</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
