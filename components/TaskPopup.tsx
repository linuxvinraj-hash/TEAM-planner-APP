import React from 'react';
import { AdminTask } from '../types';
import { AlertCircle, CheckCircle, Bell } from 'lucide-react';

interface TaskPopupProps {
  tasks: AdminTask[];
  onAcknowledge: (taskId: string) => void;
}

const TaskPopup: React.FC<TaskPopupProps> = ({ tasks, onAcknowledge }) => {
  if (tasks.length === 0) return null;

  const currentTask = tasks[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 transform transition-all scale-100">
        <div className="bg-red-600 p-6 flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-full animate-pulse">
             <Bell className="w-8 h-8 text-white" />
          </div>
          <div>
             <h2 className="text-xl font-bold text-white">Priority Action Required</h2>
             <p className="text-red-100 text-sm">You have a new directive from leadership.</p>
          </div>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assigned By</p>
            <div className="flex items-center gap-2">
                <span className="font-medium text-slate-900">{currentTask.assignedByName}</span>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">Admin</span>
            </div>
          </div>

          <div className="space-y-2">
             <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Directive</p>
             <div className="bg-red-50 border border-red-100 p-4 rounded-lg">
                <p className="text-lg font-medium text-slate-800 leading-relaxed">
                    "{currentTask.description}"
                </p>
             </div>
          </div>

          <div className="pt-2">
            <button
                onClick={() => onAcknowledge(currentTask.id)}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl font-bold text-lg transition-all active:scale-[0.98] shadow-lg hover:shadow-xl"
            >
                <CheckCircle className="w-6 h-6" />
                I'm on it
            </button>
            <p className="text-center text-xs text-slate-400 mt-4">
                Acknowledging this task updates your status on the admin dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskPopup;