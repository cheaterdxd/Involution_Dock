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
  pomodoro: {
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
  },
  appSettings: {
    transparencyLevel: 80,
  },
};

// Extracted DockBar component
const DockBar = ({ isLoading, config, onGitPush, onGitPull, onToggleMinimize, onAddBookmark }) => (
  <div className="relative w-full h-full bg-gray-100 rounded-lg flex items-center justify-between px-4 font-mono text-gray-800">
    {/* Vùng kéo thả chính của cửa sổ */}
    <div className="absolute inset-0" style={{ WebkitAppRegion: 'drag' }} />

    {/* Các thành phần bên trái (Clock, Pomodoro, Bookmarks) - không kéo thả */}
    <div className="absolute left-4 top-0 h-full flex items-center gap-6" style={{ WebkitAppRegion: 'no-drag' }}>
      <Clock />
      <div className="h-8 border-l border-gray-300" />
      {isLoading ? <p className="text-xs text-gray-600">...</p> : <PomodoroTimer settings={config.pomodoro} />}
      <div className="h-8 border-l border-gray-300" />
      <BookmarkBar bookmarks={config.bookmarks} />
    </div>

    {/* Các thành phần bên phải (Git, Window Controls) - không kéo thả */}
    <div className="absolute right-4 top-0 h-full flex items-center gap-4" style={{ WebkitAppRegion: 'no-drag' }}>
      <button onClick={onGitPush} title="Git Push"><Upload size={18} className="text-gray-600 hover:text-indigo-600 transition-colors" /></button>
      <button onClick={onGitPull} title="Git Pull"><Download size={18} className="text-gray-600 hover:text-indigo-600 transition-colors" /></button>
      <div className="h-8 border-l border-gray-300" />
      <button onClick={() => onToggleMinimize(true)} className="w-6 h-6 bg-yellow-400 rounded-full hover:opacity-80 transition-opacity" title="Minimize" />
      <button onClick={onAddBookmark} className="w-6 h-6 bg-green-500 rounded-full hover:opacity-80 transition-opacity" title="Add Bookmark" />
      <button onClick={() => window.close()} className="w-6 h-6 bg-red-500 rounded-full hover:opacity-80 transition-opacity" title="Close" />
    </div>
  </div>
);

function App() {
  const [isMinimized, setIsMinimized] = useState(false);
  const [config, setConfig] = useState(defaultConfig); // Use default config initially
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [error, setError] = useState(null); // <-- New error state
  const [gitStatus, setGitStatus] = useState({ active: false, message: '' });

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
    if (window.electronAPI) {
      loadConfig();
      window.electronAPI.onWindowMinimize((newState) => setIsMinimized(newState));
    } else {
      const errorMsg = 'FATAL: window.electronAPI is not defined. Preload script might have failed.';
      console.error(errorMsg);
      setError(errorMsg); // Set error state
      setIsLoading(false);
    }
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

  const handleGitSync = async (gitCommand) => {
    if (!window.electronAPI) return;

    setGitStatus({ active: true, message: 'Syncing...' });
    try {
      const result = await gitCommand();
      console.log('Git command result:', result);
      setGitStatus({ active: true, message: 'Sync successful!' });
      // If pull was successful, we should reload the config to reflect changes
      if (gitCommand === window.electronAPI.gitPull) {
        await loadConfig();
      }
    } catch (err) {
      console.error('Git command failed:', err);
      setGitStatus({ active: true, message: 'Sync failed!' });
    } finally {
      setTimeout(() => setGitStatus({ active: false, message: '' }), 3000);
    }
  };

  const handleGitPush = () => handleGitSync(window.electronAPI.gitPush);
  const handleGitPull = () => handleGitSync(window.electronAPI.gitPull);

  // Re-creating the full component for clarity
  // <-- Conditional error rendering
  if (error) {
    return (
      <div className="w-screen h-screen bg-red-900 text-white flex flex-col items-center justify-center p-4 font-mono">
        <h1 className="text-2xl font-bold mb-2">Application Error</h1>
        <p>A critical error prevented the app from loading.</p>
        <pre className="mt-4 p-2 bg-red-800 rounded text-left w-full max-w-2xl break-words">
          <code>{error}</code>
        </pre>
        <p className="mt-4 text-sm text-red-200">Check the DevTools console (Ctrl+Shift+I) for more details.</p>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen">
      {isMinimized ? (
        <div onClick={() => window.electronAPI.toggleMinimize(isMinimized)} className="w-[50px] h-[50px] bg-indigo-600/80 rounded-full flex items-center justify-center cursor-pointer animate-pulse" style={{ WebkitAppRegion: 'no-drag' }}><p className="text-2xl">🚀</p></div>
      ) : (
        <DockBar
          isLoading={isLoading}
          config={config}
          onGitPush={handleGitPush}
          onGitPull={handleGitPull}
          onToggleMinimize={setIsMinimized} // Pass setIsMinimized directly
          onAddBookmark={() => { setEditingBookmark(null); setIsModalOpen(true); }}
        />
      )}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <BookmarkEditor bookmark={editingBookmark} onSave={handleSaveBookmark} onCancel={() => setIsModalOpen(false)} />
      </Modal>
      {gitStatus.active && (
        <div className="absolute bottom-4 right-4 bg-gray-800 text-white text-xs font-mono px-3 py-1 rounded-md shadow-lg border border-gray-700">
          {gitStatus.message}
        </div>
      )}
    </div>
  );
}

export default App;
