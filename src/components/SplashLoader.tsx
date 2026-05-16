import React from 'react';
import { motion } from 'motion/react';

const SplashLoader = () => (
  <motion.div 
    initial={{ opacity: 1 }}
    exit={{ opacity: 0, filter: "blur(10px)" }}
    transition={{ duration: 1.2, ease: "easeInOut" }}
    className="fixed inset-0 z-[200] bg-[#0F1115] flex flex-col items-center justify-center"
  >
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      className="w-16 h-16 border border-[#D4AF37] rotate-45 flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.15)] mb-8"
    >
      <div className="-rotate-45 font-serif text-[#D4AF37] text-2xl font-bold">W</div>
    </motion.div>
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 1 }}
      className="text-center"
    >
      <h2 className="text-[#E5E4E2] text-xl font-serif italic mb-2 tracking-widest">WealthOS</h2>
      <div className="w-32 h-[1px] bg-white/10 mx-auto overflow-hidden">
        <motion.div 
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="w-1/2 h-full bg-[#D4AF37] shadow-[0_0_10px_#D4AF37]"
        />
      </div>
    </motion.div>
  </motion.div>
);

export default SplashLoader;
