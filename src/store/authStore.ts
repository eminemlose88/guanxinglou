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

interface AuthState {
  isAuthenticated: boolean; // User authentication status
  isAdminAuthenticated: boolean; // Admin authentication status
  userRole: 'guest' | 'boss' | 'admin'; // Kept for legacy/UI, but mostly for User role now
  userRank: Rank;
  users: User[]; 
  currentAdminKey?: string; // Store admin key for secure operations
  
  // Actions
  fetchUsers: () => Promise<void>;
  login: (rank: Rank, secretKey: string) => Promise<boolean>;
  register: (username: string) => Promise<string>; 
  updateUserRank: (id: string, newRank: Rank) => Promise<void>;
  adminLogin: (password: string, secretKey: string) => Promise<boolean>;
  logoutUser: () => void;
  logoutAdmin: () => void;
  // Deprecated single logout, keep for safety if needed or remove
  logout: () => void; 
  toggleUserStatus: (id: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      isAdminAuthenticated: false,
      userRole: 'guest',
      userRank: 'None',
      users: [], 
      
      fetchUsers: async () => {
        try {
            const adminKey = get().currentAdminKey;
            if (!adminKey) return; 

            const { data, error } = await supabase.rpc('admin_list_users', { admin_secret: adminKey });
            
            if (error) throw error;
            if (data) set({ users: data });
        } catch (err) { console.error("Error fetching users:", err); }
      },
    
      login: async (rank: Rank, secretKey: string) => {
        try {
            const { data, error } = await supabase
                .rpc('verify_user_key', { input_key: secretKey })
                .single();
            
            if (data) {
                 set({ isAuthenticated: true, userRole: 'boss', userRank: (data as any).rank });
                 return true;
            }
        } catch (err) {
            console.warn("DB login failed:", err);
        }
    
        return false;
      },
    
      register: async (username: string) => {
        const newKey = `key-${Math.random().toString(36).substr(2, 9)}`;
        
        try {
            const { data, error } = await supabase
                .rpc('secure_register_user', {
                    input_username: username,
                    input_secret_key: newKey
                })
                .single();
            
            if (error) throw error;
            
            if (data) {
                 const u: any = data;
                 const newUser: User = {
                    id: u.id,
                    username: u.username,
                    role: u.role,
                    rank: u.rank,
                    status: u.status,
                    lastLogin: u.last_login,
                    secretKey: u.secret_key
                };
                set(state => ({ users: [...state.users, newUser] }));
            }
        } catch (err) {
            console.error("DB register failed:", err);
            throw err; 
        }
        
        return newKey;
      },
    
      updateUserRank: async (id: string, newRank: Rank) => {
        try {
            const adminKey = get().currentAdminKey;
            if (!adminKey) throw new Error("Unauthorized");

            const { error } = await supabase.rpc('admin_manage_user', {
                admin_secret: adminKey,
                target_user_id: id,
                new_rank: newRank
            });
            if (error) throw error;
        } catch (err) { console.error("Error updating user rank:", err); }
    
        set(state => ({
            users: state.users.map(u => u.id === id ? { ...u, rank: newRank } : u)
        }));
      },
    
      adminLogin: async (password: string, secretKey: string) => {
        try {
            const { data } = await supabase
                .rpc('verify_admin_login', { input_secret_key: secretKey, input_password: password })
                .single();
                
            if (data) {
                 // Only update Admin state
                 set({ isAdminAuthenticated: true, currentAdminKey: secretKey });
                 // Optionally set userRole to admin if we want the UI to reflect it, 
                 // but we are separating concerns. Let's keep userRole for "User Context".
                 return true;
            }
        } catch (err) { console.error("Admin login RPC failed", err); }
    
        return false;
      },
    
      logoutUser: () => {
        set({ isAuthenticated: false, userRole: 'guest', userRank: 'None' });
      },

      logoutAdmin: () => {
        set({ isAdminAuthenticated: false, currentAdminKey: undefined });
      },

      logout: () => {
         // Legacy: clear both? Or just user?
         // Let's clear both to be safe for legacy calls, but we will replace usages.
         set({ isAuthenticated: false, isAdminAuthenticated: false, userRole: 'guest', userRank: 'None', currentAdminKey: undefined });
      },
    
      toggleUserStatus: async (id: string) => {
        const users = get().users;
        const user = users.find(u => u.id === id);
        if (user) {
            const newStatus = user.status === 'active' ? 'banned' : 'active';
            try {
                const adminKey = get().currentAdminKey;
                if (!adminKey) throw new Error("Unauthorized");
    
                const { error } = await supabase.rpc('admin_manage_user', {
                    admin_secret: adminKey,
                    target_user_id: id,
                    new_status: newStatus
                });
                if (error) throw error;
            } catch (err) { console.error("Error toggling user status:", err); }

            set(state => ({
                users: state.users.map(u => u.id === id ? { ...u, status: newStatus } : u)
            }));
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated, 
        isAdminAuthenticated: state.isAdminAuthenticated,
        userRole: state.userRole, 
        userRank: state.userRank,
        currentAdminKey: state.currentAdminKey
      }), 
    }
  )
);
