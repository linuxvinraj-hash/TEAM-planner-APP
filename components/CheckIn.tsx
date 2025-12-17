import React, { useState } from 'react';
import { StandupEntry, UserProfile } from '../types';
import { Bot, Github, Loader2, Save, Send, Sparkles } from 'lucide-react';
import { suggestCheckIn } from '../services/geminiService';

interface CheckInProps {
  onCheckIn: (entry: StandupEntry) => void;
  currentUser: UserProfile;
}

const CheckIn: React.FC<CheckInProps> = ({ onCheckIn, currentUser }) => {
  const [yesterday, setYesterday] = useState('');
  const [today, setToday] = useState('');
  const [blockers, setBlockers] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuggested, setIsSuggested] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: StandupEntry = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      avatarUrl: currentUser.avatarUrl,
      timestamp: new Date().toISOString(),
      yesterday,
      today,
      blockers: blockers || 'None'
    };
    onCheckIn(newEntry);
    setYesterday('');
    setToday('');
    setBlockers('');
    setIsSuggested(false);
  };

  const handleMagicFill = async () => {
    setIsProcessing(true);
    // Mocking fetching PR activity
    const mockGitHubLogs = `
        - Merged PR #405: Fix logic in auth service
        - Opened PR #412: Update user schema
        - Commented on PR #399: Needs better error handling
    `;
    
    // Simulate API delay
    await new Promise(r => setTimeout(r, 800)); 
    
    const suggestion = await suggestCheckIn(mockGitHubLogs);
    setYesterday(suggestion.yesterday);
    setToday(suggestion.today);
    
    setIsProcessing(false);
    setIsSuggested(true);
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        
        <div className="bg-indigo-600 p-6 flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-bold text-white">Daily Check-in</h2>
                <p className="text-indigo-100 text-sm">State-Machine Managed Workflow: IN_PROGRESS</p>
            </div>
            <div className="h-10 w-10 bg-indigo-500 rounded-full flex items-center justify-center">
                <Bot className="text-white w-6 h-6" />
            </div>
        </div>

        <div className="p-6">
            {/* Integration Hook */}
          <div className="mb-6 bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center justify-between">
             <div className="flex items-center gap-3">
                 <Github className="w-5 h-5 text-slate-700" />
                 <div>
                     <p className="text-sm font-medium text-slate-900">Connected to GitHub</p>
                     <p className="text-xs text-slate-500">Pull last 24h activity to pre-fill?</p>
                 </div>
             </div>
             <button 
                onClick={handleMagicFill}
                disabled={isProcessing}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 shadow-sm rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
             >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin"/> : <Sparkles className="w-4 h-4 text-amber-500" />}
                {isProcessing ? 'Analyzing...' : 'Auto-Draft'}
             </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Yesterday (Completed)
              </label>
              <textarea
                value={yesterday}
                onChange={(e) => setYesterday(e.target.value)}
                rows={3}
                placeholder="- Fixed PROJ-123..."
                className={`w-full rounded-lg border-slate-300 border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition ${isSuggested ? 'bg-amber-50 border-amber-200' : ''}`}
                required
              />
              {isSuggested && <p className="text-xs text-amber-600 mt-1">* Drafted from git logs. Please review.</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Today (Active)
              </label>
              <textarea
                value={today}
                onChange={(e) => setToday(e.target.value)}
                rows={3}
                placeholder="- Working on..."
                className={`w-full rounded-lg border-slate-300 border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition ${isSuggested ? 'bg-amber-50 border-amber-200' : ''}`}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Blockers (Urgency Monitor Active)
              </label>
              <div className="relative">
                <textarea
                    value={blockers}
                    onChange={(e) => setBlockers(e.target.value)}
                    rows={2}
                    placeholder="e.g., Waiting for API access..."
                    className="w-full rounded-lg border-slate-300 border p-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                />
                {blockers.toLowerCase().includes('waiting') && (
                    <span className="absolute right-3 top-3 inline-flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                )}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
                <button
                    type="submit"
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-semibold shadow-md transition-all transform hover:scale-[1.02]"
                >
                    <Send className="w-4 h-4" />
                    Submit Entry
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckIn;