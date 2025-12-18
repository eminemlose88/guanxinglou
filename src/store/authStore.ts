import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

export type Rank = 'S' | 'A' | 'B' | 'C' | 'None' | 'Common' | 'VIP';

export interface User {
  id: string;
  username: string;
  role: 'boss' | 'guest'; 
  rank: Rank;
  status: 'active' | 'banned';
  lastLogin: string;
  secretKey?: string; 
}

// Mock initial users for fallback
const initialUsers: User[] = [
  { id: '1', username: 'boss_s_01', role: 'boss', rank: 'VIP', status: 'active', lastLogin: '2024-01-15', secretKey: 'key-s-boss' },
  { id: '2', username: 'vip_a_02', role: 'boss', rank: 'Common', status: 'active', lastLogin: '2024-01-14', secretKey: 'key-a-vip' },
];

interface AuthState {
  isAuthenticated: boolean;
  userRole: 'guest' | 'boss' | 'admin';
  userRank: Rank;
  users: User[]; 
  
  // Actions
  fetchUsers: () => Promise<void>;
  login: (rank: Rank, secretKey: string) => Promise<boolean>;
  register: (username: string) => Promise<string>; 
  updateUserRank: (id: string, newRank: Rank) => Promise<void>;
  adminLogin: (password: string, secretKey: string) => Promise<boolean>;
  logout: () => void;
  toggleUserStatus: (id: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      userRole: 'guest',
      userRank: 'None',
      users: initialUsers, // Start with mock/empty, will fetch on load
      
      fetchUsers: async () => {
         try {
            const { data, error } = await supabase.from('app_users').select('*');
            if (error) throw error;
            if (data) {
                const mappedUsers: User[] = data.map((u: any) => ({
                    id: u.id,
                    username: u.username,
                    role: u.role,
                    rank: u.rank,
                    status: u.status,
                    lastLogin: u.last_login,
                    secretKey: u.secret_key
                }));
                set({ users: mappedUsers });
            }
         } catch (err) {
             console.error("Fetch users failed (using fallback):", err);
         }
      },
    
      login: async (rank: Rank, secretKey: string) => {
        // 1. Try DB login
        try {
            const { data, error } = await supabase
                .from('app_users')
                .select('*')
                .eq('secret_key', secretKey)
                .eq('status', 'active')
                .single();
            
            if (data) {
                 // Ignore rank check for login, just check if active and key matches
                 // Update: user said "register login can view girls"
                 // So we don't strictly check rank input here, we just use the user's actual rank
                 set({ isAuthenticated: true, userRole: 'boss', userRank: data.rank });
                 // Update last_login in background
                 supabase.from('app_users').update({ last_login: new Date().toISOString() }).eq('id', data.id).then();
                 return true;
            }
        } catch (err) {
            console.warn("DB login failed, falling back to local/mock:", err);
        }
    
        // 2. Fallback to local users state (including mock data)
        const user = get().users.find(u => u.secretKey === secretKey && u.status === 'active');
        if (user) {
            set({ isAuthenticated: true, userRole: 'boss', userRank: user.rank });
            return true;
        }
    
        return false;
      },
    
      register: async (username: string) => {
        const newKey = `key-${Math.random().toString(36).substr(2, 9)}`;
        
        try {
            const { data, error } = await supabase
                .from('app_users')
                .insert([{
                    username,
                    role: 'boss',
                    rank: 'Common', // Default rank is Common
                    status: 'active',
                    secret_key: newKey,
                    last_login: new Date().toISOString()
                }])
                .select()
                .single();
            
            if (error) throw error;
            
            // Update local state
            if (data) {
                 const newUser: User = {
                    id: data.id,
                    username: data.username,
                    role: data.role,
                    rank: data.rank,
                    status: data.status,
                    lastLogin: data.last_login,
                    secretKey: data.secret_key
                };
                set(state => ({ users: [...state.users, newUser] }));
            }
        } catch (err) {
            console.error("DB register failed, using local fallback:", err);
            // Fallback
            const newUser: User = {
                id: Date.now().toString(),
                username,
                role: 'boss',
                rank: 'Common',
                status: 'active',
                lastLogin: new Date().toISOString(),
                secretKey: newKey
            };
            set(state => ({ users: [...state.users, newUser] }));
        }
        
        return newKey;
      },
    
      updateUserRank: async (id: string, newRank: Rank) => {
        try {
            await supabase.from('app_users').update({ rank: newRank }).eq('id', id);
        } catch (err) { console.error(err); }
    
        set(state => ({
            users: state.users.map(u => u.id === id ? { ...u, rank: newRank } : u)
        }));
      },
    
      adminLogin: async (password: string, secretKey: string) => {
        // Check DB for admin
        try {
            const { data } = await supabase
                .from('admins')
                .select('*')
                .eq('secret_key', secretKey)
                .eq('password', password) // In real app, hash check
                .single();
                
            if (data) {
                 set({ isAuthenticated: true, userRole: 'admin', userRank: 'S' });
                 return true;
            }
        } catch (err) { }
    
        // Fallback hardcoded
        if (password === 'admin' && secretKey === 'star-key-2024') {
          set({ 
            isAuthenticated: true, 
            userRole: 'admin',
            userRank: 'S' 
          });
          return true;
        }
        return false;
      },
    
      logout: () => {
        localStorage.removeItem('auth-storage'); // Optional: clear storage on logout explicitly if you want to wipe it completely
        set({ isAuthenticated: false, userRole: 'guest', userRank: 'None' });
      },
    
      toggleUserStatus: async (id) => {
        // Optimistic update
        const user = get().users.find(u => u.id === id);
        if (!user) return;
        
        const newStatus = user.status === 'active' ? 'banned' : 'active';
        
        try {
            await supabase.from('app_users').update({ status: newStatus }).eq('id', id);
        } catch (err) { console.error(err); }
    
        set((state) => ({
          users: state.users.map(u => 
            u.id === id ? { ...u, status: newStatus } : u
          )
        }));
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated, 
        userRole: state.userRole, 
        userRank: state.userRank 
      }), // Persist only authentication state
    }
  )
);
