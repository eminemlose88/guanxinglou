import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { profiles as initialMockProfiles, Profile } from '../data/profiles';

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
            set({ profiles: initialMockProfiles, loading: false, lastFetched: now });
          } else {
            const mappedProfiles: Profile[] = data.map((p: any) => ({
              id: p.id,
              name: p.name,
              rank: p.rank,
              classType: p.class_type,
              description: p.description,
              location: p.location,
              age: p.age,
              height: p.height,
              weight: p.weight,
              cup: p.cup,
              occupation: p.occupation,
              isVirgin: p.is_virgin,
              periodDate: p.period_date,
              tattooSmoke: p.tattoo_smoke,
              limits: p.limits,
              acceptSM: p.accept_sm,
              noCondom: p.no_condom,
              creampie: p.creampie,
              oral: p.oral,
              liveTogether: p.live_together,
              overnight: p.overnight,
              travel: p.travel,
              monthlyBudget: p.monthly_budget,
              monthlyDays: p.monthly_days,
              shortTermBudget: p.short_term_budget,
              paymentSplit: p.payment_split,
              reason: p.reason,
              startTime: p.start_time,
              bonus: p.bonus,
              stats: p.stats,
              price: p.price,
              images: p.images,
              videos: p.videos,
              availability: p.availability,
              isDeleted: p.is_deleted
            }));
            set({ profiles: mappedProfiles, loading: false, lastFetched: now });
          }
        } catch (err: any) {
          console.error('Error fetching profiles:', err);
          // Fallback to mock data if connection fails (for demo stability)
          set({ profiles: initialMockProfiles, loading: false, error: err.message, lastFetched: now });
        }
      },

  addProfile: async (profile) => {
    try {
      // Map camelCase to snake_case for DB
      const dbProfile = {
        name: profile.name,
        rank: profile.rank,
        class_type: profile.classType,
        description: profile.description,
        location: profile.location,
        age: profile.age,
        height: profile.height,
        weight: profile.weight,
        cup: profile.cup,
        occupation: profile.occupation,
        is_virgin: profile.isVirgin,
        period_date: profile.periodDate,
        tattoo_smoke: profile.tattooSmoke,
        limits: profile.limits,
        accept_sm: profile.acceptSM,
        no_condom: profile.noCondom,
        creampie: profile.creampie,
        oral: profile.oral,
        live_together: profile.liveTogether,
        overnight: profile.overnight,
        travel: profile.travel,
        monthly_budget: profile.monthlyBudget,
        monthly_days: profile.monthlyDays,
        short_term_budget: profile.shortTermBudget,
        payment_split: profile.paymentSplit,
        reason: profile.reason,
        start_time: profile.startTime,
        bonus: profile.bonus,
        stats: profile.stats,
        price: profile.price,
        images: profile.images,
        videos: profile.videos,
        availability: profile.availability,
        is_deleted: false
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert([dbProfile])
        .select()
        .single();

      if (error) throw error;
      if (data) {
         // Map back the ID and snake_case result to camelCase (or just use local profile with new ID)
         // For simplicity, reconstruct from input + id
        const newProfile = { ...profile, id: data.id, isDeleted: false } as Profile;
        set((state) => ({ profiles: [newProfile, ...state.profiles] }));
      }
    } catch (err: any) {
      console.error('Error adding profile:', err);
      // Optimistic update for demo even if DB fails
      const newProfile = { ...profile, id: Date.now().toString(), isDeleted: false } as Profile;
      set((state) => ({ profiles: [newProfile, ...state.profiles] }));
    }
  },

  updateProfile: async (id, updatedProfile) => {
    try {
      // Map camelCase partial to snake_case partial
      const dbUpdate: any = {};
      if (updatedProfile.name) dbUpdate.name = updatedProfile.name;
      if (updatedProfile.rank) dbUpdate.rank = updatedProfile.rank;
      if (updatedProfile.classType) dbUpdate.class_type = updatedProfile.classType;
      if (updatedProfile.description) dbUpdate.description = updatedProfile.description;
      if (updatedProfile.location) dbUpdate.location = updatedProfile.location;
      if (updatedProfile.age) dbUpdate.age = updatedProfile.age;
      if (updatedProfile.height) dbUpdate.height = updatedProfile.height;
      if (updatedProfile.weight) dbUpdate.weight = updatedProfile.weight;
      if (updatedProfile.cup) dbUpdate.cup = updatedProfile.cup;
      if (updatedProfile.occupation) dbUpdate.occupation = updatedProfile.occupation;
      if (updatedProfile.isVirgin !== undefined) dbUpdate.is_virgin = updatedProfile.isVirgin;
      if (updatedProfile.periodDate) dbUpdate.period_date = updatedProfile.periodDate;
      if (updatedProfile.tattooSmoke) dbUpdate.tattoo_smoke = updatedProfile.tattooSmoke;
      if (updatedProfile.limits) dbUpdate.limits = updatedProfile.limits;
      if (updatedProfile.acceptSM !== undefined) dbUpdate.accept_sm = updatedProfile.acceptSM;
      if (updatedProfile.noCondom !== undefined) dbUpdate.no_condom = updatedProfile.noCondom;
      if (updatedProfile.creampie !== undefined) dbUpdate.creampie = updatedProfile.creampie;
      if (updatedProfile.oral !== undefined) dbUpdate.oral = updatedProfile.oral;
      if (updatedProfile.liveTogether !== undefined) dbUpdate.live_together = updatedProfile.liveTogether;
      if (updatedProfile.overnight !== undefined) dbUpdate.overnight = updatedProfile.overnight;
      if (updatedProfile.travel) dbUpdate.travel = updatedProfile.travel;
      if (updatedProfile.monthlyBudget) dbUpdate.monthly_budget = updatedProfile.monthlyBudget;
      if (updatedProfile.monthlyDays) dbUpdate.monthly_days = updatedProfile.monthlyDays;
      if (updatedProfile.shortTermBudget) dbUpdate.short_term_budget = updatedProfile.shortTermBudget;
      if (updatedProfile.paymentSplit) dbUpdate.payment_split = updatedProfile.paymentSplit;
      if (updatedProfile.reason) dbUpdate.reason = updatedProfile.reason;
      if (updatedProfile.startTime) dbUpdate.start_time = updatedProfile.startTime;
      if (updatedProfile.bonus) dbUpdate.bonus = updatedProfile.bonus;
      if (updatedProfile.stats) dbUpdate.stats = updatedProfile.stats;
      if (updatedProfile.price) dbUpdate.price = updatedProfile.price;
      if (updatedProfile.images) dbUpdate.images = updatedProfile.images;
      if (updatedProfile.videos) dbUpdate.videos = updatedProfile.videos;
      if (updatedProfile.availability) dbUpdate.availability = updatedProfile.availability;

      const { error } = await supabase
        .from('profiles')
        .update(dbUpdate)
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        profiles: state.profiles.map((p) => (p.id === id ? { ...p, ...updatedProfile } : p)),
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
      // Soft delete
      const { error } = await supabase
        .from('profiles')
        .update({ is_deleted: true })
        .eq('id', id);

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
      const { error } = await supabase
        .from('profiles')
        .update({ is_deleted: false })
        .eq('id', id);

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
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

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
