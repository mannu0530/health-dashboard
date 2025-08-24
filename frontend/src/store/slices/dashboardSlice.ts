import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface DashboardMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
}

export interface PerformanceData {
  time: string;
  cpu: number;
  memory: number;
  disk: number;
}

export interface AlertData {
  severity: string;
  count: number;
  color: string;
}

export interface RecentAlert {
  id: number;
  message: string;
  severity: string;
  time: string;
}

export interface DashboardState {
  metrics: DashboardMetrics | null;
  performanceData: PerformanceData[];
  alertData: AlertData[];
  recentAlerts: RecentAlert[];
  isLoading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  metrics: null,
  performanceData: [],
  alertData: [],
  recentAlerts: [],
  isLoading: false,
  error: null,
};

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - in real app, this would come from API
      const mockMetrics: DashboardMetrics = {
        cpu: 65,
        memory: 78,
        disk: 45,
        network: 32,
      };

      const mockPerformanceData: PerformanceData[] = [
        { time: '00:00', cpu: 45, memory: 60, disk: 30 },
        { time: '04:00', cpu: 55, memory: 65, disk: 35 },
        { time: '08:00', cpu: 75, memory: 80, disk: 45 },
        { time: '12:00', cpu: 85, memory: 85, disk: 55 },
        { time: '16:00', cpu: 70, memory: 75, disk: 50 },
        { time: '20:00', cpu: 60, memory: 70, disk: 40 },
      ];

      const mockAlertData: AlertData[] = [
        { severity: 'critical', count: 2, color: '#f44336' },
        { severity: 'warning', count: 5, color: '#ff9800' },
        { severity: 'info', count: 8, color: '#2196f3' },
        { severity: 'success', count: 15, color: '#4caf50' },
      ];

      const mockRecentAlerts: RecentAlert[] = [
        { id: 1, message: 'High CPU usage detected', severity: 'warning', time: '2 min ago' },
        { id: 2, message: 'Database connection restored', severity: 'success', time: '5 min ago' },
        { id: 3, message: 'Memory usage above threshold', severity: 'critical', time: '8 min ago' },
        { id: 4, message: 'Backup completed successfully', severity: 'info', time: '12 min ago' },
      ];

      return {
        metrics: mockMetrics,
        performanceData: mockPerformanceData,
        alertData: mockAlertData,
        recentAlerts: mockRecentAlerts,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch dashboard data');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateMetrics: (state, action: PayloadAction<DashboardMetrics>) => {
      state.metrics = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.metrics = action.payload.metrics;
        state.performanceData = action.payload.performanceData;
        state.alertData = action.payload.alertData;
        state.recentAlerts = action.payload.recentAlerts;
        state.error = null;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, updateMetrics } = dashboardSlice.actions;
export default dashboardSlice.reducer;
