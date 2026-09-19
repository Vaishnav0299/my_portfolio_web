import React, { useState, useEffect } from 'react';

const DEFAULT_WORDS = [
  'building scalable web applications.',
  'designing resilient backend systems.',
  'crafting pixel-perfect interactive UIs.',
  'optimizing high-throughput event pipelines.',
  'deploying pragmatic AI workflows.',
];

export function Typewriter({ phrases }) {
  const words = (Array.isArray(phrases) && phrases.length > 0) ? phrases : DEFAULT_WORDS;
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset when phrases change
  useEffect(() => {
    setWordIndex(0);
    setText('');
    setIsDeleting(false);
  }, [phrases]);

  useEffect(() => {
    const currentWord = words[wordIndex % words.length];
    let timer;

    if (!isDeleting) {
      if (text.length < currentWord.length) {
        timer = setTimeout(() => {
          setText(currentWord.slice(0, text.length + 1));
        }, 60);
      } else {
        // Pause at end of word
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2200);
      }
    } else {
      if (text.length > 0) {
        timer = setTimeout(() => {
          setText(currentWord.slice(0, text.length - 1));
        }, 30);
      } else {
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % words.length);
      }
    }

    return () => clearTimeout(timer);
  }, [text, isDeleting, wordIndex, words]);

  return (
    <div className="typewriter-container" aria-label="Rotating technical capabilities">
      <span style={{ color: 'var(--accent-primary)', marginRight: '0.5rem' }}>&gt;</span>
      <span>{text}</span>
      <span className="typewriter-cursor" aria-hidden="true" />
    </div>
  );
}

export default Typewriter;
