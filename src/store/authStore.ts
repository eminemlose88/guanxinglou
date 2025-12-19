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
  isAuthenticated: boolean;
  userRole: 'guest' | 'boss' | 'admin';
  userRank: Rank;
  users: User[]; 
  currentAdminKey?: string; // Store admin key for secure operations
  
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
      users: [], // Start empty, rely on fetchUsers
      
      fetchUsers: async () => {
        try {
            const adminKey = get().currentAdminKey;
            // Only fetch if we have an admin key. 
            // If not logged in as admin, we shouldn't be fetching users anyway.
            if (!adminKey) return; 

            const { data, error } = await supabase.rpc('admin_list_users', { admin_secret: adminKey });
            
            if (error) throw error;
            if (data) set({ users: data });
        } catch (err) { console.error("Error fetching users:", err); }
      },
    
      login: async (rank: Rank, secretKey: string) => {
        // 1. Try DB login via Secure RPC (No direct table access)
        try {
            const { data, error } = await supabase
                .rpc('verify_user_key', { input_key: secretKey })
                .single();
            
            if (data) {
                 // Ignore rank check for login, just check if active and key matches
                 // Update: user said "register login can view girls"
                 // So we don't strictly check rank input here, we just use the user's actual rank
                 set({ isAuthenticated: true, userRole: 'boss', userRank: (data as any).rank });
                 // Update last_login in background (this might fail if RLS blocks update, but login succeeds)
                 // Note: To update last_login with RLS, we'd need another RPC or a "Self Update" policy.
                 // For now, we skip updating last_login to prioritize read security.
                 // supabase.from('app_users').update({ last_login: new Date().toISOString() }).eq('id', data.id).then();
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
            // Note: We are using the new secure RPC 'secure_register_user' which handles rate limiting.
            // Direct insert into 'app_users' is now revoked for security.
            const { data, error } = await supabase
                .rpc('secure_register_user', {
                    input_username: username,
                    input_secret_key: newKey
                })
                .single();
            
            if (error) throw error;
            
            // Update local state
            if (data) {
                 // The RPC returns jsonb, we need to cast it to our User type
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
            // No fallback, registration must succeed in DB
            throw err; // Propagate error to UI
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
        // Check DB for admin via Secure RPC
        try {
            const { data } = await supabase
                .rpc('verify_admin_login', { input_secret_key: secretKey, input_password: password })
                .single();
                
            if (data) {
                 set({ isAuthenticated: true, userRole: 'admin', userRank: 'S', currentAdminKey: secretKey });
                 return true;
            }
        } catch (err) { console.error("Admin login RPC failed", err); }
    
        return false;
      },
    
      logout: () => {
        localStorage.removeItem('auth-storage'); // Optional: clear storage on logout explicitly if you want to wipe it completely
        set({ isAuthenticated: false, userRole: 'guest', userRank: 'None', currentAdminKey: undefined });
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
        userRole: state.userRole, 
        userRank: state.userRank,
        currentAdminKey: state.currentAdminKey
      }), // Persist authentication state and admin key
    }
  )
);
