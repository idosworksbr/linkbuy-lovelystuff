
import React from 'react';

interface CatalogThemeProps {
  theme: 'light' | 'dark' | 'beige' | 'rose' | 'gold' | 'purple' | 'mint' | 'sunset';
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundType?: 'color' | 'image';
  children: React.ReactNode;
}

export const CatalogTheme = ({ theme, backgroundColor, backgroundImage, backgroundType = 'color', children }: CatalogThemeProps) => {
  const getThemeClasses = () => {
    switch (theme) {
      case 'dark':
        return {
          container: 'bg-gray-900 text-white',
          card: 'bg-gray-800 border-gray-700',
          text: 'text-white',
          textMuted: 'text-gray-300',
          button: 'bg-blue-600 hover:bg-blue-700 text-white',
          buttonOutline: 'border-gray-600 text-gray-300 hover:bg-gray-700',
          header: 'border-gray-700 bg-gray-800',
          accent: 'bg-gray-700'
        };
      case 'beige':
        return {
          container: 'bg-amber-50 text-amber-900',
          card: 'bg-amber-100 border-amber-200',
          text: 'text-amber-900',
          textMuted: 'text-amber-700',
          button: 'bg-amber-600 hover:bg-amber-700 text-white',
          buttonOutline: 'border-amber-300 text-amber-700 hover:bg-amber-200',
          header: 'border-amber-200 bg-amber-100',
          accent: 'bg-amber-200'
        };
      case 'rose':
        return {
          container: 'bg-rose-50 text-rose-900',
          card: 'bg-rose-100 border-rose-200',
          text: 'text-rose-900',
          textMuted: 'text-rose-700',
          button: 'bg-rose-600 hover:bg-rose-700 text-white',
          buttonOutline: 'border-rose-300 text-rose-700 hover:bg-rose-200',
          header: 'border-rose-200 bg-rose-100',
          accent: 'bg-rose-200'
        };
      case 'gold':
        return {
          container: 'bg-yellow-50 text-yellow-900',
          card: 'bg-yellow-100 border-yellow-200',
          text: 'text-yellow-900',
          textMuted: 'text-yellow-700',
          button: 'bg-yellow-600 hover:bg-yellow-700 text-white',
          buttonOutline: 'border-yellow-300 text-yellow-700 hover:bg-yellow-200',
          header: 'border-yellow-200 bg-yellow-100',
          accent: 'bg-yellow-200'
        };
      case 'purple':
        return {
          container: 'bg-purple-50 text-purple-900',
          card: 'bg-purple-100 border-purple-200',
          text: 'text-purple-900',
          textMuted: 'text-purple-700',
          button: 'bg-purple-600 hover:bg-purple-700 text-white',
          buttonOutline: 'border-purple-300 text-purple-700 hover:bg-purple-200',
          header: 'border-purple-200 bg-purple-100',
          accent: 'bg-purple-200'
        };
      case 'mint':
        return {
          container: 'bg-emerald-50 text-emerald-900',
          card: 'bg-emerald-100 border-emerald-200',
          text: 'text-emerald-900',
          textMuted: 'text-emerald-700',
          button: 'bg-emerald-600 hover:bg-emerald-700 text-white',
          buttonOutline: 'border-emerald-300 text-emerald-700 hover:bg-emerald-200',
          header: 'border-emerald-200 bg-emerald-100',
          accent: 'bg-emerald-200'
        };
      case 'sunset':
        return {
          container: 'bg-orange-50 text-orange-900',
          card: 'bg-orange-100 border-orange-200',
          text: 'text-orange-900',
          textMuted: 'text-orange-700',
          button: 'bg-orange-600 hover:bg-orange-700 text-white',
          buttonOutline: 'border-orange-300 text-orange-700 hover:bg-orange-200',
          header: 'border-orange-200 bg-orange-100',
          accent: 'bg-orange-200'
        };
      default: // light
        return {
          container: 'bg-white text-gray-900',
          card: 'bg-white border-gray-200',
          text: 'text-gray-900',
          textMuted: 'text-gray-600',
          button: 'bg-blue-500 hover:bg-blue-600 text-white',
          buttonOutline: 'border-gray-300 text-gray-700 hover:bg-gray-50',
          header: 'border-gray-100 bg-white',
          accent: 'bg-gray-100'
        };
    }
  };

  const themeClasses = getThemeClasses();
  
  const containerStyle: React.CSSProperties = {};
  
  if (theme === 'light') {
    if (backgroundType === 'image' && backgroundImage) {
      containerStyle.backgroundImage = `url(${backgroundImage})`;
      containerStyle.backgroundSize = 'cover';
      containerStyle.backgroundPosition = 'center';
      containerStyle.backgroundAttachment = 'fixed';
    } else if (backgroundType === 'color' && backgroundColor) {
      containerStyle.backgroundColor = backgroundColor;
    }
  }

  return (
    <div 
      className={`min-h-screen ${theme === 'light' ? '' : themeClasses.container}`}
      style={containerStyle}
      data-theme={theme}
    >
      {children}
    </div>
  );
};

export const useThemeClasses = (theme: 'light' | 'dark' | 'beige' | 'rose' | 'gold' | 'purple' | 'mint' | 'sunset') => {
  switch (theme) {
    case 'dark':
      return {
        container: 'bg-gray-900 text-white',
        card: 'bg-gray-800 border-gray-700',
        text: 'text-white',
        textMuted: 'text-gray-300',
        button: 'bg-blue-600 hover:bg-blue-700 text-white',
        buttonOutline: 'border-gray-600 text-gray-300 hover:bg-gray-700',
        header: 'border-gray-700 bg-gray-800',
        accent: 'bg-gray-700'
      };
    case 'beige':
      return {
        container: 'bg-amber-50 text-amber-900',
        card: 'bg-amber-100 border-amber-200',
        text: 'text-amber-900',
        textMuted: 'text-amber-700',
        button: 'bg-amber-600 hover:bg-amber-700 text-white',
        buttonOutline: 'border-amber-300 text-amber-700 hover:bg-amber-200',
        header: 'border-amber-200 bg-amber-100',
        accent: 'bg-amber-200'
      };
    case 'rose':
      return {
        container: 'bg-rose-50 text-rose-900',
        card: 'bg-rose-100 border-rose-200',
        text: 'text-rose-900',
        textMuted: 'text-rose-700',
        button: 'bg-rose-600 hover:bg-rose-700 text-white',
        buttonOutline: 'border-rose-300 text-rose-700 hover:bg-rose-200',
        header: 'border-rose-200 bg-rose-100',
        accent: 'bg-rose-200'
      };
    case 'gold':
      return {
        container: 'bg-yellow-50 text-yellow-900',
        card: 'bg-yellow-100 border-yellow-200',
        text: 'text-yellow-900',
        textMuted: 'text-yellow-700',
        button: 'bg-yellow-600 hover:bg-yellow-700 text-white',
        buttonOutline: 'border-yellow-300 text-yellow-700 hover:bg-yellow-200',
        header: 'border-yellow-200 bg-yellow-100',
        accent: 'bg-yellow-200'
      };
    case 'purple':
      return {
        container: 'bg-purple-50 text-purple-900',
        card: 'bg-purple-100 border-purple-200',
        text: 'text-purple-900',
        textMuted: 'text-purple-700',
        button: 'bg-purple-600 hover:bg-purple-700 text-white',
        buttonOutline: 'border-purple-300 text-purple-700 hover:bg-purple-200',
        header: 'border-purple-200 bg-purple-100',
        accent: 'bg-purple-200'
      };
    case 'mint':
      return {
        container: 'bg-emerald-50 text-emerald-900',
        card: 'bg-emerald-100 border-emerald-200',
        text: 'text-emerald-900',
        textMuted: 'text-emerald-700',
        button: 'bg-emerald-600 hover:bg-emerald-700 text-white',
        buttonOutline: 'border-emerald-300 text-emerald-700 hover:bg-emerald-200',
        header: 'border-emerald-200 bg-emerald-100',
        accent: 'bg-emerald-200'
      };
    case 'sunset':
      return {
        container: 'bg-orange-50 text-orange-900',
        card: 'bg-orange-100 border-orange-200',
        text: 'text-orange-900',
        textMuted: 'text-orange-700',
        button: 'bg-orange-600 hover:bg-orange-700 text-white',
        buttonOutline: 'border-orange-300 text-orange-700 hover:bg-orange-200',
        header: 'border-orange-200 bg-orange-100',
        accent: 'bg-orange-200'
      };
    default: // light
      return {
        container: 'bg-white text-gray-900',
        card: 'bg-white border-gray-200',
        text: 'text-gray-900',
        textMuted: 'text-gray-600',
        button: 'bg-blue-500 hover:bg-blue-600 text-white',
        buttonOutline: 'border-gray-300 text-gray-700 hover:bg-gray-50',
        header: 'border-gray-100 bg-white',
        accent: 'bg-gray-100'
      };
  }
};
