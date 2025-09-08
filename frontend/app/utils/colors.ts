// Unified Color Scheme for Almasya
export const colors = {
  // Primary Colors
  primary: '#211c31',      // Main brand color - deep purple
  secondary: '#251b43',    // Secondary brand color - purple
  
  // White as main color
  white: '#ffffff',
  whiteAlpha: {
    50: 'rgba(255, 255, 255, 0.5)',
    80: 'rgba(255, 255, 255, 0.8)',
    90: 'rgba(255, 255, 255, 0.9)',
  },
  
  // Text Colors
  text: {
    primary: '#1f2937',    // Dark gray for main text
    secondary: '#6b7280',  // Medium gray for secondary text
    muted: '#9ca3af',      // Light gray for muted text
    inverse: '#ffffff',    // White text for dark backgrounds
  },
  
  // Background Colors
  bg: {
    primary: '#ffffff',    // White main background
    secondary: '#f9fafb',  // Light gray background
    tertiary: '#f3f4f6',   // Slightly darker gray
    glass: 'rgba(255, 255, 255, 0.8)', // Glass effect
  },
  
  // Border Colors
  border: {
    light: '#e5e7eb',      // Light border
    medium: '#d1d5db',     // Medium border
    dark: '#9ca3af',       // Dark border
  },
  
  // Button Colors
  button: {
    primary: {
      bg: '#211c31',
      hover: '#251b43',
      text: '#ffffff',
    },
    secondary: {
      bg: '#251b43',
      hover: '#211c31',
      text: '#ffffff',
    },
    outline: {
      bg: 'transparent',
      hover: '#f3f4f6',
      text: '#211c31',
      border: '#211c31',
    },
    ghost: {
      bg: 'transparent',
      hover: '#f3f4f6',
      text: '#6b7280',
    },
  },
  
  // Status Colors
  status: {
    success: '#10b981',    // Green
    warning: '#f59e0b',    // Yellow
    error: '#ef4444',      // Red
    info: '#3b82f6',       // Blue
  },
  
  // Focus Colors
  focus: {
    ring: '#211c31',
    border: '#211c31',
  },
};

// Tailwind CSS classes for easy use
export const colorClasses = {
  // Backgrounds
  bgPrimary: 'bg-white',
  bgSecondary: 'bg-gray-50',
  bgGlass: 'bg-white/80 backdrop-blur',
  
  // Text
  textPrimary: 'text-gray-900',
  textSecondary: 'text-gray-600',
  textMuted: 'text-gray-500',
  textBrand: 'text-[#211c31]',
  textBrandSecondary: 'text-[#251b43]',
  
  // Borders
  borderLight: 'border-gray-200',
  borderMedium: 'border-gray-300',
  borderBrand: 'border-[#211c31]',
  
  // Buttons
  btnPrimary: 'bg-[#211c31] hover:bg-[#251b43] text-white',
  btnSecondary: 'bg-[#251b43] hover:bg-[#211c31] text-white',
  btnOutline: 'bg-transparent hover:bg-gray-50 text-[#211c31] border-[#211c31]',
  btnGhost: 'bg-transparent hover:bg-gray-50 text-gray-600',
  
  // Focus
  focusRing: 'focus:ring-2 focus:ring-[#211c31] focus:border-transparent',
  
  // Gradients
  gradientBg: 'bg-gradient-to-br from-gray-50 via-white to-gray-50',
  
  // Placeholders
  placeholder: 'placeholder:text-gray-500 placeholder:opacity-100',
};
