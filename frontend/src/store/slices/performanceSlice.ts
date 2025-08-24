import { createSlice } from '@reduxjs/toolkit';

export interface PerformanceState {
  isLoading: boolean;
  error: string | null;
}

const initialState: PerformanceState = {
  isLoading: false,
  error: null,
};

const performanceSlice = createSlice({
  name: 'performance',
  initialState,
  reducers: {},
});

export default performanceSlice.reducer;
