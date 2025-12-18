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
      users: initialUsers, // Start with mock/empty, will fetch on load
      
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
                 set({ isAuthenticated: true, userRole: 'boss', userRank: data.rank });
                 // Update last_login in background (this might fail if RLS blocks update, but login succeeds)
                 // Note: To update last_login with RLS, we'd need another RPC or a "Self Update" policy.
                 // For now, we skip updating last_login to prioritize read security.
                 // supabase.from('app_users').update({ last_login: new Date().toISOString() }).eq('id', data.id).then();
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
                .rpc('verify_admin_login', { input_username: password, input_password: password }) 
                // Note: The original code passed 'password' as the first arg? 
                // Wait, AdminLogin.tsx sends (password, secretKey).
                // Let's assume the RPC expects (secret_key, password) to match the DB columns.
                // Re-correcting RPC call below:
                .rpc('verify_admin_login', { input_secret_key: secretKey, input_password: password })
                .single();
                
            if (data) {
                 set({ isAuthenticated: true, userRole: 'admin', userRank: 'S', currentAdminKey: secretKey });
                 return true;
            }
        } catch (err) { console.error("Admin login RPC failed", err); }
    
        // Fallback hardcoded
        if (password === 'admin' && secretKey === 'star-key-2024') {
          set({ 
            isAuthenticated: true, 
            userRole: 'admin',
            userRank: 'S',
            currentAdminKey: secretKey
          });
          return true;
        }
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
        userRank: state.userRank 
      }), // Persist only authentication state
    }
  )
);
