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

export const useProfileStore = create<ProfileState>((set, get) => ({
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
    
    // Helper to safely parse JSON arrays
    const parseArray = (val: any): string[] => {
        if (!val) return [];
        if (Array.isArray(val)) return val;
        
        if (typeof val === 'string') {
            const cleanVal = val.trim();
            
            // 1. Try PostgreSQL Array format: {url1,url2}
            if (cleanVal.startsWith('{') && cleanVal.endsWith('}')) {
                const content = cleanVal.slice(1, -1);
                if (!content) return [];
                // Simple comma split (assuming URLs don't contain commas)
                // Also strip double quotes if PG added them
                return content.split(',').map(s => s.replace(/^"|"$/g, '').trim()).filter(Boolean);
            }

            // 2. Try JSON format
            try {
                const parsed = JSON.parse(cleanVal);
                if (Array.isArray(parsed)) return parsed;
                // Double JSON encoded case
                if (typeof parsed === 'string') {
                    try {
                        const deepParsed = JSON.parse(parsed);
                        if (Array.isArray(deepParsed)) return deepParsed;
                    } catch {}
                }
            } catch (e) {
                // 3. Fallback: if it looks like a URL, wrap it
                if (cleanVal.startsWith('http')) return [cleanVal];
                
                console.warn('Failed to parse array:', val);
            }
        }
        return [];
    };

    try {
      console.log('Fetching profiles from Supabase...');
      // Fetch ALL profiles including deleted ones, let frontend filter
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
          console.error('Supabase fetch error:', error);
          throw error;
      }
      
      console.log('Supabase raw data:', data);

      // Map snake_case from DB to camelCase for frontend
      if (!data || data.length === 0) {
        console.warn('Supabase returned empty data. Check RLS policies if data exists in DB.');
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
          images: parseArray(p.images),
          videos: parseArray(p.videos),
          availability: p.availability || 'Available',
          isDeleted: p.is_deleted || false
        }));
        console.log('Mapped profiles:', mappedProfiles);
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
      // AND explicitly stringify arrays to ensure they are stored as JSON strings ["..."] 
      // instead of PostgreSQL arrays {...} in text fields.
      const sanitizedProfile = {
          ...profile,
          images: JSON.stringify(profile.images || []),
          videos: JSON.stringify(profile.videos || []),
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
      if (updatedProfile.images !== undefined) {
          sanitizedUpdate.images = JSON.stringify(updatedProfile.images || []);
      }
      if (updatedProfile.videos !== undefined) {
          sanitizedUpdate.videos = JSON.stringify(updatedProfile.videos || []);
      }
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
}));
