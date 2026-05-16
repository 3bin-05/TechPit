import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Input = ({ className, ...props }) => {
  return (
    <input 
      className={twMerge("brutalist-input w-full", className)} 
      {...props} 
    />
  );
};
