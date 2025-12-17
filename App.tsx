import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import CheckIn from './components/CheckIn';
import Insights from './components/Insights';
import Settings from './components/Settings';
import TaskPopup from './components/TaskPopup';
import { NavView, StandupEntry, UserProfile, AdminTask } from './types';
import { Bot } from 'lucide-react';

// Mock Users
export const MOCK_USERS: UserProfile[] = [
  { id: 'u1', name: 'Alice Engineer', role: 'Engineer', avatarUrl: 'https://picsum.photos/40/40?random=1' },
  { id: 'u2', name: 'Bob Backend', role: 'Engineer', avatarUrl: 'https://picsum.photos/40/40?random=2' },
  { id: 'u3', name: 'Charlie Frontend', role: 'Engineer', avatarUrl: 'https://picsum.photos/40/40?random=3' },
  { id: 'u4', name: 'Diana Lead', role: 'Admin', avatarUrl: 'https://picsum.photos/40/40?random=4' },
];

// Mock initial data
const INITIAL_ENTRIES: StandupEntry[] = [
  {
    id: '1',
    userId: 'u1',
    userName: 'Alice Engineer',
    avatarUrl: 'https://picsum.photos/40/40?random=1',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    yesterday: 'Completed the API authentication middleware refactor. Merged PR #402.',
    today: 'Starting on the user profile update endpoints. Need to coordinate with frontend.',
    blockers: 'None currently.'
  },
  {
    id: '2',
    userId: 'u2',
    userName: 'Bob Backend',
    avatarUrl: 'https://picsum.photos/40/40?random=2',
    timestamp: new Date(Date.now() - 40000000).toISOString(),
    yesterday: 'Fixed the database connection pool leak in production.',
    today: 'Investigating slow query logs for the dashboard analytics.',
    blockers: 'Waiting for access to the new AWS RDS instance credentials from DevOps.'
  },
  {
    id: '3',
    userId: 'u3',
    userName: 'Charlie Frontend',
    avatarUrl: 'https://picsum.photos/40/40?random=3',
    timestamp: new Date(Date.now() - 20000000).toISOString(),
    yesterday: 'Implemented the new sidebar navigation components.',
    today: 'Connecting the dashboard charts to the real API endpoints.',
    blockers: 'Stuck on a CORS issue with the staging API. API team needs to update headers.'
  },
  {
    id: '4',
    userId: 'u4',
    userName: 'Diana Lead',
    avatarUrl: 'https://picsum.photos/40/40?random=4',
    timestamp: new Date().toISOString(),
    yesterday: 'Reviewed PRs for the auth service. Planned next sprint.',
    today: 'Updating the documentation for the new API version.',
    blockers: 'None.'
  }
];

// Splash Screen Component
const SplashScreen = () => (
    <div className="fixed inset-0 bg-slate-900 z-[100] flex flex-col items-center justify-center animate-out fade-out duration-1000 fill-mode-forwards">
        <div className="flex flex-col items-center animate-fade-in">
            <div className="h-24 w-24 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl mb-6 ring-4 ring-indigo-500/30">
                <Bot className="text-white w-14 h-14" />
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Team Planner</h1>
            <p className="text-slate-400 mt-2 text-sm font-medium tracking-wide uppercase">Intelligent Orchestration</p>
        </div>
    </div>
);

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(MOCK_USERS[0]);
  const [currentView, setCurrentView] = useState<NavView>(NavView.DASHBOARD);
  const [entries, setEntries] = useState<StandupEntry[]>(INITIAL_ENTRIES);
  const [adminTasks, setAdminTasks] = useState<AdminTask[]>([]);

  useEffect(() => {
    // Show splash screen for 2.5 seconds
    const timer = setTimeout(() => {
        setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleCheckIn = (newEntry: StandupEntry) => {
    setEntries(prev => [newEntry, ...prev]);
    setCurrentView(NavView.DASHBOARD);
  };

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    setCurrentView(NavView.DASHBOARD);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView(NavView.SETTINGS); // Ensure we are on the login view
  };

  const handleAssignTask = (task: AdminTask) => {
    setAdminTasks(prev => [...prev, task]);
  };

  const handleAcknowledgeTask = (taskId: string) => {
    setAdminTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, status: 'IN_PROGRESS' } : t
    ));
  };

  const handleTaskUpdate = (taskId: string, progress: number, updateText?: string) => {
      setAdminTasks(prev => prev.map(t => {
          if (t.id !== taskId) return t;
          
          const newUpdates = updateText 
            ? [...t.updates, { text: updateText, timestamp: new Date().toISOString() }] 
            : t.updates;
          
          const newStatus = progress === 100 ? 'COMPLETED' : 'IN_PROGRESS';

          return {
              ...t,
              progress,
              status: newStatus,
              updates: newUpdates
          };
      }));
  };

  // Filter pending tasks for the current user to show in Popup
  const pendingTasks = currentUser 
    ? adminTasks.filter(t => t.assignedToUserId === currentUser.id && t.status === 'PENDING')
    : [];

  if (showSplash) {
      return <SplashScreen />;
  }

  // If logged out, show the Login screen (Settings component)
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
           <Settings currentUser={null} onLogin={handleLogin} onLogout={handleLogout} />
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case NavView.DASHBOARD:
        return (
            <Dashboard 
                entries={entries} 
                currentUser={currentUser} 
                tasks={adminTasks}
                onAssignTask={handleAssignTask}
                onUpdateTask={handleTaskUpdate} 
            />
        );
      case NavView.CHECK_IN:
        return <CheckIn onCheckIn={handleCheckIn} currentUser={currentUser} />;
      case NavView.INSIGHTS:
        return <Insights historyEntries={entries} />;
      case NavView.SETTINGS:
        return <Settings currentUser={currentUser} onLogin={handleLogin} onLogout={handleLogout} />;
      default:
        return <Dashboard entries={entries} currentUser={currentUser} tasks={adminTasks} />;
    }
  };

  return (
    <>
        <TaskPopup tasks={pendingTasks} onAcknowledge={handleAcknowledgeTask} />
        <Layout currentView={currentView} onNavigate={setCurrentView} currentUser={currentUser}>
            {renderView()}
        </Layout>
    </>
  );
};

export default App;