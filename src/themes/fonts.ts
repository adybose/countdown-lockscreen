/**
 * Locally bundled OFL fonts (DESIGN §7). Each weight is its own fontFamily.
 * The keys are the `fontFamily` names passed to `useFonts` and used in styles.
 */
export const FONT_KEYS = [
  'Inter_400Regular',
  'Inter_600SemiBold',
  'Inter_800ExtraBold',
  'JetBrainsMono_400Regular',
  'JetBrainsMono_700Bold',
  'PressStart2P_400Regular',
  'VT323_400Regular',
  'Fredoka_500Medium',
  'Fredoka_700Bold',
  'PlayfairDisplay_700Bold',
  'Lora_500Medium',
  'Caveat_700Bold',
] as const;

export type FontKey = (typeof FONT_KEYS)[number];

export const FONT_MAP: Record<FontKey, number> = {
  Inter_400Regular: require('../../assets/fonts/Inter_400Regular.ttf'),
  Inter_600SemiBold: require('../../assets/fonts/Inter_600SemiBold.ttf'),
  Inter_800ExtraBold: require('../../assets/fonts/Inter_800ExtraBold.ttf'),
  JetBrainsMono_400Regular: require('../../assets/fonts/JetBrainsMono_400Regular.ttf'),
  JetBrainsMono_700Bold: require('../../assets/fonts/JetBrainsMono_700Bold.ttf'),
  PressStart2P_400Regular: require('../../assets/fonts/PressStart2P_400Regular.ttf'),
  VT323_400Regular: require('../../assets/fonts/VT323_400Regular.ttf'),
  Fredoka_500Medium: require('../../assets/fonts/Fredoka_500Medium.ttf'),
  Fredoka_700Bold: require('../../assets/fonts/Fredoka_700Bold.ttf'),
  PlayfairDisplay_700Bold: require('../../assets/fonts/PlayfairDisplay_700Bold.ttf'),
  Lora_500Medium: require('../../assets/fonts/Lora_500Medium.ttf'),
  Caveat_700Bold: require('../../assets/fonts/Caveat_700Bold.ttf'),
};
