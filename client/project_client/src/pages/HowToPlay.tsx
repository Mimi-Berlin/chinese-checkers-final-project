import React from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Card from '../components/Card';

const HowToPlay: React.FC = () => {
  const instructions = [
    {
      title: "Objective",
      content: "Move all of your marbles to the opposite corner of the star. The first player to occupy all positions in their target corner wins."
    },
    {
      title: "Movement",
      content: "On your turn, move one marble in any direction to an adjacent empty space, or jump over a single marble (any color) to an empty space."
    },
    {
      title: "Multiple Jumps",
      content: "You can make multiple jumps in succession with a single marble if valid jumping positions are available after each jump."
    },
    {
      title: "Strategy Tips",
      content: "Try to create 'stepping stones' with your marbles, allowing for longer jump sequences. Block opponent's paths while creating your own."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="How To Play" />
      
      <div className="flex-grow px-6 py-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mb-8">
            <h2 className="text-xl font-bold text-red-600 mb-4">Chinese Checkers Rules</h2>
            <p className="text-red-600 mb-4">
              Chinese Checkers is a strategy board game that can be played by 2-6 players. 
              Each player tries to race their pieces across the hexagram-shaped board to the opposite corner.
            </p>
          </Card>
        </motion.div>
        
        {instructions.map((instruction, index) => (
          <motion.div
            key={index}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
          >
            <Card className="mb-4">
              <h3 className="text-lg font-bold text-red-600 mb-2">{instruction.title}</h3>
              <p className="text-red-600">{instruction.content}</p>
            </Card>
          </motion.div>
        ))}
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="flex flex-col items-center">
            <h3 className="text-lg font-bold text-red-600 mb-4">Game Board Layout</h3>
            <div className="w-48 h-48 relative mb-4">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <polygon 
                  points="50,0 61.8,35 98.1,35 68.2,56.5 80,91.5 50,70 20,91.5 31.8,56.5 1.9,35 38.2,35" 
                  fill="#ffd1d1" 
                  stroke="#e63946" 
                  strokeWidth="2"
                />
                {/* Red marbles (top) */}
                <circle cx="50" cy="15" r="5" fill="#e63946" />
                <circle cx="43" cy="22" r="5" fill="#e63946" />
                <circle cx="57" cy="22" r="5" fill="#e63946" />
                {/* Blue marbles (bottom) */}
                <circle cx="50" cy="85" r="5" fill="#219ebc" />
                <circle cx="43" cy="78" r="5" fill="#219ebc" />
                <circle cx="57" cy="78" r="5" fill="#219ebc" />
              </svg>
            </div>
            <p className="text-red-600 text-sm text-center">
              The game is played on a star-shaped board with six points.
              Each player starts with 10 marbles in their home triangle.
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default HowToPlay;