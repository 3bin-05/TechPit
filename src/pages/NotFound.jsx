import React from 'react';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center p-6 text-center text-chalk">
      <motion.div
        initial={{ rotate: -5, scale: 0.9 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 5 }}
        className="mb-12 relative"
      >
        {/* Mock SVG Robot Illustration */}
        <div className="w-64 h-64 border-4 border-chalk relative flex items-center justify-center bg-ink">
          <div className="absolute top-8 left-12 w-8 h-8 bg-signal rounded-full animate-pulse" />
          <div className="absolute top-8 right-12 w-8 h-8 bg-signal rounded-full animate-pulse" />
          <div className="w-40 h-20 border-t-4 border-chalk mt-12 rounded-full" />
          <div className="absolute inset-0 border-4 border-chalk m-2 flex items-center justify-center overflow-hidden">
             <span className="font-mono text-xs opacity-20">01010101010101010101010101010101</span>
          </div>
        </div>
        <div className="absolute -bottom-4 -right-4 bg-signal text-chalk border-2 border-chalk px-4 py-1 font-mono text-xs font-bold uppercase rotate-12">
          Critical Error
        </div>
      </motion.div>

      <h1 className="text-8xl font-bebas mb-4">404: SEGFAULT</h1>
      <p className="font-mono text-xl text-static uppercase tracking-widest mb-12 max-w-md">
        This page doesn't exist in the current memory space. 
        Identity corrupted. Access denied.
      </p>

      <Button 
        className="text-2xl px-12 py-4 bg-glitch text-void" 
        onClick={() => navigate('/feed')}
      >
        Return to Feed_
      </Button>
      
      <div className="mt-16 font-mono text-[10px] text-static opacity-30">
        CORE_DUMP_STACK_TRACE: 0x00427FF {" >> "} NOT_FOUND
      </div>
    </div>
  );
};
