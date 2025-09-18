// import React, { useState, useEffect } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import Header from '../components/Header';
// import GameBoard from '../components/GameBoard';
// import PlayerInfo from '../components/PlayerInfo';
// import { ZoomIn, MessageCircle } from 'lucide-react';
// import { motion } from 'framer-motion';
// import { Player, MarbleColor } from '../utils/types';
// import { generateComputerMove } from '../utils/gameLogic';

// const Game: React.FC = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const queryParams = new URLSearchParams(location.search);
//   const mode = queryParams.get('mode') || 'offline';
//   const type = queryParams.get('type') || 'computer';
//   const code = queryParams.get('code') || '';
  
//   const [currentPlayer, setCurrentPlayer] = useState<'red' | 'blue'>('blue');
//   const [players, setPlayers] = useState<Player[]>([
//     {
//       id: 'player',
//       type: 'human',
//       color: 'blue',
//       name: 'You',
//       avatar: 'https://robohash.org/player123?set=set3&size=150x150'
//     },
//     {
//       id: 'computer',
//       type: 'computer',
//       color: 'red',
//       name: 'Bot',
//       avatar: 'https://robohash.org/cpu456?set=set1&size=150x150'
//     }
//   ]);
  
//   const [showZoom, setShowZoom] = useState(false);
//   const [selectedMarbleId, setSelectedMarbleId] = useState<string | null>(null);
//   const [gameStarted, setGameStarted] = useState(false);
//   const [gameOver, setGameOver] = useState(false);
//   const [winner, setWinner] = useState<string | null>(null);
  
//   // Initialize game
//   useEffect(() => {
//     if (mode === 'online' && type === 'friend') {
//       // In a real app, we would connect to a game server here
//       console.log(`Connected to game with code: ${code}`);
//     }
    
//     setGameStarted(true);
//   }, [mode, type, code]);
  
//   // Handle computer turn
//   useEffect(() => {
//     if (gameStarted && currentPlayer === 'red' && mode === 'offline') {
//       const computerMoveTimer = setTimeout(() => {
//         // Simulate computer thinking
//         const computerMove = generateComputerMove();
//         if (computerMove) {
//           // Apply computer move
//           console.log("Computer made a move", computerMove);
          
//           // Switch turn back to player
//           setCurrentPlayer('blue');
//         }
//       }, 1500);
      
//       return () => clearTimeout(computerMoveTimer);
//     }
//   }, [currentPlayer, gameStarted, mode]);
  
//   // Handle marble selection
//   const handleMarbleSelect = (id: string, color: MarbleColor) => {
//     if (currentPlayer !== color || color === 'empty') return;
    
//     setSelectedMarbleId(id);
//   };
  
//   // Handle marble movement
//   const handleMarbleMove = (from: string, to: string) => {
//     // In a real implementation, this would update the board state
//     console.log(`Moving marble from ${from} to ${to}`);
    
//     // Switch turns
//     setCurrentPlayer(currentPlayer === 'red' ? 'blue' : 'red');
//     setSelectedMarbleId(null);
//   };
  
//   // Check for game over
//   const checkGameOver = () => {
//     // In a real implementation, this would check if a player has won
//   };
  
//   return (
//     <div className="flex flex-col min-h-screen">
//       <Header title="Game" />
      
//       <div className="flex-grow relative">
//         {/* Top player */}
//         <div className="absolute top-4 left-4 z-10">
//           <PlayerInfo 
//             player={players.find(p => p.color === 'red') as Player} 
//             isActive={currentPlayer === 'red'}
//           />
//         </div>
        
//         {/* Game board */}
//         <div className="flex justify-center items-center h-full pt-16 pb-24">
//           <GameBoard
//             currentPlayer={currentPlayer}
//             selectedMarbleId={selectedMarbleId}
//             onMarbleSelect={handleMarbleSelect}
//             onMarbleMove={handleMarbleMove}
//           />
//         </div>
        
//         {/* Bottom player */}
//         <div className="absolute bottom-4 right-4 z-10">
//           <PlayerInfo 
//             player={players.find(p => p.color === 'blue') as Player} 
//             isActive={currentPlayer === 'blue'}
//           />
//         </div>
        
//         {/* Zoom button */}
//         <motion.div
//           className="absolute bottom-4 right-4 z-20"
//           initial={{ scale: 0.9, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           transition={{ delay: 0.5 }}
//         >
//           <button
//             className="w-14 h-14 bg-white bg-opacity-70 rounded-full flex items-center justify-center shadow-lg"
//             onClick={() => setShowZoom(!showZoom)}
//           >
//             <ZoomIn size={24} color="#e63946" />
//           </button>
//         </motion.div>
        
//         {/* Turn indicator */}
//         <motion.div 
//           className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-80 px-8 py-3 rounded-full shadow-md"
//           initial={{ y: 50, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//         >
//           <div className="flex items-center justify-center">
//             <span className="mr-2">Your turn:</span>
//             <div className={`w-6 h-6 rounded-full ${currentPlayer === 'blue' ? 'bg-blue-marble' : 'bg-red-marble'}`}></div>
//           </div>
//         </motion.div>
//       </div>
//     </div>
//   );
// };

// export default Game;