import React from 'react';
import { motion } from 'framer-motion';
import { Player } from '../utils/types';

interface PlayerInfoProps {
  player: Player;
  isActive: boolean;
}

const PlayerInfo: React.FC<PlayerInfoProps> = ({ player, isActive }) => {
  return (
    <motion.div 
      className="flex items-center"
      initial={{ x: player.color === 'red' ? -50 : 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className={`relative rounded-full overflow-hidden w-16 h-16 border-2 ${
          isActive ? `border-${player.color === 'red' ? 'red-500' : 'blue-500'} shadow-lg` : 'border-gray-300'
        }`}
        animate={{ 
          scale: isActive ? 1.05 : 1,
          boxShadow: isActive ? '0 0 15px rgba(255, 255, 255, 0.7)' : 'none'
        }}
      >
        <img 
          src={player.avatar} 
          alt={player.name}
          className="w-full h-full object-cover"
        />
        <div 
          className={`absolute bottom-0 right-0 w-4 h-4 rounded-full ${
            player.color === 'red' ? 'bg-red-marble' : 'bg-blue-marble'
          }`}
        />
      </motion.div>
      
      <div className={`ml-2 ${player.color === 'red' ? 'text-left' : 'text-right'}`}>
        <div className="font-semibold">{player.name}</div>
        {player.type === 'computer' && (
          <div className="text-xs text-gray-600">AI Level 2.5</div>
        )}
      </div>
    </motion.div>
  );
};

export default PlayerInfo;