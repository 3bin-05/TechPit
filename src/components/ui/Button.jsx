import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Button = ({ 
  children, 
  className, 
  variant = 'primary', 
  ...props 
}) => {
  const baseStyles = "brutalist-button";
  const secondaryStyles = "brutalist-button-secondary";
  const dangerStyles = "bg-signal text-chalk border-2 border-void px-6 py-2 uppercase font-mono tracking-wide transition-all duration-150 hover:shadow-brutalist active:translate-x-0.5 active:translate-y-0.5 active:shadow-none";
  
  const variants = {
    primary: baseStyles,
    secondary: secondaryStyles,
    danger: dangerStyles,
  };

  return (
    <button 
      className={twMerge(variants[variant], className)} 
      {...props}
    >
      {children}
    </button>
  );
};
