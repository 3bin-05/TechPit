import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Badge = ({ children, className, variant = 'default', ...props }) => {
  const variants = {
    default: "bg-static border-void text-void",
    pro: "bg-[#E8FFE8] border-byte text-byte",
    con: "bg-[#FFE8E8] border-signal text-signal",
    ai: "bg-[#E8F4FF] border-terminal text-terminal",
    os: "bg-[#FFFBE8] border-glitch text-ink",
    warning: "bg-glitch border-void text-void",
  };

  return (
    <span 
      className={twMerge(
        "text-xs uppercase tracking-wider font-mono border border-void px-2 py-0.5 rounded",
        variants[variant],
        className
      )} 
      {...props}
    >
      {children}
    </span>
  );
};
