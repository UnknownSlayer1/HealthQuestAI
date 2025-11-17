
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: UserProfile) => void;
  currentProfile: UserProfile;
}

const InputField: React.FC<{
    label: string;
    name: keyof UserProfile;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    placeholder: string;
    isTextArea?: boolean;
}> = ({ label, name, value, onChange, placeholder, isTextArea = false }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
        {isTextArea ? (
            <textarea
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                rows={4}
                className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
        ) : (
            <input
                type="text"
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
        )}
    </div>
);


const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentProfile,
}) => {
  const [profile, setProfile] = useState<UserProfile>(currentProfile);

  useEffect(() => {
    setProfile(currentProfile);
  }, [currentProfile, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // FIX: Corrected syntax for arrow function definition. The underscore was a typo.
  const handleSave = () => {
    onSave(profile);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-slate-900 rounded-lg shadow-xl w-full max-w-md p-6 border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-4">User Profile</h2>
        <p className="text-slate-400 mb-6">This information helps the AI tailor responses for you.</p>
        <div className="space-y-4">
          <InputField label="Name" name="name" value={profile.name} onChange={handleChange} placeholder="e.g., Jane Doe" />
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Age" name="age" value={profile.age} onChange={handleChange} placeholder="e.g., 30" />
            <InputField label="Height" name="height" value={profile.height} onChange={handleChange} placeholder="e.g., 5' 8" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Weight" name="weight" value={profile.weight} onChange={handleChange} placeholder="e.g., 150 lbs" />
            <InputField label="Daily Steps Goal" name="steps" value={profile.steps} onChange={handleChange} placeholder="e.g., 10000" />
          </div>
          <InputField label="Notes" name="notes" value={profile.notes} onChange={handleChange} placeholder="e.g., Allergic to peanuts, trying to build lean muscle." isTextArea />
        </div>
        <div className="mt-8 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-white bg-slate-600 hover:bg-slate-500 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-md text-white bg-cyan-600 hover:bg-cyan-500 transition"
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
