import { TextStyle, ViewStyle } from 'react-native';

export const Colors = {
  background: '#FFFDF9',
  surface: '#FFF8F0',
  primary: '#F4784A',
  primaryLight: '#FDE8DC',
  textPrimary: '#1A1208',
  textSecondary: '#7A6A5A',
  border: '#EFE5DA',
  success: '#4CAF7D',
  error: '#E05252',
  white: '#FFFFFF',
} as const;

export const Fonts = {
  heading: 'InstrumentSerif_400Regular',
  headingBold: 'InstrumentSerif_400Regular',
  body: 'HelveticaNeue',
  bodyMedium: 'HelveticaNeue-Medium',
  bodySemiBold: 'HelveticaNeue-Medium',
  bodyBold: 'HelveticaNeue-Bold',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const BorderRadius = {
  card: 16,
  input: 12,
  pill: 50,
  button: 12,
} as const;

export const Shadow: ViewStyle = {
  shadowColor: '#F4784A',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 4,
  elevation: 2,
};

export const Typography = {
  h1: {
    fontFamily: Fonts.headingBold,
    fontSize: 28,
    lineHeight: 36,
    color: Colors.textPrimary,
  } as TextStyle,
  h2: {
    fontFamily: Fonts.headingBold,
    fontSize: 22,
    lineHeight: 28,
    color: Colors.textPrimary,
  } as TextStyle,
  h3: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    lineHeight: 24,
    color: Colors.textPrimary,
  } as TextStyle,
  body: {
    fontFamily: Fonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: Colors.textPrimary,
  } as TextStyle,
  bodySmall: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
  } as TextStyle,
  label: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textPrimary,
  } as TextStyle,
  caption: {
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 16,
    color: Colors.textSecondary,
  } as TextStyle,
};
