// src/app/dashboard/models.ts
export interface StatItem {
  id: number;
  title: string;
  value: string;
  hint?: string;
  icon?: string; // nome do ícone ou svg
}

export interface ActivityItem {
  id: string;
  title: string;
  subtitle?: string;
  timeAgo?: string;
}

export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  adminUsers: number;
  employeeUsers: number;
  commonUsers: number;
  generatedAt: string;
}
