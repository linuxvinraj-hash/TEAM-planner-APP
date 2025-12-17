export enum UserStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  IN_MEETING = 'IN_MEETING'
}

export interface UserProfile {
  id: string;
  name: string;
  role: 'Engineer' | 'Admin';
  avatarUrl: string;
}

export interface StandupEntry {
  id: string;
  userId: string;
  userName: string;
  avatarUrl: string;
  timestamp: string;
  yesterday: string;
  today: string;
  blockers: string;
}

export interface TeamSummary {
  completedTasks: {
    task: string;
    owners: string[];
  }[];
  activeInitiatives: {
    task: string;
    owners: string[];
  }[];
  blockers: {
    description: string;
    owner: string;
    isUrgent: boolean;
  }[];
  overallSentiment: 'Positive' | 'Neutral' | 'Concerned';
}

export interface InsightMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface TaskUpdate {
  text: string;
  timestamp: string;
}

export interface AdminTask {
  id: string;
  description: string;
  assignedToUserId: string;
  assignedByName: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  progress: number;
  updates: TaskUpdate[];
  timestamp: string;
}

export enum NavView {
  DASHBOARD = 'DASHBOARD',
  CHECK_IN = 'CHECK_IN',
  INSIGHTS = 'INSIGHTS',
  SETTINGS = 'SETTINGS'
}