'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TypewriterProps {
  words: string;
  className?: string;
  delay?: number;
  speed?: number;
}

export default function TextGenerateEffect({ 
  words, 
  className = '', 
  delay = 0,
  speed = 30
}: TypewriterProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex <= words.length) {
          setDisplayedText(words.slice(0, currentIndex));
          currentIndex++;
        } else {
          setIsComplete(true);
          clearInterval(interval);
        }
      }, speed);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [words, delay, speed]);

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {displayedText}
      {!isComplete && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ 
            duration: 0.8, 
            repeat: Infinity, 
            repeatType: 'reverse',
            ease: "easeInOut"
          }}
          className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
        >
          |
        </motion.span>
      )}
    </motion.span>
  );
}
