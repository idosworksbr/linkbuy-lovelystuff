
import React from 'react';

interface CatalogThemeProps {
  theme: 'light' | 'dark' | 'beige';
  backgroundColor?: string;
  children: React.ReactNode;
}

export const CatalogTheme = ({ theme, backgroundColor, children }: CatalogThemeProps) => {
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
          header: 'border-gray-700 bg-gray-800'
        };
      case 'beige':
        return {
          container: 'bg-amber-50 text-amber-900',
          card: 'bg-amber-100 border-amber-200',
          text: 'text-amber-900',
          textMuted: 'text-amber-700',
          button: 'bg-amber-600 hover:bg-amber-700 text-white',
          buttonOutline: 'border-amber-300 text-amber-700 hover:bg-amber-200',
          header: 'border-amber-200 bg-amber-100'
        };
      default: // light
        return {
          container: 'bg-white text-gray-900',
          card: 'bg-white border-gray-200',
          text: 'text-gray-900',
          textMuted: 'text-gray-600',
          button: 'bg-blue-500 hover:bg-blue-600 text-white',
          buttonOutline: 'border-gray-300 text-gray-700 hover:bg-gray-50',
          header: 'border-gray-100 bg-white'
        };
    }
  };

  const themeClasses = getThemeClasses();
  
  const containerStyle = theme === 'light' && backgroundColor 
    ? { backgroundColor } 
    : {};

  return (
    <div 
      className={`min-h-screen ${theme === 'light' ? '' : themeClasses.container}`}
      style={containerStyle}
      data-theme={theme}
    >
      <style jsx>{`
        [data-theme="${theme}"] .theme-container { ${theme !== 'light' ? `background-color: ${themeClasses.container.split(' ')[0].replace('bg-', '')}` : ''} }
        [data-theme="${theme}"] .theme-card { @apply ${themeClasses.card}; }
        [data-theme="${theme}"] .theme-text { @apply ${themeClasses.text}; }
        [data-theme="${theme}"] .theme-text-muted { @apply ${themeClasses.textMuted}; }
        [data-theme="${theme}"] .theme-button { @apply ${themeClasses.button}; }
        [data-theme="${theme}"] .theme-button-outline { @apply ${themeClasses.buttonOutline}; }
        [data-theme="${theme}"] .theme-header { @apply ${themeClasses.header}; }
      `}</style>
      {children}
    </div>
  );
};

export const useThemeClasses = (theme: 'light' | 'dark' | 'beige') => {
  switch (theme) {
    case 'dark':
      return {
        container: 'bg-gray-900 text-white',
        card: 'bg-gray-800 border-gray-700',
        text: 'text-white',
        textMuted: 'text-gray-300',
        button: 'bg-blue-600 hover:bg-blue-700 text-white',
        buttonOutline: 'border-gray-600 text-gray-300 hover:bg-gray-700',
        header: 'border-gray-700 bg-gray-800'
      };
    case 'beige':
      return {
        container: 'bg-amber-50 text-amber-900',
        card: 'bg-amber-100 border-amber-200',
        text: 'text-amber-900',
        textMuted: 'text-amber-700',
        button: 'bg-amber-600 hover:bg-amber-700 text-white',
        buttonOutline: 'border-amber-300 text-amber-700 hover:bg-amber-200',
        header: 'border-amber-200 bg-amber-100'
      };
    default: // light
      return {
        container: 'bg-white text-gray-900',
        card: 'bg-white border-gray-200',
        text: 'text-gray-900',
        textMuted: 'text-gray-600',
        button: 'bg-blue-500 hover:bg-blue-600 text-white',
        buttonOutline: 'border-gray-300 text-gray-700 hover:bg-gray-50',
        header: 'border-gray-100 bg-white'
      };
  }
};
