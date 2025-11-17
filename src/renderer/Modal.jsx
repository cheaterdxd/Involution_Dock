import React from 'react';

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md border border-gray-700">
        <div className="flex justify-end">
          <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default Modal;
