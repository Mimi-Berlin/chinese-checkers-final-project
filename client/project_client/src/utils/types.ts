// export type MarbleColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange' | 'empty';

// export type Position = {
//   row: number;
//   col: number;
// };

// export type Marble = {
//   id: string;
//   color: MarbleColor;
//   position: Position;
// };

// export type BoardCell = {
//   row: number;
//   col: number;
//   x: number;
//   y: number;
//   available: boolean;
//   marbleId: string | null;
// };

// export type PlayerType = 'human' | 'computer';

// export type Player = {
//   id: string;
//   type: PlayerType;
//   color: MarbleColor;
//   name: string;
//   avatar?: string;
// };

// export type GameMode = 'offline' | 'online';
// export type OnlineGameType = 'random' | 'friend' | 'public';

// export type GameState = {
//   mode: GameMode;
//   onlineType?: OnlineGameType;
//   players: Player[];
//   currentPlayerIndex: number;
//   board: BoardCell[];
//   marbles: Marble[];
//   selectedMarbleId: string | null;
//   validMoves: Position[];
//   gameOver: boolean;
//   winner: string | null;
//   maxPlayers: number;
//   gameCode?: string;
// };