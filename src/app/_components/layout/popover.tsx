'use client';

import React, { useState, useRef, useEffect, ReactNode } from 'react';

interface PopoverProps {
  trigger: ReactNode | ((props: { onClick: (e: React.MouseEvent) => void }) => ReactNode);
  children: ReactNode;
  mode?: 'hover' | 'click';
  position?: 'right-top' | 'left-top' | 'right-bottom' | 'left-bottom' | 'top-center' | 'top-right' | 'bottom-center';
  onOpenChange?: (isOpen: boolean) => void;
  className?: string; // optional className
}

const Popover: React.FC<PopoverProps> = ({
  trigger,
  children,
  mode = 'hover',
  position = 'right-top',
  onOpenChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleTriggerEnter = () => {
    if (mode === 'hover') setIsOpen(true);
  };

  const handleTriggerLeave = () => {
    if (mode === 'hover') setIsOpen(false);
  };

  const handleTriggerClick = (event: React.MouseEvent) => {
    if (mode === 'click') {
      event.stopPropagation();
      setIsOpen((prev) => !prev);
    }
  };

  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mode === 'click' && wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mode]);

  const getPositionClasses = () => {
    switch (position) {
      case 'left-top': return 'bottom-full left-0 mb-2';
      case 'left-bottom': return 'top-full left-0 mt-2';
      case 'right-top': return 'bottom-full right-0 mb-2';
      case 'right-bottom': return 'top-full right-0 mt-2';
      case 'top-center': return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
      case 'top-right': return 'bottom-full right-0 mb-2';
      case 'bottom-center': return 'top-full left-1/2 -translate-x-1/2 mt-2';
      default: return 'top-full right-0 mt-2';
    }
  };

  return (
    <div
      ref={wrapperRef}
      className="relative inline-block"
      onMouseEnter={handleTriggerEnter}
      onMouseLeave={handleTriggerLeave}
      onClick={handleTriggerClick}
    >
      {typeof trigger === 'function'
        ? trigger({
            onClick: (e: React.MouseEvent) => {
              e.stopPropagation();
              handleTriggerClick(e);
            },
          })
        : trigger}

      <div
        className={`
          absolute z-50 transition-all duration-100 ease-out
          ${getPositionClasses()}
          ${isOpen 
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' 
            : 'opacity-0 translate-y-2 scale-95 pointer-events-none'
          }
          ${className}
        `}
      >
        {children}
      </div>
    </div>
  );
};

export default Popover;
