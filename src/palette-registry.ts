import {
  interpolatePlasma,
  interpolateViridis,
  interpolateInferno,
  interpolateMagma,
  interpolateCividis,
  interpolateTurbo,
} from 'd3-scale-chromatic';
import type { Interpolator } from './color-scale';

export type PaletteId = 'plasma' | 'viridis' | 'inferno' | 'magma' | 'cividis' | 'turbo';

export type PaletteDefinition = {
  readonly id: PaletteId;
  readonly label: string;
  readonly interpolator: Interpolator;
};

export const PALETTES: readonly PaletteDefinition[] = [
  { id: 'plasma', label: 'Plasma', interpolator: interpolatePlasma },
  { id: 'viridis', label: 'Viridis', interpolator: interpolateViridis },
  { id: 'inferno', label: 'Inferno', interpolator: interpolateInferno },
  { id: 'magma', label: 'Magma', interpolator: interpolateMagma },
  { id: 'cividis', label: 'Cividis', interpolator: interpolateCividis },
  { id: 'turbo', label: 'Turbo', interpolator: interpolateTurbo },
];

export const DEFAULT_PALETTE_ID: PaletteId = 'plasma';

export const getPaletteById = (id: PaletteId): PaletteDefinition => {
  const palette = PALETTES.find((p) => p.id === id);
  if (!palette) {
    throw new Error(`Unknown palette id: ${id}`);
  }
  return palette;
};
