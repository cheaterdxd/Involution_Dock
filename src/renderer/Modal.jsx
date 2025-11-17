import React, { useEffect, useRef } from 'react';

function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef(null);

  // Handle Escape key press
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Handle click outside to close
  const handleBackdropClick = (event) => {
    if (modalRef.current && event.target === modalRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div ref={modalRef} onClick={handleBackdropClick} className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50" role="dialog" aria-modal="true">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md border border-gray-700 relative">
        <div className="flex justify-end">
          <button onClick={onClose} className="absolute top-2 right-3 text-gray-400 hover:text-white text-2xl leading-none" aria-label="Close">&times;</button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
