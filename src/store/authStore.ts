import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export type Rank = 'S' | 'A' | 'B' | 'C' | 'None';

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
  { id: '1', username: 'boss_s_01', role: 'boss', rank: 'S', status: 'active', lastLogin: '2024-01-15', secretKey: 'key-s-boss' },
  { id: '2', username: 'vip_a_02', role: 'boss', rank: 'A', status: 'active', lastLogin: '2024-01-14', secretKey: 'key-a-vip' },
  { id: '3', username: 'member_c_99', role: 'boss', rank: 'C', status: 'active', lastLogin: '2024-01-10', secretKey: 'key-c-member' },
  { id: '4', username: 'banned_user', role: 'boss', rank: 'B', status: 'banned', lastLogin: '2023-12-01', secretKey: 'key-b-banned' },
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

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  userRole: 'guest',
  userRank: 'None',
  users: initialUsers, // Start with mock/empty, will fetch on load
  
  fetchUsers: async () => {
     try {
        const { data, error } = await supabase.from('app_users').select('*');
        if (error) throw error;
        if (data) {
            // Map DB fields to camelCase if needed, or keep snake_case. 
            // Our DB uses snake_case, frontend uses camelCase.
            // Let's do a quick map or assume matching for now. 
            // Actually we should map.
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
             if (data.rank === rank) {
                set({ isAuthenticated: true, userRole: 'boss', userRank: data.rank });
                // Update last_login in background
                supabase.from('app_users').update({ last_login: new Date().toISOString() }).eq('id', data.id).then();
                return true;
             }
        }
    } catch (err) {
        console.warn("DB login failed, falling back to local/mock:", err);
    }

    // 2. Fallback to local users state (including mock data)
    const user = get().users.find(u => u.secretKey === secretKey && u.status === 'active');
    if (user && user.rank === rank) {
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
                rank: 'C',
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
            rank: 'C',
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

  logout: () => set({ isAuthenticated: false, userRole: 'guest', userRank: 'None' }),

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
}));
