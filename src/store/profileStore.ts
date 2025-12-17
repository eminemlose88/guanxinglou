import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { profiles as initialProfiles, Profile } from '../data/profiles';

interface ProfileState {
  profiles: Profile[];
  addProfile: (profile: Profile) => void;
  updateProfile: (id: string, updatedProfile: Partial<Profile>) => void;
  deleteProfile: (id: string) => void;
  getProfile: (id: string) => Profile | undefined;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profiles: initialProfiles,
      addProfile: (profile) => set((state) => ({ profiles: [...state.profiles, profile] })),
      updateProfile: (id, updatedProfile) => set((state) => ({
        profiles: state.profiles.map((p) => (p.id === id ? { ...p, ...updatedProfile } : p)),
      })),
      deleteProfile: (id) => set((state) => ({
        profiles: state.profiles.filter((p) => p.id !== id),
      })),
      getProfile: (id) => get().profiles.find((p) => p.id === id),
    }),
    {
      name: 'profile-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
