import React, { useState, useRef, ChangeEvent, KeyboardEvent } from 'react';
import { PlusIcon, SendIcon } from './Icons';

interface ChatInputProps {
  onSendMessage: (text: string, image: File | null) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if ((text.trim() || imageFile) && !isLoading) {
      onSendMessage(text, imageFile);
      setText('');
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'; // Reset height
      }
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  
  const handleImageRemove = () => {
    setImageFile(null);
    setImagePreview(null);
    if(fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  return (
    <div className="px-4 md:px-6 pt-4 pb-6 bg-slate-800">
      <div className="max-w-4xl mx-auto">
         {imagePreview && (
          <div className="relative inline-block mb-2">
            <img src={imagePreview} alt="Preview" className="h-20 w-20 object-cover rounded-md"/>
            <button onClick={handleImageRemove} className="absolute -top-2 -right-2 bg-slate-600 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs">&times;</button>
          </div>
        )}
        <div className="flex items-center bg-slate-900 rounded-3xl p-1 pr-2 border border-slate-700">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-slate-400 hover:text-white"
            aria-label="Upload image"
          >
            <PlusIcon className="w-6 h-6" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyPress}
            placeholder="Ask a health question or upload an image"
            className="flex-1 bg-transparent text-white placeholder-slate-400 focus:outline-none resize-none px-2 py-3 max-h-48 overflow-y-auto"
            rows={1}
            disabled={isLoading}
          />
          {(text.trim() || imageFile) && (
            <button 
              onClick={handleSend}
              disabled={isLoading}
              className="ml-2 p-2 text-white bg-blue-600 rounded-full hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 flex-shrink-0"
              aria-label="Send message"
            >
              <SendIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInput;