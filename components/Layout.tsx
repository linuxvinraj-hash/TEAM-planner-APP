import React from 'react';
import { NavView, UserProfile } from '../types';
import { LayoutDashboard, PenSquare, Sparkles, UserCircle, Bot } from 'lucide-react';

interface LayoutProps {
  currentView: NavView;
  onNavigate: (view: NavView) => void;
  currentUser: UserProfile;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentView, onNavigate, currentUser, children }) => {
  const navItems = [
    { id: NavView.DASHBOARD, label: 'Consolidated View', icon: LayoutDashboard },
    { id: NavView.CHECK_IN, label: 'Daily Check-in', icon: PenSquare },
    { id: NavView.INSIGHTS, label: 'Insights (AI)', icon: Sparkles },
    { id: NavView.SETTINGS, label: 'Account & Auth', icon: UserCircle },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="h-8 w-8 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Bot className="text-white w-5 h-5" />
          </div>
          <span className="text-white font-bold tracking-wide text-lg">Team Planner</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                currentView === item.id 
                  ? 'bg-indigo-600 text-white shadow-lg' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
            <div className="bg-slate-800 rounded-lg p-3 flex items-center gap-3">
                <img 
                  src={currentUser.avatarUrl} 
                  alt={currentUser.name} 
                  className="w-8 h-8 rounded-full border border-slate-600" 
                />
                <div className="overflow-hidden">
                    <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
                    <p className="text-xs text-slate-400">{currentUser.role}</p>
                </div>
            </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto h-screen">
        <div className="p-4 md:p-8">
            {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;