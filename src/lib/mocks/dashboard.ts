/**
 * MOCK DATA — replace with real API hooks when backend is wired.
 */

export interface DashboardStat {
  label: string;
  value: string;
  trend?: {
    direction: "up" | "down" | "neutral";
    label: string;
  };
}

export interface DashboardMockData {
  creatorName: string;
  profileComplete: boolean;
  stats: DashboardStat[];
}

export const mockDashboardData: DashboardMockData = {
  creatorName: "Aria Sounds",
  profileComplete: true,
  stats: [
    {
      label: "Followers",
      value: "12,400",
      trend: { direction: "up", label: "+8.2% this month" },
    },
    {
      label: "Earnings",
      value: "$3,240",
      trend: { direction: "up", label: "+12.5% this month" },
    },
    {
      label: "Posts",
      value: "48",
      trend: { direction: "neutral", label: "3 published this week" },
    },
  ],
};

export const mockNewCreatorDashboardData: DashboardMockData = {
  creatorName: "New Creator",
  profileComplete: false,
  stats: [],
};
