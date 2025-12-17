import React from 'react';
import { UserProfile } from '../types';
import { MOCK_USERS } from '../App';
import { LogOut, User, ShieldCheck } from 'lucide-react';

interface SettingsProps {
  currentUser: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ currentUser, onLogin, onLogout }) => {
  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <div className="text-center md:text-left">
        <h1 className="text-2xl font-bold text-slate-900">
          {currentUser ? 'Account & Session' : 'Welcome to Team Planner'}
        </h1>
        <p className="text-slate-500">
          {currentUser ? 'Manage your active session or switch accounts.' : 'Please select a profile to sign in.'}
        </p>
      </div>

      {currentUser && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h2 className="font-semibold text-slate-800">Current Session</h2>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Active</span>
          </div>
          <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img 
                src={currentUser.avatarUrl} 
                alt={currentUser.name} 
                className="w-16 h-16 rounded-full border-2 border-slate-100 shadow-sm"
              />
              <div>
                <h3 className="text-lg font-bold text-slate-900">{currentUser.name}</h3>
                <p className="text-slate-500 flex items-center gap-1.5">
                   {currentUser.role === 'Admin' ? <ShieldCheck className="w-4 h-4 text-indigo-600"/> : <User className="w-4 h-4"/>}
                   {currentUser.role}
                </p>
                <p className="text-xs text-slate-400 mt-1">ID: {currentUser.id}</p>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition font-medium"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-800">Available Profiles</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {MOCK_USERS.map((user) => {
            const isActive = currentUser?.id === user.id;
            return (
              <button
                key={user.id}
                onClick={() => !isActive && onLogin(user)}
                disabled={isActive}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left relative overflow-hidden group
                  ${isActive 
                    ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500 cursor-default' 
                    : 'border-slate-200 hover:border-indigo-300 hover:shadow-md bg-white'
                  }
                `}
              >
                <img 
                  src={user.avatarUrl} 
                  alt={user.name} 
                  className={`w-12 h-12 rounded-full border transition-transform group-hover:scale-105 ${isActive ? 'border-indigo-200' : 'border-slate-100'}`}
                />
                <div className="flex-1">
                  <h3 className={`font-semibold ${isActive ? 'text-indigo-900' : 'text-slate-900'}`}>{user.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${
                        user.role === 'Admin' 
                            ? 'bg-purple-100 text-purple-700 border-purple-200' 
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                        {user.role}
                    </span>
                  </div>
                </div>
                {isActive && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="h-3 w-3 bg-indigo-500 rounded-full shadow-sm ring-2 ring-indigo-200" />
                    </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Settings;