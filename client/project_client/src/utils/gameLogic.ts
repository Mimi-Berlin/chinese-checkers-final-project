// import { BoardCell, MarbleColor, Position } from './types';

// // Generate board coordinates in a Star of David pattern
// export const generateBoardCoordinates = (): Array<{
//   row: number;
//   col: number;
//   x: number;
//   y: number;
// }> => {
//   const coordinates = [];
//   const centerX = 0.5;
//   const centerY = 0.5;
//   const cellSize = 0.045;
  
//   // Helper function to add a triangle section
//   const addTriangle = (startX: number, startY: number, rows: number, direction: 'up' | 'down', sectionIndex: number) => {
//     for (let row = 0; row < rows; row++) {
//       const cellsInRow = direction === 'up' ? row + 1 : rows - row;
//       const rowStartX = startX - (cellsInRow - 1) * cellSize / 2;
//       const rowY = direction === 'up' ? 
//         startY + row * cellSize * Math.sqrt(3) / 2 :
//         startY - row * cellSize * Math.sqrt(3) / 2;
      
//       for (let col = 0; col < cellsInRow; col++) {
//         coordinates.push({
//           row: sectionIndex * rows + row,
//           col,
//           x: rowStartX + col * cellSize,
//           y: rowY
//         });
//       }
//     }
//   };

//   // Add the six triangular corners
//   const triangleHeight = 4;
//   const radius = 0.35;
  
//   // Top triangle
//   addTriangle(centerX, centerY - radius, triangleHeight, 'up', 0);
  
//   // Bottom triangle
//   addTriangle(centerX, centerY + radius, triangleHeight, 'down', 1);
  
//   // Upper right triangle
//   addTriangle(
//     centerX + radius * Math.cos(Math.PI / 6),
//     centerY - radius * Math.sin(Math.PI / 6),
//     triangleHeight,
//     'down',
//     2
//   );
  
//   // Lower right triangle
//   addTriangle(
//     centerX + radius * Math.cos(Math.PI / 6),
//     centerY + radius * Math.sin(Math.PI / 6),
//     triangleHeight,
//     'up',
//     3
//   );
  
//   // Upper left triangle
//   addTriangle(
//     centerX - radius * Math.cos(Math.PI / 6),
//     centerY - radius * Math.sin(Math.PI / 6),
//     triangleHeight,
//     'down',
//     4
//   );
  
//   // Lower left triangle
//   addTriangle(
//     centerX - radius * Math.cos(Math.PI / 6),
//     centerY + radius * Math.sin(Math.PI / 6),
//     triangleHeight,
//     'up',
//     5
//   );
  
//   // Add the central hexagonal grid
//   const hexRadius = cellSize * 3;
//   const hexRows = 8;
//   const hexCols = 8;
  
//   for (let row = 0; row < hexRows; row++) {
//     const rowOffset = (hexCols - (row % 2 === 0 ? hexCols : hexCols - 1)) / 2;
//     for (let col = 0; col < hexCols; col++) {
//       const x = centerX + (col - hexCols/2 + rowOffset) * cellSize;
//       const y = centerY + (row - hexRows/2) * cellSize * Math.sqrt(3) / 2;
      
//       // Only add cells that form the central hexagonal pattern
//       const distanceFromCenter = Math.sqrt(
//         Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
//       );
      
//       if (distanceFromCenter <= hexRadius) {
//         coordinates.push({
//           row: 24 + row * hexCols + col,
//           col,
//           x,
//           y
//         });
//       }
//     }
//   }
  
//   return coordinates;
// };

// // Initialize board for specific number of players
// export const initializeBoard = (playerCount: number) => {
//   const coordinates = generateBoardCoordinates();
//   const cells = coordinates.map(coord => ({
//     id: `${coord.row}-${coord.col}`,
//     x: coord.x,
//     y: coord.y,
//     available: true,
//     marbleColor: 'empty' as MarbleColor
//   }));
  
//   // Helper to set marbles for a corner
//   const setCornerMarbles = (cornerIndex: number, color: MarbleColor) => {
//     const startIndex = cornerIndex * 10;
//     for (let i = 0; i < 10; i++) {
//       if (cells[startIndex + i]) {
//         cells[startIndex + i].marbleColor = color;
//       }
//     }
//   };
  
//   // Set up marbles based on player count
//   if (playerCount >= 2) {
//     setCornerMarbles(0, 'red'); // Top
//     setCornerMarbles(1, 'blue'); // Bottom
//   }
//   if (playerCount >= 3) {
//     setCornerMarbles(2, 'green'); // Upper right
//   }
//   if (playerCount >= 4) {
//     setCornerMarbles(3, 'yellow'); // Lower right
//   }
//   if (playerCount === 6) {
//     setCornerMarbles(4, 'purple'); // Upper left
//     setCornerMarbles(5, 'orange'); // Lower left
//   }
  
//   return cells;
// };

// // Get valid moves for a selected marble
// export const getValidMoves = (selectedId: string, boardCells: BoardCell[]): string[] => {
//   const validMoves: string[] = [];
  
//   const selectedCell = boardCells.find(cell => cell.id === selectedId);
//   if (!selectedCell) return validMoves;
  
//   // Helper function to check if a position is valid for jumping
//   const isValidJump = (fromX: number, fromY: number, toX: number, toY: number) => {
//     const midX = (fromX + toX) / 2;
//     const midY = (fromY + toY) / 2;
    
//     return boardCells.some(cell => 
//       cell.marbleColor !== 'empty' &&
//       Math.abs(cell.x - midX) < 0.01 &&
//       Math.abs(cell.y - midY) < 0.01
//     );
//   };
  
//   boardCells.forEach(cell => {
//     if (cell.marbleColor === 'empty') {
//       const distance = Math.sqrt(
//         Math.pow(cell.x - selectedCell.x, 2) + 
//         Math.pow(cell.y - selectedCell.y, 2)
//       );
      
//       // Direct move to adjacent cell
//       if (distance <= 0.055) {
//         validMoves.push(cell.id);
//       }
//       // Jump over another marble
//       else if (distance <= 0.11 && isValidJump(selectedCell.x, selectedCell.y, cell.x, cell.y)) {
//         validMoves.push(cell.id);
//       }
//     }
//   });
  
//   return validMoves;
// };

// // Generate a computer move
// export const generateComputerMove = () => {
//   return {
//     from: { row: 2, col: 1 },
//     to: { row: 3, col: 2 }
//   };
// };

// // Check if the game is over
// export const checkGameOver = (boardCells: BoardCell[]): { gameOver: boolean; winner: MarbleColor | null } => {
//   return { gameOver: false, winner: null };
// };