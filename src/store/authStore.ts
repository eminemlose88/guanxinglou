import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Rank = 'S' | 'A' | 'B' | 'C' | 'None';

export interface User {
  id: string;
  username: string;
  role: 'boss' | 'guest'; // 'boss' is a generic term for logged in users now
  rank: Rank;
  status: 'active' | 'banned';
  lastLogin: string;
  secretKey?: string; // Private key for login
}

// Mock initial users
const initialUsers: User[] = [
  { id: '1', username: 'boss_s_01', role: 'boss', rank: 'S', status: 'active', lastLogin: '2024-01-15', secretKey: 'key-s-boss' },
  { id: '2', username: 'vip_a_02', role: 'boss', rank: 'A', status: 'active', lastLogin: '2024-01-14', secretKey: 'key-a-vip' },
  { id: '3', username: 'member_c_99', role: 'boss', rank: 'C', status: 'active', lastLogin: '2024-01-10', secretKey: 'key-c-member' },
  { id: '4', username: 'banned_user', role: 'boss', rank: 'B', status: 'banned', lastLogin: '2023-12-01', secretKey: 'key-b-banned' },
];

interface AuthState {
  isAuthenticated: boolean;
  userRole: 'guest' | 'boss' | 'admin';
  userRank: Rank;
  users: User[]; // For admin management
  
  // Updated login function
  login: (rank: Rank, secretKey: string) => boolean;
  
  register: (username: string) => string; // Returns the new secret key
  updateUserRank: (id: string, newRank: Rank) => void;

  adminLogin: (password: string, secretKey: string) => boolean;
  logout: () => void;
  toggleUserStatus: (id: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      userRole: 'guest',
      userRank: 'None',
      users: initialUsers,
      
      login: (rank: Rank, secretKey: string) => {
        // 1. Check against registered users
        const user = get().users.find(u => u.secretKey === secretKey && u.status === 'active');
        
        if (user) {
          if (user.rank === rank) {
             set({ 
              isAuthenticated: true, 
              userRole: 'boss', 
              userRank: user.rank 
            });
            // Update last login
            set(state => ({
                users: state.users.map(u => u.id === user.id ? { ...u, lastLogin: new Date().toISOString().split('T')[0] } : u)
            }));
            return true;
          }
        }

        // 2. Fallback to system keys (legacy support)
        const validKeys: Record<string, string> = {
          'S': 'key-s-boss',
          'A': 'key-a-vip',
          'B': 'key-b-member',
          'C': 'key-c-guest',
        };

        if (validKeys[rank] === secretKey) {
          set({ 
            isAuthenticated: true, 
            userRole: 'boss', 
            userRank: rank 
          });
          return true;
        }
        return false;
      },

      register: (username: string) => {
        const newKey = `key-${Math.random().toString(36).substr(2, 9)}`;
        const newUser: User = {
            id: Date.now().toString(),
            username,
            role: 'boss',
            rank: 'C', // Default rank
            status: 'active',
            lastLogin: '-',
            secretKey: newKey
        };
        set(state => ({ users: [...state.users, newUser] }));
        return newKey;
      },

      updateUserRank: (id: string, newRank: Rank) => {
        set(state => ({
            users: state.users.map(u => u.id === id ? { ...u, rank: newRank } : u)
        }));
      },

      adminLogin: (password: string, secretKey: string) => {
        if (password === 'admin' && secretKey === 'star-key-2024') {
          set({ 
            isAuthenticated: true, 
            userRole: 'admin',
            userRank: 'S' // Admin has implicit S rank
          });
          return true;
        }
        return false;
      },

      logout: () => set({ isAuthenticated: false, userRole: 'guest', userRank: 'None' }),

      toggleUserStatus: (id) => set((state) => ({
        users: state.users.map(u => 
          u.id === id ? { ...u, status: u.status === 'active' ? 'banned' : 'active' } : u
        )
      })),
    }),
    {
      name: 'auth-storage', // unique name
      storage: createJSONStorage(() => localStorage), // use local storage
      partialize: (state) => ({ users: state.users }), // Only persist users, not auth state (optional, but better to keep login transient)
    }
  )
);
