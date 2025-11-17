

import React from 'react';
import { LogoIcon } from './Icons';
import { UserProfile } from '../types';

interface WelcomeScreenProps {
  onPromptClick: (prompt: string) => void;
  userProfile: UserProfile;
}

const examplePrompts = [
  {
    title: 'Muscle Gain',
    question: 'What is the most optimal thing to eat for muscle gain?',
  },
  {
    title: 'Fat Loss',
    question: 'What foods should I eat to maximize fat loss while preserving muscle?',
  },
  {
    title: 'Sleep Quality',
    question: 'What dietary changes can improve sleep quality according to PubMed?',
  },
  {
    title: 'Cognitive Function',
    question: 'Which nutrients are proven to enhance cognitive function?',
  },
];

const PromptCard: React.FC<{ title: string; question: string; onClick: () => void }> = ({ title, question, onClick }) => (
  <button
    onClick={onClick}
    className="bg-slate-900/50 p-4 rounded-lg text-left w-full hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400"
  >
    <h3 className="font-semibold text-slate-200">{title}</h3>
    <p className="text-sm text-slate-400">{question}</p>
  </button>
);

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onPromptClick, userProfile }) => {
  const greeting = userProfile.name 
    ? `Hello, ${userProfile.name}! How can I help you today?` 
    : "How can I help you today?";

  return (
    <div className="flex flex-col items-center justify-center h-full text-white">
      <div className="text-center">
        <div className="inline-block mb-6">
          <LogoIcon className="w-16 h-16 text-cyan-400 filter drop-shadow-[0_0_8px_#22D3EE]" />
        </div>
        <h2 className="text-3xl font-bold mb-10">{greeting}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
        {examplePrompts.map((prompt) => (
          <PromptCard
            key={prompt.title}
            title={prompt.title}
            question={prompt.question}
            onClick={() => onPromptClick(prompt.question)}
          />
        ))}
      </div>
    </div>
  );
};

export default WelcomeScreen;