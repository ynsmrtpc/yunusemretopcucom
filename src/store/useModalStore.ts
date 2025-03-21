import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ReactNode } from 'react';

interface ModalStore {
  isOpen: boolean;
  view: ReactNode | null;
  title: string;
  description?: string;
  openModal: (props: { view: ReactNode; title: string; description?: string }) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalStore>()(
  devtools(
    (set) => ({
      isOpen: false,
      view: null,
      title: '',
      description: '',
      openModal: ({ view, title, description }) => {
        set({ isOpen: true, view, title, description });
      },
      closeModal: () => set({ isOpen: false, view: null, title: '', description: '' }),
    }),
    { name: 'modal-store' }
  )
); 