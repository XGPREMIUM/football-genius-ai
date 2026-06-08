import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import ChatScreen from './src/screens/ChatScreen';
import ModeSelectorScreen from './src/screens/ModeSelectorScreen';
import { loadCurrentMode, saveCurrentMode } from './src/services/storage';

export default function App() {
  const [currentMode, setCurrentMode] = useState('general');
  const [showModes, setShowModes] = useState(false);

  useEffect(() => {
    loadCurrentMode().then((mode) => {
      if (mode) setCurrentMode(mode);
    });
  }, []);

  const handleSelectMode = (mode: string) => {
    setCurrentMode(mode);
    saveCurrentMode(mode);
  };

  if (showModes) {
    return (
      <>
        <StatusBar style="light" />
        <ModeSelectorScreen
          currentMode={currentMode}
          onSelectMode={handleSelectMode}
          onClose={() => setShowModes(false)}
        />
      </>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <ChatScreen
        currentMode={currentMode}
        onOpenModes={() => setShowModes(true)}
      />
    </>
  );
}
