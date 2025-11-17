import React, { useState, useEffect } from 'react';

function BookmarkEditor({ bookmark, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Folder',
    target: '',
    icon: 'Folder',
  });

  useEffect(() => {
    if (bookmark) {
      setFormData(bookmark);
    }
  }, [bookmark]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-white font-mono">
      <h2 className="text-xl text-indigo-400">{bookmark ? 'Edit' : 'New'} Bookmark</h2>
      <div>
        <label className="block text-sm">Name</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded mt-1" required />
      </div>
      <div>
        <label className="block text-sm">Type</label>
        <select name="type" value={formData.type} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded mt-1">
          <option>Folder</option>
          <option>Link</option>
          <option>Command</option>
          <option>App</option>
        </select>
      </div>
      <div>
        <label className="block text-sm">Target (Path/URL/Command)</label>
        <input type="text" name="target" value={formData.target} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded mt-1" required />
      </div>
      <div>
        <label className="block text-sm">Icon</label>
         <select name="icon" value={formData.icon} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded mt-1">
          <option>Folder</option>
          <option>Link</option>
          <option>Command</option>
          <option>Star</option>
        </select>
      </div>
      <div className="flex justify-end space-x-4 pt-4">
        <button type="button" onClick={onCancel} className="bg-gray-600 px-4 py-2 rounded">Cancel</button>
        <button type="submit" className="bg-indigo-600 px-4 py-2 rounded">Save</button>
      </div>
    </form>
  );
}

export default BookmarkEditor;
