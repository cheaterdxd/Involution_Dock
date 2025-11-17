import React from 'react';
import { Folder, Terminal, Link2, Star } from 'lucide-react'; // Using Link2 for a different look

const iconMap = {
  Folder: Folder,
  Command: Terminal,
  Link: Link2,
  App: Star,
};

function BookmarkBar({ bookmarks }) {
  const handleBookmarkClick = (bookmark) => {
    window.electronAPI.runCommand(bookmark);
  };

  if (!bookmarks || bookmarks.length === 0) {
    return <p className="text-gray-500 font-mono text-xs">No bookmarks defined.</p>;
  }

  return (
    <div className="flex items-center space-x-4 h-full">
      {bookmarks.map((bookmark) => {
        const Icon = iconMap[bookmark.icon] || Star;
        return (
          <div
            key={bookmark.id}
            onClick={() => handleBookmarkClick(bookmark)}
            className="flex flex-col items-center justify-center text-gray-300 hover:text-indigo-400 cursor-pointer group h-full pt-1"
            title={`${bookmark.name}: ${bookmark.target}`}
          >
            <Icon size={22} strokeWidth={1.5} />
            <p className="text-xs font-mono mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {bookmark.name}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export default BookmarkBar;
