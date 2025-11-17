import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Upload, Download } from 'lucide-react';

import Clock from './Clock.jsx';
import BookmarkBar from './BookmarkBar.jsx';
import PomodoroTimer from './PomodoroTimer.jsx';
import Modal from './Modal.jsx';
import BookmarkEditor from './BookmarkEditor.jsx';

const defaultConfig = {
  bookmarks: [],
  pomodoro: { workDuration: 25, breakDuration: 5 },
};

function App() {
  const [isMinimized, setIsMinimized] = useState(false);
  const [config, setConfig] = useState(defaultConfig); // Use default config initially
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState(null);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const loadedConfig = await window.electronAPI.readConfig();
      setConfig(loadedConfig);
    } catch (error) {
      console.error("Failed to read config, using default:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
    window.electronAPI.onWindowMinimize((newState) => setIsMinimized(newState));
  }, []);

  // ... (all handler functions remain the same)
  const handleSaveBookmark = async (bookmarkData) => {
    const newConfig = { ...config };
    if (editingBookmark) {
      const index = newConfig.bookmarks.findIndex(b => b.id === editingBookmark.id);
      newConfig.bookmarks[index] = bookmarkData;
    } else {
      newConfig.bookmarks.push({ ...bookmarkData, id: uuidv4() });
    }
    await window.electronAPI.writeConfig(newConfig);
    setConfig(newConfig);
    setIsModalOpen(false);
    setEditingBookmark(null);
  };
  const handleGitPush = async () => { /* ... */ };
  const handleGitPull = async () => { /* ... */ };
  const WindowControls = () => { /* ... */ };
  const CallMeButton = () => { /* ... */ };


  const DockBar = () => (
    <div className="w-full h-full bg-gray-900/80 backdrop-blur-lg rounded-lg flex items-center justify-between px-4 font-mono" style={{ WebkitAppRegion: 'drag' }}>
      <div className="flex items-center gap-6">
        <Clock />
        <div className="h-8 border-l border-gray-600" />
        {isLoading ? <p className="text-xs text-gray-400">Loading...</p> : <PomodoroTimer settings={config.pomodoro} />}
        <div className="h-8 border-l border-gray-600" />
        <BookmarkBar bookmarks={config.bookmarks} />
      </div>
      {/* ... (rest of DockBar) */}
    </div>
  );

  // Re-creating the full component for clarity
  return (
    <div className="w-screen h-screen">
      {isMinimized ? (
        <div onClick={() => window.electronAPI.toggleMinimize(isMinimized)} className="w-[50px] h-[50px] bg-indigo-600/80 rounded-full flex items-center justify-center cursor-pointer animate-pulse" style={{ WebkitAppRegion: 'no-drag' }}><p className="text-2xl">🚀</p></div>
      ) : (
        <div className="w-full h-full bg-gray-900/80 backdrop-blur-lg rounded-lg flex items-center justify-between px-4 font-mono" style={{ WebkitAppRegion: 'drag' }}>
          <div className="flex items-center gap-6">
            <Clock />
            <div className="h-8 border-l border-gray-600" />
            {isLoading ? <p className="text-xs text-gray-400">...</p> : <PomodoroTimer settings={config.pomodoro} />}
            <div className="h-8 border-l border-gray-600" />
            <BookmarkBar bookmarks={config.bookmarks} />
          </div>
          <div className="flex items-center gap-4" style={{ WebkitAppRegion: 'no-drag' }}>
            <button onClick={handleGitPush} title="Git Push"><Upload size={18} className="text-gray-400 hover:text-white" /></button>
            <button onClick={handleGitPull} title="Git Pull"><Download size={18} className="text-gray-400 hover:text-white" /></button>
            <div className="h-8 border-l border-gray-600" />
            <div className="flex items-center space-x-2">
              <button onClick={() => window.electronAPI.toggleMinimize(isMinimized)} className="w-6 h-6 bg-yellow-500 rounded-full" title="Minimize" />
              <button onClick={() => { setEditingBookmark(null); setIsModalOpen(true); }} className="w-6 h-6 bg-green-500 rounded-full" title="Add Bookmark" />
              <button onClick={() => window.close()} className="w-6 h-6 bg-red-500 rounded-full" title="Close" />
            </div>
          </div>
        </div>
      )}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <BookmarkEditor bookmark={editingBookmark} onSave={handleSaveBookmark} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}

export default App;
