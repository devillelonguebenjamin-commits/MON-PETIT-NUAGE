'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CremationTiming, Material, WeightClass } from '@/lib/types';

/**
 * État du configurateur (note de cadrage §2).
 *
 * Zustand plutôt que Context : le champ de gravure se met à jour à chaque
 * frappe avec un aperçu à côté ; les sélecteurs granulaires évitent de
 * re-rendre tout le tunnel. `persist` couvre l'onglet fermé et repris plus
 * tard, ce qui arrive souvent sur un parcours de huit minutes commencé dans
 * un moment difficile.
 *
 * L'étape courante n'est volontairement pas dans ce store : elle vit dans
 * l'URL, pour que le bouton retour du navigateur ne fasse pas sortir du tunnel.
 */

export interface EngravingState {
  petName: string;
  petKind: 'chien' | 'chat';
  birthDate: string;
  farewellDate: string;
  engraving: string;
}

export interface ConfiguratorState {
  version: 1;
  bundleSlug: string | null;
  weightClass: WeightClass | null;
  material: Material | null;
  photo: { assetId: string; previewUrl: string } | null;
  engraving: EngravingState;
  optionSlugs: string[];
  cremationTiming: CremationTiming;
  cartId: string | null;
}

export interface ConfiguratorActions {
  setBundle: (slug: string) => void;
  setWeightClass: (weightClass: WeightClass) => void;
  setMaterial: (material: Material) => void;
  setPhoto: (photo: { assetId: string; previewUrl: string } | null) => void;
  updateEngraving: (patch: Partial<EngravingState>) => void;
  toggleOption: (slug: string) => void;
  setCremationTiming: (timing: CremationTiming) => void;
  reset: () => void;
}

const emptyEngraving: EngravingState = {
  petName: '',
  petKind: 'chien',
  birthDate: '',
  farewellDate: '',
  engraving: '',
};

/**
 * Défauts intelligents : le coffret Signature est présélectionné et le
 * matériau le plus courant est retenu, mais aucune option payante ne l'est —
 * une case cochée d'avance sur un produit de deuil serait un dark pattern.
 */
const initialState: ConfiguratorState = {
  version: 1,
  bundleSlug: 'coffret-signature',
  weightClass: null,
  material: 'bois_clair',
  photo: null,
  engraving: emptyEngraving,
  optionSlugs: [],
  cremationTiming: 'post_cremation',
  cartId: null,
};

export const useConfigurator = create<ConfiguratorState & ConfiguratorActions>()(
  persist(
    (set) => ({
      ...initialState,

      setBundle: (slug) => set({ bundleSlug: slug }),
      setWeightClass: (weightClass) => set({ weightClass }),
      setMaterial: (material) => set({ material }),
      setPhoto: (photo) => set({ photo }),

      updateEngraving: (patch) =>
        set((state) => ({ engraving: { ...state.engraving, ...patch } })),

      toggleOption: (slug) =>
        set((state) => ({
          optionSlugs: state.optionSlugs.includes(slug)
            ? state.optionSlugs.filter((existing) => existing !== slug)
            : [...state.optionSlugs, slug],
        })),

      setCremationTiming: (cremationTiming) => set({ cremationTiming }),
      reset: () => set(initialState),
    }),
    {
      name: 'mpn-configurateur',
      version: 1,
      partialize: ({ version, bundleSlug, weightClass, material, photo, engraving, optionSlugs, cremationTiming, cartId }) =>
        ({ version, bundleSlug, weightClass, material, photo, engraving, optionSlugs, cremationTiming, cartId }),
    },
  ),
);
