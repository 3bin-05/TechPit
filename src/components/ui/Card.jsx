import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Card = ({ children, className, ...props }) => {
  return (
    <div 
      className={twMerge("brutalist-card p-4", className)} 
      {...props}
    >
      {children}
    </div>
  );
};
