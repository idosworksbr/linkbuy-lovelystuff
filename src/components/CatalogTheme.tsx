
import React from 'react';

interface CatalogThemeProps {
  theme: 'light' | 'dark' | 'beige' | 'rose' | 'gold' | 'purple' | 'mint' | 'sunset' | 'ocean' | 'forest' | 'lavender' | 'coral' | 'charcoal' | 'cream';
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
          container: 'bg-gray-900 text-gray-100',
          card: 'bg-gray-800 border-gray-700',
          text: 'text-gray-100',
          textMuted: 'text-gray-300',
          button: 'bg-blue-600 hover:bg-blue-700 text-white',
          buttonOutline: 'border-gray-600 text-gray-300 hover:bg-gray-700',
          header: 'border-gray-700 bg-gray-800',
          accent: 'bg-gray-700'
        };
      case 'beige':
        return {
          container: 'bg-amber-50 text-amber-950',
          card: 'bg-amber-100/80 border-amber-200',
          text: 'text-amber-950',
          textMuted: 'text-amber-800',
          button: 'bg-amber-700 hover:bg-amber-800 text-white',
          buttonOutline: 'border-amber-400 text-amber-900 hover:bg-amber-200',
          header: 'border-amber-200 bg-amber-100/90',
          accent: 'bg-amber-200'
        };
      case 'rose':
        return {
          container: 'bg-rose-50 text-rose-950',
          card: 'bg-rose-100/80 border-rose-200',
          text: 'text-rose-950',
          textMuted: 'text-rose-800',
          button: 'bg-rose-600 hover:bg-rose-700 text-white',
          buttonOutline: 'border-rose-400 text-rose-900 hover:bg-rose-200',
          header: 'border-rose-200 bg-rose-100/90',
          accent: 'bg-rose-200'
        };
      case 'gold':
        return {
          container: 'bg-yellow-50 text-yellow-950',
          card: 'bg-yellow-100/80 border-yellow-300',
          text: 'text-yellow-950',
          textMuted: 'text-yellow-800',
          button: 'bg-yellow-600 hover:bg-yellow-700 text-white',
          buttonOutline: 'border-yellow-400 text-yellow-900 hover:bg-yellow-200',
          header: 'border-yellow-300 bg-yellow-100/90',
          accent: 'bg-yellow-200'
        };
      case 'purple':
        return {
          container: 'bg-purple-50 text-purple-950',
          card: 'bg-purple-100/80 border-purple-200',
          text: 'text-purple-950',
          textMuted: 'text-purple-800',
          button: 'bg-purple-600 hover:bg-purple-700 text-white',
          buttonOutline: 'border-purple-400 text-purple-900 hover:bg-purple-200',
          header: 'border-purple-200 bg-purple-100/90',
          accent: 'bg-purple-200'
        };
      case 'mint':
        return {
          container: 'bg-emerald-50 text-emerald-950',
          card: 'bg-emerald-100/80 border-emerald-200',
          text: 'text-emerald-950',
          textMuted: 'text-emerald-800',
          button: 'bg-emerald-600 hover:bg-emerald-700 text-white',
          buttonOutline: 'border-emerald-400 text-emerald-900 hover:bg-emerald-200',
          header: 'border-emerald-200 bg-emerald-100/90',
          accent: 'bg-emerald-200'
        };
      case 'sunset':
        return {
          container: 'bg-orange-50 text-orange-950',
          card: 'bg-orange-100/80 border-orange-200',
          text: 'text-orange-950',
          textMuted: 'text-orange-800',
          button: 'bg-orange-600 hover:bg-orange-700 text-white',
          buttonOutline: 'border-orange-400 text-orange-900 hover:bg-orange-200',
          header: 'border-orange-200 bg-orange-100/90',
          accent: 'bg-orange-200'
        };
      case 'ocean':
        return {
          container: 'bg-blue-950 text-blue-50',
          card: 'bg-blue-900/90 border-blue-800',
          text: 'text-blue-50',
          textMuted: 'text-blue-200',
          button: 'bg-blue-600 hover:bg-blue-700 text-white',
          buttonOutline: 'border-blue-700 text-blue-200 hover:bg-blue-800',
          header: 'border-blue-800 bg-blue-900/90',
          accent: 'bg-blue-800'
        };
      case 'forest':
        return {
          container: 'bg-green-950 text-green-50',
          card: 'bg-green-900/90 border-green-800',
          text: 'text-green-50',
          textMuted: 'text-green-200',
          button: 'bg-green-600 hover:bg-green-700 text-white',
          buttonOutline: 'border-green-700 text-green-200 hover:bg-green-800',
          header: 'border-green-800 bg-green-900/90',
          accent: 'bg-green-800'
        };
      case 'lavender':
        return {
          container: 'bg-violet-50 text-violet-950',
          card: 'bg-violet-100/80 border-violet-200',
          text: 'text-violet-950',
          textMuted: 'text-violet-800',
          button: 'bg-violet-600 hover:bg-violet-700 text-white',
          buttonOutline: 'border-violet-400 text-violet-900 hover:bg-violet-200',
          header: 'border-violet-200 bg-violet-100/90',
          accent: 'bg-violet-200'
        };
      case 'coral':
        return {
          container: 'bg-red-50 text-red-950',
          card: 'bg-red-100/80 border-red-200',
          text: 'text-red-950',
          textMuted: 'text-red-800',
          button: 'bg-red-600 hover:bg-red-700 text-white',
          buttonOutline: 'border-red-400 text-red-900 hover:bg-red-200',
          header: 'border-red-200 bg-red-100/90',
          accent: 'bg-red-200'
        };
      case 'charcoal':
        return {
          container: 'bg-slate-900 text-slate-100',
          card: 'bg-slate-800/90 border-slate-700',
          text: 'text-slate-100',
          textMuted: 'text-slate-300',
          button: 'bg-slate-700 hover:bg-slate-600 text-white',
          buttonOutline: 'border-slate-600 text-slate-300 hover:bg-slate-700',
          header: 'border-slate-700 bg-slate-800/90',
          accent: 'bg-slate-700'
        };
      case 'cream':
        return {
          container: 'bg-stone-100 text-stone-900',
          card: 'bg-stone-50/80 border-stone-200',
          text: 'text-stone-900',
          textMuted: 'text-stone-700',
          button: 'bg-stone-700 hover:bg-stone-800 text-white',
          buttonOutline: 'border-stone-400 text-stone-800 hover:bg-stone-200',
          header: 'border-stone-200 bg-stone-50/90',
          accent: 'bg-stone-200'
        };
      default: // light
        return {
          container: 'bg-white text-gray-900',
          card: 'bg-white border-gray-200',
          text: 'text-gray-900',
          textMuted: 'text-gray-700',
          button: 'bg-blue-500 hover:bg-blue-600 text-white',
          buttonOutline: 'border-gray-300 text-gray-800 hover:bg-gray-50',
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

export const useThemeClasses = (theme: 'light' | 'dark' | 'beige' | 'rose' | 'gold' | 'purple' | 'mint' | 'sunset' | 'ocean' | 'forest' | 'lavender' | 'coral' | 'charcoal' | 'cream') => {
  switch (theme) {
    case 'dark':
      return {
        container: 'bg-gray-900 text-gray-100',
        card: 'bg-gray-800 border-gray-700',
        text: 'text-gray-100',
        textMuted: 'text-gray-300',
        button: 'bg-blue-600 hover:bg-blue-700 text-white',
        buttonOutline: 'border-gray-600 text-gray-300 hover:bg-gray-700',
        header: 'border-gray-700 bg-gray-800',
        accent: 'bg-gray-700'
      };
    case 'beige':
      return {
        container: 'bg-amber-50 text-amber-950',
        card: 'bg-amber-100/80 border-amber-200',
        text: 'text-amber-950',
        textMuted: 'text-amber-800',
        button: 'bg-amber-700 hover:bg-amber-800 text-white',
        buttonOutline: 'border-amber-400 text-amber-900 hover:bg-amber-200',
        header: 'border-amber-200 bg-amber-100/90',
        accent: 'bg-amber-200'
      };
    case 'rose':
      return {
        container: 'bg-rose-50 text-rose-950',
        card: 'bg-rose-100/80 border-rose-200',
        text: 'text-rose-950',
        textMuted: 'text-rose-800',
        button: 'bg-rose-600 hover:bg-rose-700 text-white',
        buttonOutline: 'border-rose-400 text-rose-900 hover:bg-rose-200',
        header: 'border-rose-200 bg-rose-100/90',
        accent: 'bg-rose-200'
      };
    case 'gold':
      return {
        container: 'bg-yellow-50 text-yellow-950',
        card: 'bg-yellow-100/80 border-yellow-300',
        text: 'text-yellow-950',
        textMuted: 'text-yellow-800',
        button: 'bg-yellow-600 hover:bg-yellow-700 text-white',
        buttonOutline: 'border-yellow-400 text-yellow-900 hover:bg-yellow-200',
        header: 'border-yellow-300 bg-yellow-100/90',
        accent: 'bg-yellow-200'
      };
    case 'purple':
      return {
        container: 'bg-purple-50 text-purple-950',
        card: 'bg-purple-100/80 border-purple-200',
        text: 'text-purple-950',
        textMuted: 'text-purple-800',
        button: 'bg-purple-600 hover:bg-purple-700 text-white',
        buttonOutline: 'border-purple-400 text-purple-900 hover:bg-purple-200',
        header: 'border-purple-200 bg-purple-100/90',
        accent: 'bg-purple-200'
      };
    case 'mint':
      return {
        container: 'bg-emerald-50 text-emerald-950',
        card: 'bg-emerald-100/80 border-emerald-200',
        text: 'text-emerald-950',
        textMuted: 'text-emerald-800',
        button: 'bg-emerald-600 hover:bg-emerald-700 text-white',
        buttonOutline: 'border-emerald-400 text-emerald-900 hover:bg-emerald-200',
        header: 'border-emerald-200 bg-emerald-100/90',
        accent: 'bg-emerald-200'
      };
    case 'sunset':
      return {
        container: 'bg-orange-50 text-orange-950',
        card: 'bg-orange-100/80 border-orange-200',
        text: 'text-orange-950',
        textMuted: 'text-orange-800',
        button: 'bg-orange-600 hover:bg-orange-700 text-white',
        buttonOutline: 'border-orange-400 text-orange-900 hover:bg-orange-200',
        header: 'border-orange-200 bg-orange-100/90',
        accent: 'bg-orange-200'
      };
    case 'ocean':
      return {
        container: 'bg-blue-950 text-blue-50',
        card: 'bg-blue-900/90 border-blue-800',
        text: 'text-blue-50',
        textMuted: 'text-blue-200',
        button: 'bg-blue-600 hover:bg-blue-700 text-white',
        buttonOutline: 'border-blue-700 text-blue-200 hover:bg-blue-800',
        header: 'border-blue-800 bg-blue-900/90',
        accent: 'bg-blue-800'
      };
    case 'forest':
      return {
        container: 'bg-green-950 text-green-50',
        card: 'bg-green-900/90 border-green-800',
        text: 'text-green-50',
        textMuted: 'text-green-200',
        button: 'bg-green-600 hover:bg-green-700 text-white',
        buttonOutline: 'border-green-700 text-green-200 hover:bg-green-800',
        header: 'border-green-800 bg-green-900/90',
        accent: 'bg-green-800'
      };
    case 'lavender':
      return {
        container: 'bg-violet-50 text-violet-950',
        card: 'bg-violet-100/80 border-violet-200',
        text: 'text-violet-950',
        textMuted: 'text-violet-800',
        button: 'bg-violet-600 hover:bg-violet-700 text-white',
        buttonOutline: 'border-violet-400 text-violet-900 hover:bg-violet-200',
        header: 'border-violet-200 bg-violet-100/90',
        accent: 'bg-violet-200'
      };
    case 'coral':
      return {
        container: 'bg-red-50 text-red-950',
        card: 'bg-red-100/80 border-red-200',
        text: 'text-red-950',
        textMuted: 'text-red-800',
        button: 'bg-red-600 hover:bg-red-700 text-white',
        buttonOutline: 'border-red-400 text-red-900 hover:bg-red-200',
        header: 'border-red-200 bg-red-100/90',
        accent: 'bg-red-200'
      };
    case 'charcoal':
      return {
        container: 'bg-slate-900 text-slate-100',
        card: 'bg-slate-800/90 border-slate-700',
        text: 'text-slate-100',
        textMuted: 'text-slate-300',
        button: 'bg-slate-700 hover:bg-slate-600 text-white',
        buttonOutline: 'border-slate-600 text-slate-300 hover:bg-slate-700',
        header: 'border-slate-700 bg-slate-800/90',
        accent: 'bg-slate-700'
      };
    case 'cream':
      return {
        container: 'bg-stone-100 text-stone-900',
        card: 'bg-stone-50/80 border-stone-200',
        text: 'text-stone-900',
        textMuted: 'text-stone-700',
        button: 'bg-stone-700 hover:bg-stone-800 text-white',
        buttonOutline: 'border-stone-400 text-stone-800 hover:bg-stone-200',
        header: 'border-stone-200 bg-stone-50/90',
        accent: 'bg-stone-200'
      };
    default: // light
      return {
        container: 'bg-white text-gray-900',
        card: 'bg-white border-gray-200',
        text: 'text-gray-900',
        textMuted: 'text-gray-700',
        button: 'bg-blue-500 hover:bg-blue-600 text-white',
        buttonOutline: 'border-gray-300 text-gray-800 hover:bg-gray-50',
        header: 'border-gray-100 bg-white',
        accent: 'bg-gray-100'
      };
  }
};
