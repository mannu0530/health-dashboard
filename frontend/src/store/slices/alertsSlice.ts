import { createSlice } from '@reduxjs/toolkit';

export interface AlertsState {
  isLoading: boolean;
  error: string | null;
}

const initialState: AlertsState = {
  isLoading: false,
  error: null,
};

const alertsSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {},
});

export default alertsSlice.reducer;
