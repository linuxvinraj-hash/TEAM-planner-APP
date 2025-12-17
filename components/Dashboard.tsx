import React, { useEffect, useState } from 'react';
import { generateTeamSummary } from '../services/geminiService';
import { StandupEntry, TeamSummary, UserProfile, AdminTask } from '../types';
import { MOCK_USERS } from '../App';
import { 
  CheckCircle2, 
  AlertOctagon, 
  Activity, 
  Loader2, 
  TrendingUp,
  BrainCircuit,
  Megaphone,
  Send,
  User as UserIcon,
  Zap,
  Clock,
  CheckCircle,
  BarChart3
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

interface DashboardProps {
  entries: StandupEntry[];
  currentUser: UserProfile;
  tasks?: AdminTask[];
  onAssignTask?: (task: AdminTask) => void;
  onUpdateTask?: (taskId: string, progress: number, updateText?: string) => void;
}

const COLORS = ['#10B981', '#3B82F6', '#EF4444'];

const Dashboard: React.FC<DashboardProps> = ({ entries, currentUser, tasks = [], onAssignTask, onUpdateTask }) => {
  const [summary, setSummary] = useState<TeamSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Admin Task Creation State
  const [taskDescription, setTaskDescription] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(MOCK_USERS[0].id);
  const [assignSuccess, setAssignSuccess] = useState(false);

  // User Task Update State (for local input)
  const [checkpointText, setCheckpointText] = useState('');

  useEffect(() => {
    let mounted = true;
    const fetchSummary = async () => {
      setLoading(true);
      const result = await generateTeamSummary(entries);
      if (mounted) {
        setSummary(result);
        setLoading(false);
      }
    };

    fetchSummary();

    return () => { mounted = false; };
  }, [entries]);

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAssignTask && taskDescription.trim()) {
        const newTask: AdminTask = {
            id: Date.now().toString(),
            description: taskDescription,
            assignedToUserId: selectedUserId,
            assignedByName: currentUser.name,
            status: 'PENDING',
            progress: 0,
            updates: [],
            timestamp: new Date().toISOString()
        };
        onAssignTask(newTask);
        setTaskDescription('');
        setAssignSuccess(true);
        setTimeout(() => setAssignSuccess(false), 3000);
    }
  };

  // Find active task for the current user
  const myActiveTask = tasks.find(t => 
    t.assignedToUserId === currentUser.id && 
    (t.status === 'IN_PROGRESS' || t.status === 'PENDING')
  );

  const handleCheckpointSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (myActiveTask && onUpdateTask && checkpointText.trim()) {
        onUpdateTask(myActiveTask.id, myActiveTask.progress, checkpointText);
        setCheckpointText('');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
        <p className="text-slate-500 font-medium">Synthesizing team consciousness...</p>
      </div>
    );
  }

  if (!summary) return null;

  const chartData = [
    { name: 'Completed', value: summary.completedTasks.length },
    { name: 'Active', value: summary.activeInitiatives.length },
    { name: 'Blocked', value: summary.blockers.length },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BrainCircuit className="w-8 h-8 text-indigo-600" />
            Consolidated Team View
          </h1>
          {/* Removed AI-synthesized analysis text as requested */}
        </div>
        <div className={`px-4 py-2 rounded-full text-sm font-semibold border ${
          summary.overallSentiment === 'Positive' ? 'bg-green-50 text-green-700 border-green-200' :
          summary.overallSentiment === 'Concerned' ? 'bg-red-50 text-red-700 border-red-200' :
          'bg-slate-50 text-slate-700 border-slate-200'
        }`}>
          Sentiment: {summary.overallSentiment}
        </div>
      </header>

      {/* --- USER VIEW: Active Priority Task "Toast" Card --- */}
      {myActiveTask && (
        <div className="bg-gradient-to-r from-indigo-50 to-white rounded-xl shadow-md border border-indigo-200 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-full">
                            <Zap className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Priority Directive</h3>
                            <p className="text-sm text-slate-500">Assigned by {myActiveTask.assignedByName}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-bold text-indigo-600">{myActiveTask.progress}%</span>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6 shadow-sm">
                    <p className="text-slate-800 font-medium">{myActiveTask.description}</p>
                </div>

                {/* Progress Controls */}
                <div className="space-y-4">
                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${myActiveTask.progress}%` }}></div>
                    </div>
                    
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex gap-2">
                             {[25, 50, 75].map(step => (
                                 <button
                                    key={step}
                                    onClick={() => onUpdateTask?.(myActiveTask.id, step)}
                                    className={`px-3 py-1 text-xs font-semibold rounded-md border transition ${
                                        myActiveTask.progress >= step 
                                            ? 'bg-indigo-100 border-indigo-200 text-indigo-700' 
                                            : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300'
                                    }`}
                                 >
                                     {step}%
                                 </button>
                             ))}
                        </div>
                         <button
                            onClick={() => onUpdateTask?.(myActiveTask.id, 100, "Marked as completed")}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-bold transition shadow-sm"
                        >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Mark Done
                        </button>
                    </div>

                    {/* Checkpoint Update Input - STYLE UPDATED: BLACK BACKGROUND */}
                    <form onSubmit={handleCheckpointSubmit} className="flex gap-2 items-center mt-4 pt-4 border-t border-indigo-100">
                        <input 
                            type="text" 
                            value={checkpointText}
                            onChange={(e) => setCheckpointText(e.target.value)}
                            placeholder="Add checkpoint update..."
                            className="flex-1 bg-slate-950 text-white border border-slate-800 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-slate-500 shadow-inner"
                        />
                        <button 
                            type="submit"
                            disabled={!checkpointText.trim()}
                            className="bg-slate-900 hover:bg-slate-800 text-white p-2 rounded-md disabled:opacity-50 transition"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                    
                    {/* Latest Updates Log */}
                    {myActiveTask.updates.length > 0 && (
                        <div className="mt-2 space-y-1">
                             <p className="text-xs font-bold text-slate-400 uppercase">Recent Updates</p>
                             {myActiveTask.updates.slice(-2).map((u, i) => (
                                 <p key={i} className="text-xs text-slate-600 flex gap-2">
                                     <span className="text-slate-400 font-mono">{new Date(u.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                     {u.text}
                                 </p>
                             ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* --- ADMIN VIEW: Task Creation & Monitoring --- */}
      {currentUser.role === 'Admin' && (
        <div className="space-y-6">
            {/* 1. Assignment Panel */}
            <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-700 p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                    <Megaphone className="w-32 h-32 text-white" />
                </div>
                <div className="relative z-10">
                    <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                        <Megaphone className="w-5 h-5 text-indigo-400" />
                        Directives & Priority Assignments
                    </h2>
                    <form onSubmit={handleTaskSubmit} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full space-y-2">
                            <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Assign To</label>
                            <select 
                                value={selectedUserId}
                                onChange={(e) => setSelectedUserId(e.target.value)}
                                className="w-full bg-slate-800 border-slate-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 border"
                            >
                                {MOCK_USERS.filter(u => u.role !== 'Admin').map(user => (
                                    <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-[3] w-full space-y-2">
                            <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Task Directive</label>
                            <input 
                                type="text" 
                                value={taskDescription}
                                onChange={(e) => setTaskDescription(e.target.value)}
                                placeholder="e.g., Immediate fix required for auth service latency..." 
                                className="w-full bg-slate-800 border-slate-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 border placeholder-slate-500"
                            />
                        </div>
                        <button 
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg font-semibold shadow-lg transition-all flex items-center gap-2 min-w-[140px] justify-center"
                        >
                            {assignSuccess ? <CheckCircle2 className="w-5 h-5" /> : <Send className="w-5 h-5" />}
                            {assignSuccess ? 'Sent' : 'Push'}
                        </button>
                    </form>
                </div>
            </div>

            {/* 2. Live Monitoring Section (Separate Section as requested) */}
            {tasks.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                     <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                         <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-indigo-600" />
                            Live Directive Tracking
                         </h2>
                         <span className="text-xs font-medium bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-100">
                             {tasks.filter(t => t.status !== 'COMPLETED').length} Active
                         </span>
                     </div>
                     <div className="divide-y divide-slate-100">
                        {tasks.slice().reverse().map(task => {
                            const assignee = MOCK_USERS.find(u => u.id === task.assignedToUserId);
                            return (
                                <div key={task.id} className="p-4 hover:bg-slate-50 transition flex flex-col md:flex-row gap-4 md:items-center">
                                    {/* User Info */}
                                    <div className="flex items-center gap-3 w-full md:w-1/4">
                                        <img src={assignee?.avatarUrl} alt="" className="w-10 h-10 rounded-full border border-slate-200" />
                                        <div>
                                            <p className="font-semibold text-slate-900 text-sm">{assignee?.name}</p>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase font-bold tracking-wider ${
                                                task.status === 'COMPLETED' ? 'bg-green-100 text-green-700 border-green-200' :
                                                task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                'bg-slate-100 text-slate-600 border-slate-200'
                                            }`}>
                                                {task.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Task Info & Progress */}
                                    <div className="flex-1 space-y-2">
                                        <p className="text-sm text-slate-800">{task.description}</p>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-500 ${
                                                        task.status === 'COMPLETED' ? 'bg-green-500' : 'bg-indigo-500'
                                                    }`} 
                                                    style={{ width: `${task.progress}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-bold text-slate-600 min-w-[30px]">{task.progress}%</span>
                                        </div>
                                    </div>

                                    {/* Latest Update */}
                                    <div className="w-full md:w-1/3 bg-slate-50 border border-slate-100 rounded p-2">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> Latest Update
                                        </p>
                                        {task.updates.length > 0 ? (
                                            <p className="text-xs text-slate-700 italic">"{task.updates[task.updates.length - 1].text}"</p>
                                        ) : (
                                            <p className="text-xs text-slate-400 italic">No updates yet.</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                     </div>
                </div>
            )}
        </div>
      )}

      {/* Common Dashboard Sections */}
      {/* High Priority Alerts */}
      {summary.blockers.some(b => b.isUrgent) && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md shadow-sm">
          <div className="flex items-start">
            <AlertOctagon className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Urgency Monitor: Critical Blockers Detected</h3>
              <ul className="mt-2 list-disc list-inside text-sm text-red-700">
                {summary.blockers.filter(b => b.isUrgent).map((b, idx) => (
                  <li key={idx}><strong>{b.owner}:</strong> {b.description}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Initiatives Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                In Motion (Active)
                </h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium">
                        <tr>
                            <th className="px-6 py-3 w-2/3">Task Description</th>
                            <th className="px-6 py-3 w-1/3">Owner(s)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {summary.activeInitiatives.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                                <td className="px-6 py-4 text-slate-700 align-top">
                                    <div className="flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                        <span>{item.task}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 align-top">
                                    <div className="flex flex-wrap gap-1">
                                        {item.owners.map((owner, oIdx) => (
                                            <span key={oIdx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                                                {owner}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {summary.activeInitiatives.length === 0 && (
                            <tr>
                                <td colSpan={2} className="px-6 py-4 text-center text-slate-400 italic">No active initiatives reported.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
          </div>

          {/* Completed Tasks Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Shipped / Completed
                </h2>
            </div>
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium">
                        <tr>
                            <th className="px-6 py-3 w-2/3">Task Description</th>
                            <th className="px-6 py-3 w-1/3">Owner(s)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {summary.completedTasks.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                                <td className="px-6 py-4 text-slate-700 align-top">
                                    <div className="flex items-start gap-2">
                                        <div className="text-green-500 mt-0.5">✓</div>
                                        <span>{item.task}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 align-top">
                                    <div className="flex flex-wrap gap-1">
                                        {item.owners.map((owner, oIdx) => (
                                            <span key={oIdx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700">
                                                {owner}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        ))}
                         {summary.completedTasks.length === 0 && (
                            <tr>
                                <td colSpan={2} className="px-6 py-4 text-center text-slate-400 italic">No completed tasks reported.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Distribution Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center">
             <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Work Distribution</h3>
             <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* All Blockers List */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              Bottlenecks
            </h2>
            {summary.blockers.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No blockers reported.</p>
            ) : (
              <div className="space-y-3">
                {summary.blockers.map((b, idx) => (
                  <div key={idx} className={`p-3 rounded-md text-sm border ${b.isUrgent ? 'bg-red-50 border-red-100' : 'bg-orange-50 border-orange-100'}`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-slate-700">{b.owner}</span>
                      {b.isUrgent && <span className="text-xs bg-red-200 text-red-800 px-1.5 py-0.5 rounded">URGENT</span>}
                    </div>
                    <p className="text-slate-600">{b.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;