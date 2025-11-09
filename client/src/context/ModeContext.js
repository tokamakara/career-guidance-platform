import React, { createContext, useState, useContext } from 'react';

const ModeContext = createContext();

export const useMode = () => {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
};

export const ModeProvider = ({ children }) => {
  const [currentMode, setCurrentMode] = useState('education'); // 'education' or 'career'

  const switchMode = (mode) => {
    if (['education', 'career'].includes(mode)) {
      setCurrentMode(mode);
    } else {
      console.warn('Invalid mode specified. Use "education" or "career".');
    }
  };

  const toggleMode = () => {
    setCurrentMode(prev => prev === 'education' ? 'career' : 'education');
  };

  const value = {
    currentMode,
    switchMode,
    toggleMode,
    isEducationMode: currentMode === 'education',
    isCareerMode: currentMode === 'career'
  };

  return (
    <ModeContext.Provider value={value}>
      {children}
    </ModeContext.Provider>
  );
};