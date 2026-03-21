'use client';

import React, { ReactNode } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  maxWidth = 'md'
}) => {
  if (!isOpen) return null;

  const getMaxWidthClasses = () => {
    switch (maxWidth) {
      case 'sm': return 'max-w-sm';
      case 'md': return 'max-w-md';
      case 'lg': return 'max-w-lg';
      case 'xl': return 'max-w-xl';
      case '2xl': return 'max-w-2xl';
      default: return 'max-w-md';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`bg-card border border-border rounded-xl p-6 ${getMaxWidthClasses()} w-full shadow-2xl ${className}`}>
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-primary-text">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-hover rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-secondary-text" />
            </button>
          </div>
        )}
        
        {children}
      </div>
    </div>
  );
};

export default Modal;
