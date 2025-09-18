import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from './Header';
import Card from './Card';
import Button from './Button';
import { MarbleColor } from '../utils/types';

const ColorSelect: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const colors: { color: MarbleColor; label: string; }[] = [
    { color: 'red', label: 'Red' },
    { color: 'blue', label: 'Blue' },
    { color: 'green', label: 'Green' },
    { color: 'yellow', label: 'Yellow' },
    { color: 'purple', label: 'Purple' },
    { color: 'orange', label: 'Orange' }
  ];

  const handleColorSelect = (color: MarbleColor) => {
    const currentParams = new URLSearchParams(location.search);
    currentParams.append('playerColor', color);
    navigate(`/game?${currentParams.toString()}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Choose Your Color" />
      
      <div className="flex-grow flex flex-col justify-center px-8 py-10">
        <Card>
          <h2 className="text-xl font-bold text-red-600 mb-6 text-center">
            Select your preferred color
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            {colors.map(({ color, label }) => (
              <motion.button
                key={color}
                onClick={() => handleColorSelect(color)}
                className="p-4 rounded-lg border-2 border-primary-mint hover:bg-primary-light/20 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div 
                    className={`w-12 h-12 rounded-full marble-${color}`}
                    style={{
                      background: `var(--${color === 'red' ? 'red' : 'blue'}-marble)`,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                  />
                  <span className="font-medium text-red-600">{label}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ColorSelect;