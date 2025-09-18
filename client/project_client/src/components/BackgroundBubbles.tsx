import React, { useEffect, useRef } from 'react';

interface Bubble {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  element: HTMLDivElement;
}

const BackgroundBubbles: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bubblesRef = useRef<Bubble[]>([]);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const bubbleCount = 20;
    
    // Create initial bubbles
    for (let i = 0; i < bubbleCount; i++) {
      createBubble(container);
    }
    
    // Animation loop
    const animate = () => {
      bubblesRef.current.forEach(bubble => {
        // Update position
        bubble.x += bubble.speedX;
        bubble.y += bubble.speedY;
        
        // Check boundaries
        if (bubble.x < -bubble.size) bubble.x = window.innerWidth;
        if (bubble.x > window.innerWidth) bubble.x = -bubble.size;
        if (bubble.y < -bubble.size) bubble.y = window.innerHeight;
        if (bubble.y > window.innerHeight) bubble.y = -bubble.size;
        
        // Update DOM element
        bubble.element.style.left = `${bubble.x}px`;
        bubble.element.style.top = `${bubble.y}px`;
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationRef.current);
      bubblesRef.current.forEach(bubble => {
        if (bubble.element.parentNode) {
          bubble.element.parentNode.removeChild(bubble.element);
        }
      });
      bubblesRef.current = [];
    };
  }, []);
  
  const createBubble = (container: HTMLDivElement) => {
    const size = Math.random() * 60 + 50;
    const element = document.createElement('div');
    element.className = 'bubble';
    element.style.width = `${size}px`;
    element.style.height = `${size}px`;
    element.style.opacity = `${Math.random() * 0.3 + 0.1}`;
    
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    const speedX = (Math.random() - 0.5) * 0.5;
    const speedY = (Math.random() - 0.5) * 0.5;
    
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    
    container.appendChild(element);
    
    bubblesRef.current.push({
      x,
      y,
      size,
      speedX,
      speedY,
      element
    });
  };

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none overflow-hidden z-0" />;
};

export default BackgroundBubbles;