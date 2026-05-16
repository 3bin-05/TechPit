import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export const LoadingPit = () => {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-void text-glitch overflow-hidden">
      <motion.div
        animate={{ 
          rotate: 360,
          scale: [1, 1.2, 1],
        }}
        transition={{ 
          rotate: { duration: 2, repeat: Infinity, ease: "linear" },
          scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
        }}
        className="mb-8"
      >
        <Loader2 size={64} strokeWidth={3} />
      </motion.div>
      
      <div className="space-y-4 text-center">
        <h2 className="text-4xl font-bebas tracking-widest animate-pulse">
          LOADING_THE_PIT...
        </h2>
        <div className="font-mono text-xs text-static uppercase tracking-[0.3em]">
          Decrypting kernel modules / Synchronizing buffer
        </div>
      </div>
      
      {/* Decorative Glitch Bars */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="h-px w-full bg-glitch/20 absolute top-1/4 animate-scanline" />
        <div className="h-px w-full bg-glitch/20 absolute top-3/4 animate-scanline-reverse" />
      </div>
      
      <style>{`
        @keyframes scanline {
          0% { transform: translateY(-100vh); }
          100% { transform: translateY(100vh); }
        }
        .animate-scanline {
          animation: scanline 4s linear infinite;
        }
        .animate-scanline-reverse {
          animation: scanline 4s linear infinite reverse;
        }
      `}</style>
    </div>
  );
};
