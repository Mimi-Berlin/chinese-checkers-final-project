
import React, { Component, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import '../components/board.scss';
import Header from '../components/Header';
import { startBackgroundMusic, stopBackgroundMusic } from '../sound/sound';

interface Position {
  row: number;
  col: number;
  key: string;
  isChess: boolean;
  color: string;
  piece?: number;
}

interface Move {
  row: number;
  col: number;
}

interface BoardState {
  positions: Position[];
  selectedPiece: Position | null;
  possibleMoves: Move[];
  currentPlayer: string;
  currentPlayerIndex: number; 
  gameId: string | null;
  boardState: any;
  numPlayers: number;
  gameOver: boolean; 
  isLoading: boolean; 
  error: string | null; 
  errorMessage: string | null;
}

interface BoardProps {
  socket: {
    send: (msg: any) => void;
    on: (type: string, callback: (data: any) => void) => void;
    off: (type: string) => void;
  };
}

const BOARD_SIZE = 17;

// ✅ מיפוי צבעים לפי סוג הכדור מהשרת
const PIECE_COLORS: { [key: number]: string } = {
  0: 'transparent', // ריק
  1: 'pink',       // שחקן 1
  2: 'orange',     // שחקן 2  
  3: 'brown',      // שחקן 3
  4: 'green',      // שחקן 4
  5: 'blue',       // שחקן 5
  6: 'purple'      // שחקן 6
};

const SERVER_POSITIONS = {
  CORNER_1: [
    { row: 0, col: 12 }, { row: 1, col: 11 }, { row: 1, col: 12 },
    { row: 2, col: 10 }, { row: 2, col: 11 }, { row: 2, col: 12 },
    { row: 3, col: 9 }, { row: 3, col: 10 }, { row: 3, col: 11 }, { row: 3, col: 12 }
  ],
  CORNER_4: [
    { row: 16, col: 4 }, { row: 15, col: 4 }, { row: 15, col: 5 },
    { row: 14, col: 4 }, { row: 14, col: 5 }, { row: 14, col: 6 },
    { row: 13, col: 4 }, { row: 13, col: 5 }, { row: 13, col: 6 }, { row: 13, col: 7 }
  ],
  CORNER_2: [
    { row: 4, col: 16 }, { row: 4, col: 15 }, { row: 5, col: 15 },
    { row: 4, col: 14 }, { row: 5, col: 14 }, { row: 6, col: 14 },
    { row: 4, col: 13 }, { row: 5, col: 13 }, { row: 6, col: 13 }, { row: 7, col: 13 }
  ],
  CORNER_3: [
    { row: 12, col: 12 }, { row: 11, col: 12 }, { row: 12, col: 11 },
    { row: 10, col: 12 }, { row: 11, col: 11 }, { row: 12, col: 10 },
    { row: 9, col: 12 }, { row: 10, col: 11 }, { row: 11, col: 10 }, { row: 12, col: 9 }
  ],
  CORNER_6: [
    { row: 4, col: 4 }, { row: 4, col: 5 }, { row: 5, col: 4 },
    { row: 4, col: 6 }, { row: 5, col: 5 }, { row: 6, col: 4 },
    { row: 4, col: 7 }, { row: 5, col: 6 }, { row: 6, col: 5 }, { row: 7, col: 4 }
  ],
  CORNER_5: [
    { row: 12, col: 0 }, { row: 11, col: 1 }, { row: 12, col: 1 },
    { row: 10, col: 2 }, { row: 11, col: 2 }, { row: 12, col: 2 },
    { row: 9, col: 3 }, { row: 10, col: 3 }, { row: 11, col: 3 }, { row: 12, col: 3 }
  ]
};

const createValidPositions = (): Position[] => {
  const positions: Position[] = [];
  const center = Math.floor(BOARD_SIZE / 2);
  const hexRadius = 4;

 
  for (let r = -hexRadius; r <= hexRadius; r++) {
    const rowStart = Math.max(-hexRadius, -r - hexRadius);
    const rowEnd = Math.min(hexRadius, -r + hexRadius);

    for (let q = rowStart; q <= rowEnd; q++) {
      const row = center + r;
      const col = center + q;

      if (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE) {
        positions.push({
          row,
          col,
          key: `center-${row}-${col}`,
          isChess: false, 
          color: 'empty',
          piece: 0
        });
      }
    }
  }

  const corners = [
    { positions: SERVER_POSITIONS.CORNER_1, color: 'empty', cornerIndex: 1 },
    { positions: SERVER_POSITIONS.CORNER_2, color: 'empty', cornerIndex: 2 },
    { positions: SERVER_POSITIONS.CORNER_3, color: 'empty', cornerIndex: 3 },
    { positions: SERVER_POSITIONS.CORNER_4, color: 'empty', cornerIndex: 4 },
    { positions: SERVER_POSITIONS.CORNER_5, color: 'empty', cornerIndex: 5 },
    { positions: SERVER_POSITIONS.CORNER_6, color: 'empty', cornerIndex: 6 }
  ];

  corners.forEach(corner => {
    corner.positions.forEach((pos, index) => {
      positions.push({
        row: pos.row,
        col: pos.col,
        key: `corner-${corner.cornerIndex}-${index}`,
        isChess: false, // ✅ השרת יחליט איזה כדורים יהיו
        color: 'empty',
        piece: 0
      });
    });
  });

  return positions;
};

const positionToScreen = (row: number, col: number, boardWidth = 400, boardHeight = 400) => {
  const centerX = boardWidth / 2 + 20;
  const centerY = boardHeight / 2 + 13;
  const cellSize = Math.min(boardWidth, boardHeight) / (BOARD_SIZE - 5);
  const relativeRow = row - (BOARD_SIZE / 2);
  const relativeCol = col - (BOARD_SIZE / 2);
  const x = centerX + (relativeCol * cellSize * 0.85) + (relativeRow * cellSize * 0.42);
  const y = centerY + (relativeRow * cellSize * 0.75);
  return { x, y };
};

class Board extends Component<BoardProps, BoardState> {
  state: BoardState = {
    positions: [],
    selectedPiece: null,
    possibleMoves: [],
    currentPlayer: 'שחקן 1',
    currentPlayerIndex: 0, 
    gameId: null,
    boardState: {},
    numPlayers: 2, 
    gameOver: false, 
    isLoading: true, 
    error: null ,
    errorMessage: null
  };

  componentDidMount() {
    console.log('🎮 Board component mounted');
    
    const positions = createValidPositions();
    this.setState({ positions });
    const params  = new URLSearchParams(window.location.search);
    const gameId  = params.get('gameId'); 
    if (gameId) {
      console.log(' נמצא game_id:', gameId);
      this.setState({ gameId });
      this.setupSocketListeners(); 
      this.requestBoardState(gameId);
    } else {
      console.log(' לא נמצא game_id');
      this.setState({ 
        error: 'לא נמצא מזהה משחק. אנא צור משחק חדש.',
        isLoading: false 
      });
    }
  }

  componentWillUnmount() {
    this.cleanupSocketListeners();
  }

  // ✅ הגדרת מאזינים לאירועים מהשרת
  setupSocketListeners = () => {
    if (this.props.socket) {
      this.props.socket.on('board_state', this.handleBoardState);
      this.props.socket.on('possible_moves', this.handlePossibleMoves);
      this.props.socket.on('move_result', this.handleMoveResult);
      //this.props.socket.on('move_rejected', this.handleMoveRejected);
      this.props.socket.on('move_rejected', (data) => {
        console.log('❌ Move rejected:', data);
        
        // הצג הודעת שגיאה
        this.setState({ 
          errorMessage: data.message,
          selectedPiece: null, 
          possibleMoves: [] 
        });
        
        // הסתר את ההודעה אחרי 3 שניות
        setTimeout(() => {
          this.setState({ errorMessage: null });
        }, 3000);
      });

      this.props.socket.on('bot_move', this.handleBotMove);
      this.props.socket.on('error', this.handleError);
      console.log('🔗 Socket listeners הוגדרו');
    }
  };

  // ✅ ניקוי מאזינים
  cleanupSocketListeners = () => {
    if (this.props.socket) {
      this.props.socket.off('board_state');
      this.props.socket.off('possible_moves');
      this.props.socket.off('move_result');
      this.props.socket.off('move_rejected');
      this.props.socket.off('bot_move');
      this.props.socket.off('error');
      console.log('🧹 Socket listeners נוקו');
    }
  };

  requestBoardState = (gameId: string) => {
    console.log('🎯 מבקש מצב לוח למשחק:', gameId);
    if (this.props.socket?.send) {
      this.props.socket.send({
        type: 'get_board_state',
        game_id: gameId
      });
    }
  };

  handleBoardState = (data: any) => {
    console.log('📥 קיבלתי מצב לוח:', data);
    
    if (data.status === 'success') {
      const { board_state, num_players, current_player_index, current_player_name, game_over } = data;
      
      // עדכון המיקומים עם הנתונים מהשרת
      const updatedPositions = this.state.positions.map(pos => {
        const serverData = board_state.find((cell: any) => 
          cell.row === pos.row && cell.col === pos.col
        );
        
        if (serverData) {
          return {
            ...pos,
            isChess: !serverData.isEmpty,
            color: serverData.isEmpty ? 'empty' : PIECE_COLORS[serverData.piece] || 'empty',
            piece: serverData.piece
          };
        }
        
        return pos;
      });

      this.setState({
        positions: updatedPositions,
        numPlayers: num_players,
        currentPlayerIndex: current_player_index,
        currentPlayer: current_player_name,
        gameOver: game_over,
        isLoading: false
      });

      console.log(`לוח עודכן: ${num_players} שחקנים, תור: ${current_player_name}`);
    }
  };

  requestPossibleMoves = (row: number, col: number) => {
    const { gameId } = this.state;
    if (gameId && this.props.socket?.send) {
      console.log(`מבקש מהלכים אפשריים מ-(${row},${col})`);
      this.props.socket.send({
        type: 'get_possible_moves',
        game_id: gameId,
        position: { row, col }
      });
    }
  };

  handlePossibleMoves = (data: any) => {
    console.log('📋 מהלכים אפשריים:', data);
    if (data.status == 'success') {
      this.setState({ possibleMoves: data.moves });
    } else {
      this.setState({ possibleMoves: [] });
    }
  };

  sendMove = (fromRow: number, fromCol: number, toRow: number, toCol: number) => {
    const { gameId } = this.state;
    if (gameId && this.props.socket?.send) {
      console.log(`שולח מהלך: (${fromRow},${fromCol}) → (${toRow},${toCol})`);
      this.props.socket.send({
        type: 'make_move',
        game_id: gameId,
        player_index: this.state.currentPlayerIndex,
        from: { row: fromRow, col: fromCol },
        to: { row: toRow, col: toCol }
      });
    }
  };

  handleMoveResult = (data: any) => {
    console.log('🎯 תוצאת מהלך:', data);
    if (data.status === 'success') {
      this.setState({ 
        selectedPiece: null, 
        possibleMoves: [],
        currentPlayerIndex: data.current_player,
        currentPlayer: data.current_player_name,
        gameOver: data.game_over
      });

      if (data.game_over) {
        setTimeout(() => {
          alert(`🏆 המשחק הסתיים! ${data.current_player_name} ניצח!`);
        }, 500);
      }
    } else {
      console.log('❌ מהלך נכשל:', data.message);
    }
  };

  handleMoveRejected = (data: any) => {
    console.log('לא תורך כרגע!', data);
  };


  //  טיפול במהלך הבוט
handleBotMove = (data: any) => {
  console.log('🤖 מהלך הבוט:', data);
  if (data.status === 'success') {
      //  רק עדכן את המצב - עדכון הלוח יגיע בנפרד
      this.setState({
          currentPlayerIndex: data.current_player_index,
          currentPlayer: data.current_player_name,
          gameOver: data.game_over
      });

      // הצג פרטי מהלך אם יש
      if (data.move_details) {
          console.log(`   Progress: ${data.move_details.progress}, Depth: ${data.move_details.depth_bonus}, Total: ${data.move_details.total_score}`);
      }

      if (data.game_over) {
          setTimeout(() => {
              alert(`🏆 המשחק הסתיים! ${data.current_player_name} ניצח!`);
          }, 1000);
      }
  }
};

  // ✅ טיפול בשגיאות
  handleError = (data: any) => {
    console.error('❌ שגיאה מהשרת:', data);
    this.setState({ error: data.message });
  };

  // ✅ קבלת סוג הכדור הצפוי לשחקן (בהתאם למיפוי בשרת)
  getExpectedPieceForPlayer = (playerIndex: number): number => {
    const numPlayers = this.state.numPlayers;
    
    if (numPlayers === 2) {
      if (playerIndex === 0) return 1; // PLAYER1
      else if (playerIndex === 1) return 4; // PLAYER4
    } else if (numPlayers === 3) {
      if (playerIndex === 0) return 1; // PLAYER1
      else if (playerIndex === 1) return 3; // PLAYER3
      else if (playerIndex === 2) return 5; // PLAYER5
    } else if (numPlayers === 4) {
      if (playerIndex === 0) return 1; // PLAYER1
      else if (playerIndex === 1) return 3; // PLAYER3
      else if (playerIndex === 2) return 4; // PLAYER4
      else if (playerIndex === 3) return 6; // PLAYER6
    } else if (numPlayers === 6) {
      return playerIndex + 1; // שחקן 0 = כדור 1, שחקן 1 = כדור 2, וכו'
    }
    
    return playerIndex + 1; // ברירת מחדל
  };

  handlePieceClick = (position: Position) => {
    const { selectedPiece, currentPlayerIndex, gameOver } = this.state;
    
    if (gameOver) {
      console.log('❌ המשחק הסתיים!');
      return;
    }
    
    // ✅ בדיקה שזה הכדור של השחקן הנוכחי
    const expectedPiece = this.getExpectedPieceForPlayer(currentPlayerIndex);
    if (position.piece !== expectedPiece) {
      console.log(`❌ זה לא הכדור שלך! אתה שחקן ${currentPlayerIndex}, צריך כדור ${expectedPiece}, זה כדור ${position.piece}`);
      return;
    }
    
    if (selectedPiece && selectedPiece.row === position.row && selectedPiece.col === position.col) {
      this.setState({ selectedPiece: null, possibleMoves: [] });
      return;
    }
    
    this.setState({ selectedPiece: position });
    this.requestPossibleMoves(position.row, position.col);
  };

  handleEmptyClick = (position: Position) => {
    const { selectedPiece, possibleMoves, gameOver } = this.state;
    
    if (gameOver) {
      console.log('❌ המשחק הסתיים!');
      return;
    }
    
    if (!selectedPiece) return;
    
    const isValidMove = possibleMoves.some(move =>
      move.row === position.row && move.col === position.col
    );
    
    if (!isValidMove) {
      console.log('❌ מהלך לא חוקי');
      return;
    }
    
    this.sendMove(selectedPiece.row, selectedPiece.col, position.row, position.col);
  };

  isPossibleMove = (row: number, col: number): boolean => {
    return this.state.possibleMoves.some(move => move.row === row && move.col === col);
  };

  isSelected = (row: number, col: number): boolean => {
    const { selectedPiece } = this.state;
    return !!(selectedPiece && selectedPiece.row === row && selectedPiece.col === col);
  };


  
  render() {
    const { 
      positions, 
      selectedPiece, 
      possibleMoves, 
      currentPlayer, 
      numPlayers, 
      gameOver, 
      isLoading, 
      error , errorMessage
    } = this.state;
    
    const boardWidth = 400;
    const boardHeight = 400;

    // מסך טעינה
    if (isLoading) {
      return (
        <div className="App board-container" style={{ 
          width: boardWidth, 
          height: boardHeight, 
          position: 'relative', 
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
      <Header title="לוח המשחק" />

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>🎯</div>
            <div style={{ color: '#e63946' }}>טוען משחק...</div>
          </div>
        </div>
      );
    }

    // מסך שגיאה
    if (error) {
      return (
        <div className="App board-container" style={{ 
          width: boardWidth, 
          height: boardHeight, 
          position: 'relative', 
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>❌</div>
            <div style={{ color: '#e63946', marginBottom: '15px' }}>{error}</div>
            <button 
              onClick={() => window.location.href = '/home'}
              style={{
                background: '#e63946',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              חזור לעמוד הבית
            </button>
          </div>
        </div>
      );
    }

    return (
  <div className="flex flex-col min-h-screen">
          <Header title="משחק" />
      <div className="App board-container" style={{ width: boardWidth, height: boardHeight, position: 'relative', margin: '0 auto' }}>
        <div className="board-background" />
        {positions.map((pos) => {
          const screenPos = positionToScreen(pos.row, pos.col, boardWidth, boardHeight);
          const isSelectedPos = this.isSelected(pos.row, pos.col);
          const isPossibleMovePos = this.isPossibleMove(pos.row, pos.col);
          
          return (
            <div
              key={pos.key}
              className={`chess ${pos.isChess ? 'piece' : 'empty'} ${isSelectedPos ? 'selected' : ''} ${isPossibleMovePos ? 'possible-move' : ''}`}
              style={{
                left: screenPos.x,
                top: screenPos.y,
                backgroundColor: pos.isChess ? pos.color : (isPossibleMovePos ? '#22c55e' : '#e5e7eb'),
                width: pos.isChess ? '24px' : (isPossibleMovePos ? '20px' : '12px'),
                height: pos.isChess ? '24px' : (isPossibleMovePos ? '20px' : '12px'),
                border: isPossibleMovePos ? '2px dashed #15803d' : 'none',
                cursor: (pos.isChess || isPossibleMovePos) ? 'pointer' : 'default',
                zIndex: pos.isChess ? 10 : (isPossibleMovePos ? 5 : 1),
                position: 'absolute'
              }}
              onClick={() => {
                if (pos.isChess) this.handlePieceClick(pos);
                else if (isPossibleMovePos) this.handleEmptyClick(pos);
              }}
            >
              {/* ✅ הוספתי פרטי כדור לדיבוג */}
              {pos.isChess && (
                <div className="piece-number" style={{ fontSize: '8px', color: 'white' }}>
                  {pos.piece}
                </div>
              )}
            </div>
          );
        })}
 {/* ✅ מידע מורחב על המשחק */}
 <div className="game-info">
          <div>שחקנים: {numPlayers}</div>
          <div>תור: {currentPlayer}</div>
          {selectedPiece && <div>נבחר: ({selectedPiece.row},{selectedPiece.col})</div>}
          {possibleMoves.length > 0 && <div>מהלכים אפשריים: {possibleMoves.length}</div>}
          {gameOver && <div style={{ color: 'red', fontWeight: 'bold' }}>🏆 המשחק הסתיים!</div>}
        </div>
        {errorMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#ef4444',
          color: 'white',
          padding: '15px 25px',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: 'bold',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
          ❌ {errorMessage}
        </div>
      )}
      </div>

      </div>
    );
  }
}

const BoardWithSocket: React.FC = (props) => {
  const socket = useSocket();


  useEffect(() => {
    startBackgroundMusic();
    return () => {
      stopBackgroundMusic(); 
    };
  }, []);
  
  return <Board {...props} socket={socket} />;
};

export default BoardWithSocket;





// import React, { Component, useEffect } from 'react';
// import { useSocket } from '../contexts/SocketContext';
// import '../components/board.scss';
// import { startBackgroundMusic, stopBackgroundMusic } from '../sound/sound';

// interface Position {
//   row: number;
//   col: number;
//   key: string;
//   isChess: boolean;
//   color: string;
//   piece?: number; 
// }

// interface Move {
//   row: number;
//   col: number;
// }

// interface BoardState {
//   positions: Position[];
//   selectedPiece: Position | null;
//   possibleMoves: Move[];
//   currentPlayer: string;
//   currentPlayerIndex: number; 
//   gameId: string | null;
//   boardState: any;
//   numPlayers: number; 
//   gameOver: boolean; 
//   isLoading: boolean; 
//   error: string | null; 

//   yourPlayerInfo?: {
//     playerId: string;
//     playerName: string;
//     playerIndex: number;
//     color: string;
//     pieceType: number;
//     isHost: boolean;
//     gameType: 'bot' | 'multiplayer';
//   };
//   gameType: 'bot' | 'multiplayer';
//   isYourTurn: boolean;
// }

// interface BoardProps {
//   socket: {
//     send: (msg: any) => void;
//     on: (type: string, callback: (data: any) => void) => void;
//     off: (type: string) => void;
//   };
// }

// const BOARD_SIZE = 17;


// const PIECE_COLORS: { [key: number]: string } = {
//   0: 'transparent', // ריק
//   1: 'pink',       // שחקן 1
//   2: 'orange',     // שחקן 2  
//   3: 'brown',      // שחקן 3
//   4: 'green',      // שחקן 4
//   5: 'blue',       // שחקן 5
//   6: 'purple'      // שחקן 6
// };

// const SERVER_POSITIONS = {
//   CORNER_1: [
//     { row: 0, col: 12 }, { row: 1, col: 11 }, { row: 1, col: 12 },
//     { row: 2, col: 10 }, { row: 2, col: 11 }, { row: 2, col: 12 },
//     { row: 3, col: 9 }, { row: 3, col: 10 }, { row: 3, col: 11 }, { row: 3, col: 12 }
//   ],
//   CORNER_4: [
//     { row: 16, col: 4 }, { row: 15, col: 4 }, { row: 15, col: 5 },
//     { row: 14, col: 4 }, { row: 14, col: 5 }, { row: 14, col: 6 },
//     { row: 13, col: 4 }, { row: 13, col: 5 }, { row: 13, col: 6 }, { row: 13, col: 7 }
//   ],
//   CORNER_2: [
//     { row: 4, col: 16 }, { row: 4, col: 15 }, { row: 5, col: 15 },
//     { row: 4, col: 14 }, { row: 5, col: 14 }, { row: 6, col: 14 },
//     { row: 4, col: 13 }, { row: 5, col: 13 }, { row: 6, col: 13 }, { row: 7, col: 13 }
//   ],
//   CORNER_3: [
//     { row: 12, col: 12 }, { row: 11, col: 12 }, { row: 12, col: 11 },
//     { row: 10, col: 12 }, { row: 11, col: 11 }, { row: 12, col: 10 },
//     { row: 9, col: 12 }, { row: 10, col: 11 }, { row: 11, col: 10 }, { row: 12, col: 9 }
//   ],
//   CORNER_6: [
//     { row: 4, col: 4 }, { row: 4, col: 5 }, { row: 5, col: 4 },
//     { row: 4, col: 6 }, { row: 5, col: 5 }, { row: 6, col: 4 },
//     { row: 4, col: 7 }, { row: 5, col: 6 }, { row: 6, col: 5 }, { row: 7, col: 4 }
//   ],
//   CORNER_5: [
//     { row: 12, col: 0 }, { row: 11, col: 1 }, { row: 12, col: 1 },
//     { row: 10, col: 2 }, { row: 11, col: 2 }, { row: 12, col: 2 },
//     { row: 9, col: 3 }, { row: 10, col: 3 }, { row: 11, col: 3 }, { row: 12, col: 3 }
//   ]
// };


// const createValidPositions = (): Position[] => {
//   const positions: Position[] = [];
//   const center = Math.floor(BOARD_SIZE / 2);
//   const hexRadius = 4;

//   // יצירת המשושה המרכזי
//   for (let r = -hexRadius; r <= hexRadius; r++) {
//     const rowStart = Math.max(-hexRadius, -r - hexRadius);
//     const rowEnd = Math.min(hexRadius, -r + hexRadius);

//     for (let q = rowStart; q <= rowEnd; q++) {
//       const row = center + r;
//       const col = center + q;

//       if (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE) {
//         positions.push({
//           row,
//           col,
//           key: `center-${row}-${col}`,
//           isChess: false, //  השרת יחליט
//           color: 'empty',
//           piece: 0
//         });
//       }
//     }
//   }

//   // הוספת הפינות
//   const corners = [
//     { positions: SERVER_POSITIONS.CORNER_1, color: 'empty', cornerIndex: 1 },
//     { positions: SERVER_POSITIONS.CORNER_2, color: 'empty', cornerIndex: 2 },
//     { positions: SERVER_POSITIONS.CORNER_3, color: 'empty', cornerIndex: 3 },
//     { positions: SERVER_POSITIONS.CORNER_4, color: 'empty', cornerIndex: 4 },
//     { positions: SERVER_POSITIONS.CORNER_5, color: 'empty', cornerIndex: 5 },
//     { positions: SERVER_POSITIONS.CORNER_6, color: 'empty', cornerIndex: 6 }
//   ];

//   corners.forEach(corner => {
//     corner.positions.forEach((pos, index) => {
//       positions.push({
//         row: pos.row,
//         col: pos.col,
//         key: `corner-${corner.cornerIndex}-${index}`,
//         isChess: false, 
//         color: 'empty',
//         piece: 0
//       });
//     });
//   });

//   return positions;
// };

// const positionToScreen = (row: number, col: number, boardWidth = 400, boardHeight = 400) => {
//   const centerX = boardWidth / 2 + 20;
//   const centerY = boardHeight / 2 + 13;
//   const cellSize = Math.min(boardWidth, boardHeight) / (BOARD_SIZE - 5);
//   const relativeRow = row - (BOARD_SIZE / 2);
//   const relativeCol = col - (BOARD_SIZE / 2);
//   const x = centerX + (relativeCol * cellSize * 0.85) + (relativeRow * cellSize * 0.42);
//   const y = centerY + (relativeRow * cellSize * 0.75);
//   return { x, y };
// };

// class Board extends Component<BoardProps, BoardState> {
//   state: BoardState = {
//     positions: [],
//     selectedPiece: null,
//     possibleMoves: [],
//     currentPlayer: 'שחקן 1',
//     currentPlayerIndex: 0, 
//     gameId: null,
//     boardState: {},
//     numPlayers: 2, 
//     gameOver: false, 
//     isLoading: true, 
//     error: null ,
//     yourPlayerInfo: undefined,
//     gameType: 'bot', // ברירת מחדל
//     isYourTurn: false
//   };

//   componentDidMount() {
//     console.log('🎮 Board component mounted');
    
//     const positions = createValidPositions();
//     this.setState({ positions });
//     const params  = new URLSearchParams(window.location.search);
//     const gameId  = params.get('gameId'); 
//     //const gameId = sessionStorage.getItem('game_id');
    
//     const yourPlayerInfo = sessionStorage.getItem('your_player_info');
    
//     if (yourPlayerInfo) {
//       const playerInfo = JSON.parse(yourPlayerInfo);
//       const gameType = playerInfo.gameType || 'bot'; // ברירת מחדל בוט אם לא צוין
      
//       this.setState({ 
//         yourPlayerInfo: playerInfo,
//         gameType: gameType
//       });
      
//       console.log('👤 Player info loaded:', playerInfo);
//       console.log('🎯 Game type:', gameType);
//     }
    
//     if (gameId) {
//       console.log('✅ נמצא game_id:', gameId);
//       this.setState({ gameId });
//       this.setupSocketListeners(); 
//       this.requestBoardState(gameId);
//     } else {
//       console.log('❌ לא נמצא game_id');
//       this.setState({ 
//         error: 'לא נמצא מזהה משחק. אנא צור משחק חדש.',
//         isLoading: false 
//       });
//     }
//   }

//   componentWillUnmount() {
//     this.cleanupSocketListeners(); 
//   }


//   setupSocketListeners = () => {
//     if (this.props.socket) {
//       this.props.socket.on('board_state', this.handleBoardState);
//       this.props.socket.on('board_state_update', this.handleBoardState); // ✅ גם עבור עדכונים
//       this.props.socket.on('possible_moves', this.handlePossibleMoves);
//       this.props.socket.on('move_result', this.handleMoveResult);
//       this.props.socket.on('bot_move', this.handleBotMove);
//       this.props.socket.on('game_over', this.handleGameOver);
//       this.props.socket.on('error', this.handleError);
//       console.log('🔗 Socket listeners הוגדרו');
//     }
//   };

//   cleanupSocketListeners = () => {
//     if (this.props.socket) {
//       this.props.socket.off('board_state');
//       this.props.socket.off('board_state_update');
//       this.props.socket.off('possible_moves');
//       this.props.socket.off('move_result');
//       this.props.socket.off('bot_move');
//       this.props.socket.off('game_over');
//       this.props.socket.off('error');
//       console.log('🧹 Socket listeners נוקו');
//     }
//   };

//   requestBoardState = (gameId: string) => {
//     console.log('🎯 מבקש מצב לוח למשחק:', gameId);
    
//     const { yourPlayerInfo, gameType } = this.state;
    
    
//     if (this.props.socket?.send) {
//       const request: any = {
//         type: 'get_board_state',
//         game_id: gameId
//       };
      
//       // ✅ במשחק מולטיפלייר - שלח את ה-playerIndex שלך
//       if (gameType === 'multiplayer' && yourPlayerInfo) {
//         request.player_index = yourPlayerInfo.playerIndex;
//         console.log('👥 Multiplayer: שולח player_index:', yourPlayerInfo.playerIndex);
//       } else {
//         console.log('🤖 Bot game: לא שולח player_index');
//       }
      
//       this.props.socket.send(request);
//     }
//   };

//   // // ✅ טיפול בתגובת מצב הלוח מהשרת
//   // handleBoardState = (data: any) => {
//   //   console.log('📥 קיבלתי מצב לוח:', data);
    
//   //   if (data.status === 'success') {
//   //     const { board_state, num_players, current_player, current_player_name, game_over } = data;
      
//   //     // עדכון המיקומים עם הנתונים מהשרת
//   //     const updatedPositions = this.state.positions.map(pos => {
//   //       const serverData = board_state.find((cell: any) => 
//   //         cell.row === pos.row && cell.col === pos.col
//   //       );
        
//   //       if (serverData) {
//   //         return {
//   //           ...pos,
//   //           isChess: !serverData.isEmpty,
//   //           color: serverData.isEmpty ? 'empty' : PIECE_COLORS[serverData.piece] || 'empty',
//   //           piece: serverData.piece
//   //         };
//   //       }
        
//   //       return pos;
//   //     });

//   //     this.setState({
//   //       positions: updatedPositions,
//   //       numPlayers: num_players,
//   //       currentPlayerIndex: current_player,
//   //       currentPlayer: current_player_name,
//   //       gameOver: game_over,
//   //       isLoading: false
//   //     });

//   //     console.log(`✅ לוח עודכן: ${num_players} שחקנים, תור: ${current_player_name}`);
//   //   }
//   // };



//   // ✅ טיפול בתגובת מצב הלוח - מותאם לסוג המשחק
//   handleBoardState = (data: any) => {
//     console.log('📥 קיבלתי מצב לוח:', data);
    
//     if (data.status === 'success') {
//       const { 
//         board_state, 
//         num_players, 
//         current_player_index, 
//         current_player_name, 
//         game_over,
//         game_type,
//         yourPlayerInfo: serverPlayerInfo 
//       } = data;
      
//       // עדכון המיקומים עם הנתונים מהשרת
//       const updatedPositions = this.state.positions.map(pos => {
//         const serverData = board_state.find((cell: any) => 
//           cell.row === pos.row && cell.col === pos.col
//         );
        
//         if (serverData) {
//           return {
//             ...pos,
//             isChess: !serverData.isEmpty,
//             color: this.getPieceColor(serverData.piece),
//             piece: serverData.piece
//           };
//         }
//         return pos;
//       });

//       // ✅ קביעה האם זה התור שלך (לפי סוג המשחק)
//       let isYourTurn = false;
//       const { yourPlayerInfo, gameType: stateGameType } = this.state;
      
//       // בדיקה איזה סוג משחק זה (מהשרת או מה-state)
//       const actualGameType = game_type || stateGameType;
      
//       if (actualGameType === 'bot' || stateGameType === 'bot') {
//         // במשחק בוט - התור שלך רק כש-current_player_index = 0
//         isYourTurn = current_player_index === 0;
//         console.log('🤖 Bot game - isYourTurn:', isYourTurn, 'current_player_index:', current_player_index);
//       } else if ((actualGameType === 'multiplayer' || stateGameType === 'multiplayer') && yourPlayerInfo) {
//         // במשחק מולטיפלייר - התור שלך כש-current_player_index = playerIndex שלך
//         isYourTurn = current_player_index === yourPlayerInfo.playerIndex;
//         console.log('👥 Multiplayer game - isYourTurn:', isYourTurn, 'current_player_index:', current_player_index, 'yourPlayerIndex:', yourPlayerInfo.playerIndex);
//       }
      
//       // אם יש מידע אישי מהשרת (משחק בוט), השתמש בו
//       if (serverPlayerInfo && serverPlayerInfo.hasOwnProperty('isYourTurn')) {
//         isYourTurn = serverPlayerInfo.isYourTurn;
//         console.log('✅ Using server yourPlayerInfo - isYourTurn:', isYourTurn);
//       }

//       this.setState({
//         positions: updatedPositions,
//         currentPlayer: current_player_name,
//         currentPlayerIndex: current_player_index,
//         numPlayers: num_players,
//         gameOver: game_over,
//         isYourTurn: isYourTurn,
//         gameType: actualGameType || stateGameType, // עדכן גם את סוג המשחק
//         isLoading: false,
//         error: null
//       });

//       const turnStatus = isYourTurn ? 'כן' : 'לא';
//       console.log(`✅ מצב לוח עודכן. התור של: ${current_player_name} (${current_player_index})`);
//       console.log(`👤 התור שלך: ${turnStatus} (משחק ${actualGameType || stateGameType})`);
      
//       if (yourPlayerInfo) {
//         console.log(`🎮 שחקן ${yourPlayerInfo.playerIndex} (${yourPlayerInfo.playerName})`);
//       }
//     }
//   };

//   // ✅ קבלת צבע החייל לפי המספר מהשרת
//   getPieceColor = (piece: number): string => {
//     return PIECE_COLORS[piece] || 'empty';
//   };

//   // requestPossibleMoves = (row: number, col: number) => {
//   //   const { gameId } = this.state;
//   //   if (gameId && this.props.socket?.send) {
//   //     console.log(`🎯 מבקש מהלכים אפשריים מ-(${row},${col})`);
//   //     this.props.socket.send({
//   //       type: 'get_possible_moves',
//   //       game_id: gameId,
//   //       position: { row, col }
//   //     });
//   //   }
//   // };

//   // // ✅ טיפול בתגובת מהלכים אפשריים
//   // handlePossibleMoves = (data: any) => {
//   //   console.log('📋 מהלכים אפשריים:', data);
//   //   if (data.status === 'success') {
//   //     this.setState({ possibleMoves: data.moves });
//   //   } else {
//   //     this.setState({ possibleMoves: [] });
//   //   }
//   // };

//   // sendMove = (fromRow: number, fromCol: number, toRow: number, toCol: number) => {
//   //   const { gameId } = this.state;
//   //   if (gameId && this.props.socket?.send) {
//   //     console.log(`🎮 שולח מהלך: (${fromRow},${fromCol}) → (${toRow},${toCol})`);
//   //     this.props.socket.send({
//   //       type: 'make_move',
//   //       game_id: gameId,
//   //       from: { row: fromRow, col: fromCol },
//   //       to: { row: toRow, col: toCol }
//   //     });
//   //   }
//   // };

//   // // ✅ טיפול בתוצאת מהלך
//   // handleMoveResult = (data: any) => {
//   //   console.log('🎯 תוצאת מהלך:', data);
//   //   if (data.status === 'success') {
//   //     this.setState({ 
//   //       selectedPiece: null, 
//   //       possibleMoves: [],
//   //       currentPlayerIndex: data.current_player,
//   //       currentPlayer: data.current_player_name,
//   //       gameOver: data.game_over
//   //     });

//   //     if (data.game_over) {
//   //       setTimeout(() => {
//   //         alert(`🏆 המשחק הסתיים! ${data.current_player_name} ניצח!`);
//   //       }, 500);
//   //     }
//   //   } else {
//   //     console.log('❌ מהלך נכשל:', data.message);
//   //   }
//   // };




//   // ✅ בקשת מהלכים אפשריים
//   requestPossibleMoves = (position: Position) => {
//     const { gameId, yourPlayerInfo, gameType } = this.state;
    
//     if (gameId && this.props.socket?.send) {
//       const request: any = {
//         type: 'get_possible_moves',
//         game_id: gameId,
//         position: { row: position.row, col: position.col }
//       };
      
//       // ✅ במשחק מולטיפלייר - שלח את ה-playerIndex שלך
//       if (gameType === 'multiplayer' && yourPlayerInfo) {
//         request.player_index = yourPlayerInfo.playerIndex;
//       }
      
//       this.props.socket.send(request);
//     }
//   };

//   // ✅ טיפול בתגובת מהלכים אפשריים
//   handlePossibleMoves = (data: any) => {
//     if (data.status === 'success') {
//       this.setState({ possibleMoves: data.moves });
//     }
//   };

//   // ✅ ביצוע מהלך - מותאם לסוג המשחק
//   makeMove = (fromPos: Position, toPos: Position) => {
//     const { gameId, yourPlayerInfo, gameType, isYourTurn } = this.state;
    
//     console.log('🎯 מנסה לבצע מהלך:', { fromPos, toPos, gameType, isYourTurn });
    
//     // בדיקה שזה התור שלך
//     if (!isYourTurn) {
//       alert('לא התור שלך!');
//       return;
//     }
    
//     if (this.props.socket?.send && gameId) {
//       const moveRequest: any = {
//         type: 'make_move',
//         game_id: gameId,
//         from: { row: fromPos.row, col: fromPos.col },
//         to: { row: toPos.row, col: toPos.col }
//       };
      
//       // ✅ במשחק מולטיפלייר - שלח את ה-playerIndex שלך
//       if (gameType === 'multiplayer' && yourPlayerInfo) {
//         moveRequest.player_index = yourPlayerInfo.playerIndex;
//         console.log('👥 Multiplayer: שולח מהלך עם player_index:', yourPlayerInfo.playerIndex);
//       } else {
//         console.log('🤖 Bot game: שולח מהלך ללא player_index');
//       }
      
//       this.props.socket.send(moveRequest);
//     }
//   };

//   // ✅ טיפול בתגובת מהלך - מותאם לסוג המשחק
//   handleMoveResult = (data: any) => {
//     console.log('📥 קיבלתי תוצאת מהלך:', data);
    
//     if (data.status === 'success') {
//       const { gameType } = this.state;
      
//       if (gameType === 'multiplayer') {
//         // במשחק מולטיפלייר - כל השחקנים מקבלים עדכון
//         console.log(`🎯 מהלך של שחקן ${data.playerIndex} (${data.playerName})`);
//         console.log(`🔄 התור עבר לשחקן ${data.current_player_index} (${data.current_player_name})`);
        
//         // במשחק מולטיפלייר לא צריך לבקש board state כי יגיע board_state_update אוטומטית
//         console.log('👥 Multiplayer: מחכה ל-board_state_update מהשרת...');
//       } else {
//         // במשחק בוט - בקש עדכון מצב לוח
//         console.log('🤖 Bot game: מבקש board state...');
//         this.requestBoardState(this.state.gameId!);
//       }
      
//       // עדכון מידע בסיסי מיד
//       this.setState({
//         currentPlayer: data.current_player_name,
//         currentPlayerIndex: data.current_player_index,
//         gameOver: data.game_over
//       });
      
//     } else {
//       // טיפול בשגיאות
//       console.error(' מהלך נדחה:', data.message);
//       alert(data.message || 'מהלך לא תקין');
//     }
//   };


// //   // ✅ טיפול במהלך הבוט
// // handleBotMove = (data: any) => {
// //   console.log('🤖 מהלך הבוט:', data);
// //   if (data.status === 'success') {
// //       // ✅ רק עדכן את המצב - עדכון הלוח יגיע בנפרד
// //       this.setState({
// //           currentPlayerIndex: data.current_player,
// //           currentPlayer: data.current_player_name,
// //           gameOver: data.game_over
// //       });

// //       // הצג פרטי מהלך אם יש
// //       if (data.move_details) {
// //           console.log(`   Progress: ${data.move_details.progress}, Depth: ${data.move_details.depth_bonus}, Total: ${data.move_details.total_score}`);
// //       }

// //       if (data.game_over) {
// //           setTimeout(() => {
// //               alert(`🏆 המשחק הסתיים! ${data.current_player_name} ניצח!`);
// //           }, 1000);
// //       }
// //   }
// // };



//   // ✅ טיפול במהלך בוט
//   handleBotMove = (data: any) => {
//     console.log('🤖 קיבלתי מהלך בוט:', data);
    
//     if (data.status === 'success') {
//       console.log(`🤖 בוט ${data.bot_index} זז: (${data.from.row},${data.from.col}) → (${data.to.row},${data.to.col})`);
      
//       // עדכון מידע בסיסי
//       this.setState({
//         currentPlayer: data.current_player_name,
//         currentPlayerIndex: data.current_player_index,
//         gameOver: data.game_over
//       });
//     }
//   };

//   // ✅ טיפול בסיום משחק
//   handleGameOver = (data: any) => {
//     console.log('🏆 Game Over!', data);
    
//     if (data.status === 'success') {
//       const { winner, gameType } = data;
//       const { yourPlayerInfo } = this.state;
      
//       // בדיקה האם השחקן הנוכחי זכה
//       let isYouWinner = false;
      
//       if (gameType === 'bot') {
//         // במשחק בוט - זכית אם המנצח הוא שחקן 0
//         isYouWinner = winner.playerIndex === 0;
//       } else if (gameType === 'multiplayer' && yourPlayerInfo) {
//         // במשחק מולטיפלייר - זכית אם המנצח הוא את
//         isYouWinner = winner.playerIndex === yourPlayerInfo.playerIndex;
//       }
      
//       this.setState({
//         gameOver: true,
//         isYourTurn: false
//       });
      
//       // הצגת הודעת ניצחון
//       const message = isYouWinner 
//         ? `🎉 מזל טוב! זכית במשחק!`
//         : `🏆 ${winner.playerName} זכה במשחק!`;
      
//       setTimeout(() => {
//         alert(message);
//         this.returnToMenu();
//       }, 1000);
//     }
//   };
 




//   // // ✅ טיפול בשגיאות
//   // handleError = (data: any) => {
//   //   console.error('❌ שגיאה מהשרת:', data);
//   //   this.setState({ error: data.message });
//   // };

//   // // ✅ קבלת סוג הכדור הצפוי לשחקן (בהתאם למיפוי בשרת)
//   // getExpectedPieceForPlayer = (playerIndex: number): number => {
//   //   const numPlayers = this.state.numPlayers;
    
//   //   if (numPlayers === 2) {
//   //     if (playerIndex === 0) return 1; // PLAYER1
//   //     else if (playerIndex === 1) return 4; // PLAYER4
//   //   } else if (numPlayers === 3) {
//   //     if (playerIndex === 0) return 1; // PLAYER1
//   //     else if (playerIndex === 1) return 3; // PLAYER3
//   //     else if (playerIndex === 2) return 5; // PLAYER5
//   //   } else if (numPlayers === 4) {
//   //     if (playerIndex === 0) return 1; // PLAYER1
//   //     else if (playerIndex === 1) return 3; // PLAYER3
//   //     else if (playerIndex === 2) return 4; // PLAYER4
//   //     else if (playerIndex === 3) return 6; // PLAYER6
//   //   } else if (numPlayers === 6) {
//   //     return playerIndex + 1; // שחקן 0 = כדור 1, שחקן 1 = כדור 2, וכו'
//   //   }
    
//   //   return playerIndex + 1; // ברירת מחדל
//   // };

//   // handlePieceClick = (position: Position) => {
//   //   const { selectedPiece, currentPlayerIndex, gameOver } = this.state;
    
//   //   if (gameOver) {
//   //     console.log('❌ המשחק הסתיים!');
//   //     return;
//   //   }
    
//   //   // ✅ בדיקה שזה הכדור של השחקן הנוכחי
//   //   const expectedPiece = this.getExpectedPieceForPlayer(currentPlayerIndex);
//   //   if (position.piece !== expectedPiece) {
//   //     console.log(`❌ זה לא הכדור שלך! אתה שחקן ${currentPlayerIndex}, צריך כדור ${expectedPiece}, זה כדור ${position.piece}`);
//   //     return;
//   //   }
    
//   //   if (selectedPiece && selectedPiece.row === position.row && selectedPiece.col === position.col) {
//   //     this.setState({ selectedPiece: null, possibleMoves: [] });
//   //     return;
//   //   }
    
//   //   this.setState({ selectedPiece: position });
//   //   this.requestPossibleMoves(position.row, position.col);
//   // };

//   // handleEmptyClick = (position: Position) => {
//   //   const { selectedPiece, possibleMoves, gameOver } = this.state;
    
//   //   if (gameOver) {
//   //     console.log('❌ המשחק הסתיים!');
//   //     return;
//   //   }
    
//   //   if (!selectedPiece) return;
    
//   //   const isValidMove = possibleMoves.some(move =>
//   //     move.row === position.row && move.col === position.col
//   //   );
    
//   //   if (!isValidMove) {
//   //     console.log('❌ מהלך לא חוקי');
//   //     return;
//   //   }
    
//   //   this.sendMove(selectedPiece.row, selectedPiece.col, position.row, position.col);
//   // };

//   // isPossibleMove = (row: number, col: number): boolean => {
//   //   return this.state.possibleMoves.some(move => move.row === row && move.col === col);
//   // };

//   // isSelected = (row: number, col: number): boolean => {
//   //   const { selectedPiece } = this.state;
//   //   return !!(selectedPiece && selectedPiece.row === row && selectedPiece.col === col);
//   // };



//     // ✅ טיפול בשגיאות
//     handleError = (data: any) => {
//       console.error('❌ שגיאה:', data);
//       this.setState({ error: data.message || 'שגיאה לא מוכרת' });
//     };
  
//     // ✅ פונקציות עזר
//     isYourPiece = (piece: number): boolean => {
//       const { yourPlayerInfo, gameType } = this.state;
      
//       if (gameType === 'bot') {
//         // במשחק בוט - החיילים שלך הם PieceType 1
//         return piece === 1;
//       } else if (gameType === 'multiplayer' && yourPlayerInfo) {
//         // במשחק מולטיפלייר - החיילים שלך הם לפי ה-pieceType שלך
//         return piece === yourPlayerInfo.pieceType;
//       }
      
//       return false;
//     };
  
//     // ✅ עדכון פונקציית הקליק על חייל
//     handlePieceClick = (position: Position) => {
//       const { selectedPiece, isYourTurn } = this.state;
      
//       // בדיקה האם זה התור שלך
//       if (!isYourTurn) {
//         alert(`לא התור שלך! כרגע התור של: ${this.state.currentPlayer}`);
//         return;
//       }
      
//       // בדיקה האם זה החייל שלך
//       if (!this.isYourPiece(position.piece || 0)) {
//         alert('זה לא החייל שלך!');
//         return;
//       }
      
//       // בחירת או ביטול בחירת חייל
//       if (selectedPiece && selectedPiece.row === position.row && selectedPiece.col === position.col) {
//         // ביטול בחירה
//         this.setState({ selectedPiece: null, possibleMoves: [] });
//       } else {
//         // בחירת חייל חדש
//         this.setState({ selectedPiece: position });
//         this.requestPossibleMoves(position);
//       }
//     };
  
//     // ✅ קליק על משבצת ריקה (מהלך)
//     handleEmptyClick = (position: Position) => {
//       const { selectedPiece, possibleMoves } = this.state;
      
//       if (!selectedPiece) {
//         return;
//       }
      
//       // בדיקה שהמהלך אפשרי
//       const isPossibleMove = possibleMoves.some(move => 
//         move.row === position.row && move.col === position.col
//       );
      
//       if (isPossibleMove) {
//         this.makeMove(selectedPiece, position);
//         this.setState({ selectedPiece: null, possibleMoves: [] });
//       }
//     };
  



//   returnToMenu = () => {

//     sessionStorage.removeItem('game_id');
//     sessionStorage.removeItem('your_player_info');
    

//     window.location.href = '/';
//   };
//   render() {
//       const { 
//         positions, 
//         selectedPiece, 
//         possibleMoves, 
//         currentPlayer, 
//         isYourTurn, 
//         gameOver, 
//         isLoading, 
//         error,
//         yourPlayerInfo,
//         gameType,
//         numPlayers,
//         currentPlayerIndex
//       } = this.state;
    
//     const boardWidth = 400;
//     const boardHeight = 400;

//     // מסך טעינה
//     if (isLoading) {
//       return (
//         <div className="App board-container" style={{ 
//           width: boardWidth, 
//           height: boardHeight, 
//           position: 'relative', 
//           margin: '0 auto',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center'
//         }}>
//           <div style={{ textAlign: 'center' }}>
//             <div style={{ fontSize: '24px', marginBottom: '10px' }}>🎯</div>
//             <div style={{ color: '#e63946' }}>טוען משחק...</div>
//           </div>
//         </div>
//       );
//     }

    
//     if (error) {
//       return (
//         <div className="App board-container" style={{ 
//           width: boardWidth, 
//           height: boardHeight, 
//           position: 'relative', 
//           margin: '0 auto',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center'
//         }}>
//           <div style={{ textAlign: 'center', padding: '20px' }}>
//             <div style={{ fontSize: '24px', marginBottom: '10px' }}>❌</div>
//             <div style={{ color: '#e63946', marginBottom: '15px' }}>{error}</div>
//             <button 
//               onClick={() => window.location.href = '/home'}
//               style={{
//                 background: '#e63946',
//                 color: 'white',
//                 border: 'none',
//                 padding: '10px 20px',
//                 borderRadius: '5px',
//                 cursor: 'pointer'
//               }}
//             >
//               חזור לעמוד הבית
//             </button>
//           </div>
//         </div>
//       );
//     }

//     return (
//       <div className="game-container">
//       {/* ✅ פאנל מידע שחקן מעודכן */}
//       {yourPlayerInfo && (
//         <div className="player-info-panel">
//           <div className="your-info">
//             <h3>המידע שלך</h3>
//             <div className="player-card">
//               <div 
//                 className="player-color" 
//                 style={{ backgroundColor: yourPlayerInfo.color }}
//               ></div>
//               <span>{yourPlayerInfo.playerName}</span>
//               <span className="game-type">
//                 {gameType === 'bot' ? '🤖 מול בוט' : '👥 מולטיפלייר'}
//               </span>
//               <span className={`turn-indicator ${isYourTurn ? 'your-turn' : 'waiting'}`}>
//                 {isYourTurn ? '🎯 התור שלך!' : '⏳ רגע...'}
//               </span>
//             </div>
//           </div>
          
//           <div className="current-turn">
//             <h4>תור נוכחי</h4>
//             <p>{currentPlayer}</p>
//             {gameType === 'multiplayer' && (
//               <p className="multiplayer-info">
//                 שחקן {currentPlayerIndex + 1} מתוך {numPlayers}
//               </p>
//             )}
//           </div>
//         </div>
//       )}

//       <div className="App board-container" style={{ width: boardWidth, height: boardHeight, position: 'relative', margin: '0 auto' }}>
//         <div className="board-background" />
//         {positions.map((pos) => {
//           const screenPos = positionToScreen(pos.row, pos.col, boardWidth, boardHeight);
//           const isSelectedPos = this.isSelected(pos.row, pos.col);
//           const isPossibleMovePos = this.isPossibleMove(pos.row, pos.col);
          
//           return (
//             <div
//               key={pos.key}
//               className={`chess ${pos.isChess ? 'piece' : 'empty'} ${isSelectedPos ? 'selected' : ''} ${isPossibleMovePos ? 'possible-move' : ''}`}
//               style={{
//                 left: screenPos.x,
//                 top: screenPos.y,
//                 backgroundColor: pos.isChess ? pos.color : (isPossibleMovePos ? '#22c55e' : '#e5e7eb'),
//                 width: pos.isChess ? '24px' : (isPossibleMovePos ? '20px' : '12px'),
//                 height: pos.isChess ? '24px' : (isPossibleMovePos ? '20px' : '12px'),
//                 border: isPossibleMovePos ? '2px dashed #15803d' : 'none',
//                 cursor: (pos.isChess || isPossibleMovePos) ? 'pointer' : 'default',
//                 zIndex: pos.isChess ? 10 : (isPossibleMovePos ? 5 : 1),
//                 position: 'absolute'
//               }}
//               onClick={() => {
//                 if (pos.isChess) this.handlePieceClick(pos);
//                 else if (isPossibleMovePos) this.handleEmptyClick(pos);
//               }}
//             >
//              {/* פרטי כדור לדיבוג  */}
//               {pos.isChess && (
//                 <div className="piece-number" style={{ fontSize: '8px', color: 'white' }}>
//                   {pos.piece}
//                 </div>
//               )}
//             </div>
//           );
//         })}
        
        
//         <div className="game-info">
//           <div>שחקנים: {numPlayers}</div>
//           <div>תור: {currentPlayer}</div>
//           {selectedPiece && <div>נבחר: ({selectedPiece.row},{selectedPiece.col})</div>}
//           {possibleMoves.length > 0 && <div>מהלכים אפשריים: {possibleMoves.length}</div>}
//           {gameOver && <div style={{ color: 'red', fontWeight: 'bold' }}>🏆 המשחק הסתיים!</div>}
//         </div>
    

//       {gameOver && (
//           <div className="game-over-controls">
//             <button onClick={this.returnToMenu} className="return-button">
//               חזרה לתפריט הראשי
//             </button>
//           </div>
//         )}
//       </div></div>
//     );
//   }
// }

// const BoardWithSocket: React.FC = (props) => {
//   const socket = useSocket();


//   useEffect(() => {
//     startBackgroundMusic(); 

//     return () => {
//       stopBackgroundMusic(); 
//     };
//   }, []); 

//   return <Board {...props} socket={socket} />;
// };

// export default BoardWithSocket;

