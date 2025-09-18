import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MarbleColor } from '../utils/types';
import { generateBoardCoordinates, getValidMoves, initializeBoard } from '../utils/gameLogic';

interface GameBoardProps {
  playerCount: number;
  currentPlayer: MarbleColor;
  selectedMarbleId: string | null;
  onMarbleSelect: (id: string, color: MarbleColor) => void;
  onMarbleMove: (fromId: string, toId: string) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({
  playerCount,
  currentPlayer,
  selectedMarbleId,
  onMarbleSelect,
  onMarbleMove
}) => {
  const [boardCells, setBoardCells] = useState<Array<{
    id: string;
    x: number;
    y: number;
    available: boolean;
    marbleColor: MarbleColor;
  }>>([]);
  
  const [validMoves, setValidMoves] = useState<string[]>([]);
  const [boardSize, setBoardSize] = useState({ width: 0, height: 0 });
  
  // Initialize board
  useEffect(() => {
    const cells = initializeBoard(playerCount);
    setBoardCells(cells);
    
    // Set board size based on window
    const size = Math.min(window.innerWidth * 0.9, 360);
    setBoardSize({ width: size, height: size });
  }, [playerCount]);
  
  // Update valid moves when a marble is selected
  useEffect(() => {
    if (selectedMarbleId) {
      const moves = getValidMoves(selectedMarbleId, boardCells);
      setValidMoves(moves);
    } else {
      setValidMoves([]);
    }
  }, [selectedMarbleId, boardCells]);
  
  // Handle cell click
  const handleCellClick = (id: string, marbleColor: MarbleColor) => {
    if (!selectedMarbleId && marbleColor === currentPlayer) {
      onMarbleSelect(id, marbleColor);
      return;
    }
    
    if (selectedMarbleId && validMoves.includes(id)) {
      onMarbleMove(selectedMarbleId, id);
      
      const updatedCells = [...boardCells];
      const fromIndex = updatedCells.findIndex(cell => cell.id === selectedMarbleId);
      const toIndex = updatedCells.findIndex(cell => cell.id === id);
      
      if (fromIndex !== -1 && toIndex !== -1) {
        updatedCells[toIndex].marbleColor = updatedCells[fromIndex].marbleColor;
        updatedCells[fromIndex].marbleColor = 'empty';
        setBoardCells(updatedCells);
      }
      
      return;
    }
    
    if (selectedMarbleId && marbleColor === currentPlayer) {
      onMarbleSelect(id, marbleColor);
      return;
    }
    
    if (selectedMarbleId) {
      onMarbleSelect('', 'empty');
    }
  };
  
  return (
    <motion.div 
      className="game-board relative"
      style={{ width: `${boardSize.width}px`, height: `${boardSize.height}px` }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Board background */}
      <div 
        className="absolute inset-0 bg-white/90 rounded-full shadow-lg"
        style={{ transform: 'scale(0.95)' }}
      />
      
      {/* Board grid pattern */}
      <div className="absolute inset-0" style={{ transform: 'scale(0.95)' }}>
        <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-light/20 to-primary-mint/20" />
      </div>
      
      {/* Marble pieces */}
      {boardCells.map((cell) => (
        <motion.div
          key={cell.id}
          className={`marble marble-${cell.marbleColor} ${
            selectedMarbleId === cell.id ? 'selected' : ''
          } ${validMoves.includes(cell.id) ? 'possible-move' : ''}`}
          style={{
            left: `${cell.x * boardSize.width}px`,
            top: `${cell.y * boardSize.height}px`,
            width: `${boardSize.width * 0.06}px`,
            height: `${boardSize.width * 0.06}px`,
          }}
          onClick={() => handleCellClick(cell.id, cell.marbleColor)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: Math.random() * 0.3 }}
        />
      ))}
    </motion.div>
  );
};

export default GameBoard;