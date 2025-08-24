import { createSlice } from '@reduxjs/toolkit';

export interface SystemHealthState {
  isLoading: boolean;
  error: string | null;
}

const initialState: SystemHealthState = {
  isLoading: false,
  error: null,
};

const systemHealthSlice = createSlice({
  name: 'systemHealth',
  initialState,
  reducers: {},
});

export default systemHealthSlice.reducer;
