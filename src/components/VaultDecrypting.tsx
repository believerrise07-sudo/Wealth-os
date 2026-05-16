import React from 'react';
import { motion } from 'motion/react';

const VaultDecrypting = () => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[150] bg-[#0F1115]/90 backdrop-blur-2xl flex flex-col items-center justify-center"
  >
    <div className="w-12 h-12 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mb-6" />
    <motion.p 
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ repeat: Infinity, duration: 2 }}
      className="text-[10px] uppercase tracking-[0.5em] text-[#D4AF37] font-bold"
    >
      Decrypting Sovereign Vault
    </motion.p>
    <p className="text-[8px] uppercase tracking-widest text-[#E5E4E2]/40 mt-3">Establishing Secure Connection...</p>
  </motion.div>
);

export default VaultDecrypting;
