import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { profiles as initialMockProfiles, Profile } from '../data/profiles';
import { useAuthStore } from './authStore'; // Import auth store to get admin key

interface ProfileState {
  profiles: Profile[];
  loading: boolean;
  error: string | null;
  lastFetched: number;
  
  fetchProfiles: (force?: boolean) => Promise<void>;
  addProfile: (profile: Omit<Profile, 'id'>) => Promise<void>;
  updateProfile: (id: string, updatedProfile: Partial<Profile>) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  restoreProfile: (id: string) => Promise<void>;
  permanentlyDeleteProfile: (id: string) => Promise<void>;
  getProfile: (id: string) => Profile | undefined;
}

const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profiles: [],
      loading: false,
      error: null,
      lastFetched: 0,

      fetchProfiles: async (force = false) => {
        const { lastFetched, profiles, loading } = get();
        const now = Date.now();

        // Prevent redundant fetches
        if (!force && profiles.length > 0 && (now - lastFetched < CACHE_DURATION)) {
          return;
        }

        // Avoid double loading
        if (loading) return;

        set({ loading: true });
        try {
          // Fetch ALL profiles including deleted ones, let frontend filter
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;
          
          // Map snake_case from DB to camelCase for frontend
          if (!data || data.length === 0) {
            set({ profiles: [], loading: false, lastFetched: now });
          } else {
            const mappedProfiles: Profile[] = data.map((p: any) => ({
              id: p.id,
              name: p.name || '',
              rank: p.rank || 'Common', // Default to Common if undefined
              classType: p.class_type || 'None',
              description: p.description || '',
              location: p.location || '',
              age: p.age || 18,
              height: p.height || 160,
              weight: p.weight || 45,
              cup: p.cup || 'A',
              occupation: p.occupation || '',
              isVirgin: p.is_virgin || false,
              periodDate: p.period_date || '',
              tattooSmoke: p.tattoo_smoke || '无',
              limits: p.limits || '',
              acceptSM: p.accept_sm || false,
              noCondom: p.no_condom || false,
              creampie: p.creampie || false,
              oral: p.oral || false,
              liveTogether: p.live_together || false,
              overnight: p.overnight || false,
              travel: p.travel || '',
              monthlyBudget: p.monthly_budget || '',
              monthlyDays: p.monthly_days || '',
              shortTermBudget: p.short_term_budget || '',
              paymentSplit: p.payment_split || '',
              reason: p.reason || '',
              startTime: p.start_time || '',
              bonus: p.bonus || '',
              stats: p.stats || { charm: 60, intelligence: 60, agility: 60 },
              price: p.price || '',
              images: p.images || [],
              videos: p.videos || [],
              availability: p.availability || 'Available',
              isDeleted: p.is_deleted || false
            }));
            set({ profiles: mappedProfiles, loading: false, lastFetched: now });
          }
        } catch (err: any) {
          console.error('Error fetching profiles:', err);
          // Stop loading, keep existing profiles or empty if none
          set({ loading: false, error: err.message, lastFetched: now });
        }
      },

  addProfile: async (profile) => {
    try {
      // Get Admin Key
      const adminKey = useAuthStore.getState().currentAdminKey;
      if (!adminKey) throw new Error("Unauthorized: Missing Admin Key");

      // Sanitize Data: Ensure arrays are never null/undefined
      const sanitizedProfile = {
          ...profile,
          images: profile.images || [],
          videos: profile.videos || [],
          stats: profile.stats || { charm: 60, intelligence: 60, agility: 60 }
      };

      const { data, error } = await supabase
        .rpc('admin_cud_profile', {
            admin_secret: adminKey,
            operation_type: 'INSERT',
            profile_data: sanitizedProfile
        });

      if (error) throw error;
      if (data) {
         // Map the returned snake_case data back to camelCase profile
         // Actually the RPC returns the row from `profiles` table, which is snake_case.
         const p: any = data;
         const newProfile: Profile = {
              id: p.id,
              name: p.name || '',
              rank: p.rank || 'Common',
              classType: p.class_type || 'None',
              description: p.description || '',
              location: p.location || '',
              age: p.age || 18,
              height: p.height || 160,
              weight: p.weight || 45,
              cup: p.cup || 'A',
              occupation: p.occupation || '',
              isVirgin: p.is_virgin || false,
              periodDate: p.period_date || '',
              tattooSmoke: p.tattoo_smoke || '无',
              limits: p.limits || '',
              acceptSM: p.accept_sm || false,
              noCondom: p.no_condom || false,
              creampie: p.creampie || false,
              oral: p.oral || false,
              liveTogether: p.live_together || false,
              overnight: p.overnight || false,
              travel: p.travel || '',
              monthlyBudget: p.monthly_budget || '',
              monthlyDays: p.monthly_days || '',
              shortTermBudget: p.short_term_budget || '',
              paymentSplit: p.payment_split || '',
              reason: p.reason || '',
              startTime: p.start_time || '',
              bonus: p.bonus || '',
              stats: p.stats || { charm: 60, intelligence: 60, agility: 60 },
              price: p.price || '',
              images: p.images || [],
              videos: p.videos || [],
              availability: p.availability || 'Available',
              isDeleted: p.is_deleted || false
         };
        set((state) => ({ profiles: [newProfile, ...state.profiles] }));
      }
    } catch (err: any) {
      console.error('Error adding profile:', err);
      // Fallback for demo if RPC fails or not deployed yet
      const newProfile = { ...profile, id: Date.now().toString(), isDeleted: false } as Profile;
      set((state) => ({ profiles: [newProfile, ...state.profiles] }));
    }
  },

  updateProfile: async (id, updatedProfile) => {
    try {
      const adminKey = useAuthStore.getState().currentAdminKey;
      if (!adminKey) throw new Error("Unauthorized: Missing Admin Key");

      // Sanitize Partial Updates
      const sanitizedUpdate = { ...updatedProfile };
      if (updatedProfile.images === null) sanitizedUpdate.images = [];
      if (updatedProfile.videos === null) sanitizedUpdate.videos = [];
      // Note: We don't force empty array if key is missing (undefined), 
      // because it's a partial update. Only if it's explicitly null.

      // RPC handles partial updates via COALESCE, so we just send what we have
      const { error } = await supabase
        .rpc('admin_cud_profile', {
            admin_secret: adminKey,
            operation_type: 'UPDATE',
            profile_data: sanitizedUpdate,
            target_id: id
        });

      if (error) throw error;

      set((state) => ({
        profiles: state.profiles.map((p) => (p.id === id ? { ...p, ...sanitizedUpdate } : p)),
      }));
    } catch (err: any) {
      console.error('Error updating profile:', err);
      // Optimistic update
      set((state) => ({
        profiles: state.profiles.map((p) => (p.id === id ? { ...p, ...updatedProfile } : p)),
      }));
    }
  },

  deleteProfile: async (id) => {
    try {
      const adminKey = useAuthStore.getState().currentAdminKey;
      if (!adminKey) throw new Error("Unauthorized: Missing Admin Key");

      // Soft delete via RPC
      const { error } = await supabase
        .rpc('admin_cud_profile', {
            admin_secret: adminKey,
            operation_type: 'DELETE',
            target_id: id
        });

      if (error) throw error;

      set((state) => ({
        profiles: state.profiles.map((p) => (p.id === id ? { ...p, isDeleted: true } : p)),
      }));
    } catch (err: any) {
      console.error('Error soft deleting profile:', err);
      // Optimistic update
      set((state) => ({
        profiles: state.profiles.map((p) => (p.id === id ? { ...p, isDeleted: true } : p)),
      }));
    }
  },

  restoreProfile: async (id) => {
    try {
      const adminKey = useAuthStore.getState().currentAdminKey;
      if (!adminKey) throw new Error("Unauthorized: Missing Admin Key");

      const { error } = await supabase
        .rpc('admin_cud_profile', {
            admin_secret: adminKey,
            operation_type: 'RESTORE',
            target_id: id
        });

      if (error) throw error;

      set((state) => ({
        profiles: state.profiles.map((p) => (p.id === id ? { ...p, isDeleted: false } : p)),
      }));
    } catch (err: any) {
      console.error('Error restoring profile:', err);
      // Optimistic update
      set((state) => ({
        profiles: state.profiles.map((p) => (p.id === id ? { ...p, isDeleted: false } : p)),
      }));
    }
  },

  permanentlyDeleteProfile: async (id) => {
    try {
      const adminKey = useAuthStore.getState().currentAdminKey;
      if (!adminKey) throw new Error("Unauthorized: Missing Admin Key");

      const { error } = await supabase
        .rpc('admin_cud_profile', {
            admin_secret: adminKey,
            operation_type: 'HARD_DELETE',
            target_id: id
        });

      if (error) throw error;

      set((state) => ({
        profiles: state.profiles.filter((p) => p.id !== id),
      }));
    } catch (err: any) {
      console.error('Error permanently deleting profile:', err);
      // Optimistic delete
      set((state) => ({
        profiles: state.profiles.filter((p) => p.id !== id),
      }));
    }
  },

  getProfile: (id) => get().profiles.find((p) => p.id === id),
    }),
    {
      name: 'profile-storage', // unique name
      storage: createJSONStorage(() => localStorage), // use localStorage
      partialize: (state) => ({ profiles: state.profiles, lastFetched: state.lastFetched }), // only persist data and timestamp
    }
  )
);
