import React from 'react';

// Instrumentação para detectar duplicação de instâncias do React
declare global {
  interface Window {
    __REACT_INSTANCES__?: Set<any>;
  }
}

export const registerReactInstance = (source: string) => {
  if (typeof window === 'undefined') return;
  
  if (!window.__REACT_INSTANCES__) {
    window.__REACT_INSTANCES__ = new Set();
  }
  
  window.__REACT_INSTANCES__.add(React);
  
  console.log(`[React Debug] Registering from: ${source}`);
  console.log(`[React Debug] React version: ${React.version}`);
  console.log(`[React Debug] Total instances: ${window.__REACT_INSTANCES__.size}`);
  
  if (window.__REACT_INSTANCES__.size > 1) {
    console.error('⚠️ MULTIPLE REACT INSTANCES DETECTED!');
    console.error('Instances:', Array.from(window.__REACT_INSTANCES__));
  }
  
  return React;
};
