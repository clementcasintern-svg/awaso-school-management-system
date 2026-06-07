import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const useAuthStore = create<AuthState>(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          const response = await axios.post(`${API_URL}/auth/login`, {
            email,
            password
          });

          const { data } = response.data;
          set({
            user: data.user,
            token: data.accessToken,
            isAuthenticated: true
          });

          // Set default authorization header
          axios.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
        } catch (error) {
          console.error('Login failed:', error);
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false
        });
        delete axios.defaults.headers.common['Authorization'];
      },

      setUser: (user: User) => {
        set({ user });
      }
    }),
    {
      name: 'auth-store'
    }
  )
);
