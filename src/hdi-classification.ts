export type HdiCategory = 'Low' | 'Medium' | 'High' | 'Very High';

export const classifyHdi = (hdi: number | null): HdiCategory | null => {
  if (hdi === null) return null;
  if (hdi < 0.550) return 'Low';
  if (hdi < 0.700) return 'Medium';
  if (hdi < 0.800) return 'High';
  return 'Very High';
};
