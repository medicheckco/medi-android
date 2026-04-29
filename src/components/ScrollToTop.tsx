import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      const scrolled = window.scrollY || document.documentElement.scrollTop;
      // Show button when user has scrolled down at least half the viewport height
      setIsVisible(scrolled > window.innerHeight * 0.5);
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    // Initial check
    toggleVisibility();
    
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    const scrollOptions: ScrollToOptions = {
      top: 0,
      behavior: 'smooth',
    };
    
    // Try multiple methods to ensure scrolling works in all environments
    window.scrollTo(scrollOptions);
    document.documentElement.scrollTo(scrollOptions);
    if (document.body) {
      document.body.scrollTo(scrollOptions);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 10 }}
          whileHover={{ scale: 1.1, backgroundColor: '#1d4ed8' }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 w-10 h-10 bg-blue-600/90 text-white rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center transition-all border border-white/20 backdrop-blur-md hover:bg-blue-600"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" strokeWidth={3} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};
