import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BRAND_ASSETS } from '../lib/assets';

export function LoadingBootOverlay() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;
    try {
      return !sessionStorage.getItem('btc-boot-shown');
    } catch {
      return true;
    }
  });

  useEffect(() => {
    if (!visible) return;
    try {
      sessionStorage.setItem('btc-boot-shown', '1');
    } catch {
      // ignore
    }
    const timer = window.setTimeout(() => setVisible(false), 750);
    return () => window.clearTimeout(timer);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#040814] text-white"
        >
          <motion.img
            src={BRAND_ASSETS.logoEmblem}
            alt="CORESPACE"
            initial={{ scale: 0.88, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="h-24 w-auto object-contain mb-4"
          />
          <p className="font-display text-lg font-bold tracking-widest text-white">
            CORESPACE
          </p>
          <p className="mt-1 text-xs font-medium tracking-[0.28em] text-[#22C55E]">
            ENTER THE FUTURE.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
