import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProfileState {
  profileId: number | null;
  setProfileId: (id: number) => void;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profileId: null,
      setProfileId: (id) => set({ profileId: id }),
      clearProfile: () => set({ profileId: null }),
    }),
    {
      name: 'placement_profile_id',
    }
  )
);
