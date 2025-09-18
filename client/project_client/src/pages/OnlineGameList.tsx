// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Plus, Users, RefreshCw } from 'lucide-react';
// import Header from '../components/Header';
// import Button from '../components/Button';
// import Card from '../components/Card';
// import { useSocket } from '../contexts/SocketContext';

// // ✅ מבנה המשחק כפי שחוזר מהשרת C++
// interface ServerGame {
//   id: string;
//   joinCode: string;
//   maxPlayers: number;
//   currentPlayers: number;
//   gameType: string;
//   isPublic: boolean;
//   status: string;
//   canJoin: boolean;
//   createdAt: string;
//   players: Array<{
//     name: string;
//     isHost: boolean;
//     type: string;
//   }>;
// }

// const OnlineGameList: React.FC = () => {
//   const navigate = useNavigate();
//   const { send, on, off, isConnected } = useSocket();
  
//   // ✅ משתנים אמיתיים במקום mock data
//   const [gameRooms, setGameRooms] = useState<ServerGame[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     console.log('🔄 OnlineGameList mounted, setting up socket listeners...');

//     // ✅ פונקציה לטיפול בתגובת המשחקים הזמינים מהשרת C++
//     const handleAvailableGames = (data: any) => {
//       console.log('📥 Received available games from C++ server:', data);
      
//       if (data.status === 'success' && Array.isArray(data.games)) {
//         setGameRooms(data.games);
//         setLoading(false);
//         setError(null);
//         console.log(`✅ Updated games list: ${data.games.length} games`);
//       } else {
//         console.error('❌ Unexpected games data format:', data);
//         setError('Received unexpected data format from server');
//         setLoading(false);
//       }
//     };

//     // ✅ פונקציה לטיפול בשגיאות
//     const handleError = (data: any) => {
//       console.error('❌ Error from C++ server:', data);
//       setError(data.message || 'An error occurred while fetching games');
//       setLoading(false);
//     };

//     // ✅ רישום מאזינים לאירועים מהשרת C++
//     on('available_games', handleAvailableGames);
//     on('error', handleError);

//     // ✅ בקשת רשימת המשחקים הזמינים מהשרת C++
//     if (isConnected) {
//       console.log('🔄 Requesting available games from C++ server...');
//       send({ type: 'get_available_games' });
//     } else {
//       console.log('⚠️ Not connected to server, waiting for connection...');
//       setError('Connecting to server...');
//     }

//     // ✅ ניקוי המאזינים כאשר הקומפוננטה מתפרקת
//     return () => {
//       console.log('🧹 Cleaning up OnlineGameList socket listeners...');
//       off('available_games');
//       off('error');
//     };
//   }, [isConnected, on, off, send]);

//   // ✅ כשלוחצים על "צור משחק חדש"
//   const handleCreateGame = () => {
//     console.log('➕ Creating new game...');
//     navigate('/online-setup');
//   };

//   // ✅ כשלוחצים על "הצטרף" למשחק
//   const handleJoinGame = (game: ServerGame) => {
//     console.log('🎮 Joining game:', game.id);
    
//     if (game.joinCode && game.joinCode !== "0") {
//       // משחק פרטי עם קוד
//       navigate(`/waiting-room?id=${game.id}&code=${game.joinCode}`);
//     } else {
//       // משחק ציבורי
//       navigate(`/waiting-room?id=${game.id}`);
//     }
//   };

//   // ✅ רענון רשימת המשחקים
//   const handleRefreshGames = () => {
//     if (isConnected) {
//       console.log('🔄 Refreshing available games...');
//       setLoading(true);
//       setError(null);
//       send({ type: 'get_available_games' });
//     } else {
//       setError('Not connected to server. Please check your connection.');
//     }
//   };

//   // ✅ מציאת שם המארח
//   const getHostName = (players: ServerGame['players']): string => {
//     const host = players.find(player => player.isHost);
//     return host?.name || 'Unknown Host';
//   };

//   return (
//     <div className="flex flex-col min-h-screen">
//       <Header title="Available Games" />
      
//       <div className="flex-grow px-8 py-10 relative z-10">
//         {/* כפתורים עליונים */}
//         <div className="flex justify-between items-center mb-6">
//           <Button onClick={handleCreateGame} className="flex-1 mr-3">
//             <div className="flex items-center justify-center">
//               <Plus size={24} className="mr-2" />
//               Create New Game
//             </div>
//           </Button>
          
//           <Button 
//             onClick={handleRefreshGames} 
//             variant="secondary"
//             disabled={loading}
//             className="px-4"
//             fullWidth={false}
//           >
//             <RefreshCw size={18} className={`${loading ? 'animate-spin' : ''}`} />
//           </Button>
//         </div>

//         {/* הודעות מצב */}
//         {error && (
//           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//             ❌ {error}
//           </div>
//         )}

//         {!isConnected && (
//           <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
//             ⚠️ Connecting to server... If this persists, please check your connection.
//           </div>
//         )}

//         {/* תוכן מרכזי */}
//         {loading ? (
//           // מסך טעינה
//           <div className="flex justify-center items-center py-10">
//             <div className="text-center">
//               <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto mb-4"></div>
//               <p className="text-gray-600">Loading available games...</p>
//             </div>
//           </div>
//         ) : gameRooms.length === 0 ? (
//           // אין משחקים
//           <div className="text-center py-10">
//             <div className="text-6xl mb-4">🎮</div>
//             <h3 className="text-xl font-semibold text-gray-700 mb-2">No games available</h3>
//             <p className="text-gray-500 mb-4">Be the first to create a game!</p>
//             <Button onClick={handleCreateGame} className="mx-auto" fullWidth={false}>
//               Create Your Game
//             </Button>
//           </div>
//         ) : (
//           // רשימת משחקים
//           <div className="space-y-4">
//             <div className="text-center mb-4">
//               <p className="text-gray-600">
//                 🎯 Found {gameRooms.length} available game{gameRooms.length !== 1 ? 's' : ''}
//               </p>
//             </div>
            
//             {gameRooms.map(game => (
//               <Card key={game.id} className="transform transition-transform hover:scale-[1.02]">
//                 <div className="flex items-center justify-between">
//                   <div className="flex-1">
//                     <h3 className="text-lg font-semibold text-red-600">
//                       {getHostName(game.players)}'s Game
//                     </h3>
                    
//                     <div className="flex items-center text-red-500 mt-1">
//                       <Users size={16} className="mr-1" />
//                       <span>{game.currentPlayers}/{game.maxPlayers} Players</span>
//                     </div>
                    
//                     <div className="text-sm text-gray-500 mt-1 space-x-2">
//                       <span>🎮 {game.gameType}</span>
//                       <span>•</span>
//                       <span>{game.isPublic ? '🌐 Public' : '🔒 Private'}</span>
//                       <span>•</span>
//                       <span>📊 {game.status}</span>
//                     </div>
                    
//                     {/* הצגת קוד משחק אם יש */}
//                     {game.joinCode && game.joinCode !== "0" && (
//                       <div className="text-sm text-blue-600 mt-1">
//                         🔑 Code: {game.joinCode}
//                       </div>
//                     )}
//                   </div>
                  
//                   <div className="flex flex-col items-end">
//                     <Button 
//                       onClick={() => handleJoinGame(game)}
//                       variant="secondary"
//                       fullWidth={false}
//                       className="px-6"
//                       disabled={!game.canJoin}
//                     >
//                       {game.canJoin ? 'Join' : 'Full'}
//                     </Button>
                    
//                     <div className="text-xs text-gray-400 mt-1">
//                       {new Date(game.createdAt).toLocaleTimeString()}
//                     </div>
//                   </div>
//                 </div>
//               </Card>
//             ))}
//           </div>
//         )}

//         {/* מידע על החיבור */}
//         <div className="mt-8 text-center">
//           <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
//             isConnected 
//               ? 'bg-green-100 text-green-800' 
//               : 'bg-red-100 text-red-800'
//           }`}>
//             <div className={`w-2 h-2 rounded-full mr-2 ${
//               isConnected ? 'bg-green-500' : 'bg-red-500'
//             }`}></div>
//             {isConnected ? 'Connected to server' : 'Not connected'}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OnlineGameList;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, RefreshCw } from 'lucide-react';
import Header from '../components/Header';
import Button from '../components/Button';
import Card from '../components/Card';
import { useSocket } from '../contexts/SocketContext';

// ✅ מבנה המשחק כפי שחוזר מהשרת C++
interface ServerGame {
  id: string;
  joinCode: string;
  maxPlayers: number;
  currentPlayers: number;
  gameType: string;
  isPublic: boolean;
  status: string;
  canJoin: boolean;
  createdAt: string;
  players: Array<{
    name: string;
    isHost: boolean;
    type: string;
  }>;
}

const OnlineGameList: React.FC = () => {
  const navigate = useNavigate();
  const { send, on, off, isConnected } = useSocket();
  
  // ✅ משתנים אמיתיים במקום mock data
  const [gameRooms, setGameRooms] = useState<ServerGame[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔄 OnlineGameList mounted, setting up socket listeners...');

    // ✅ פונקציה לטיפול בתגובת המשחקים הזמינים מהשרת C++
    const handleAvailableGames = (data: any) => {
      console.log('📥 Received available games from C++ server:', data);
      
      if (data.status === 'success' && Array.isArray(data.games)) {
        setGameRooms(data.games);
        setLoading(false);
        setError(null);
        console.log(`✅ Updated games list: ${data.games.length} games`);
      } else {
        console.error('❌ Unexpected games data format:', data);
        setError('Received unexpected data format from server');
        setLoading(false);
      }
    };

    // ✅ פונקציה לטיפול בשגיאות
    const handleError = (data: any) => {
      console.error('❌ Error from C++ server:', data);
      setError(data.message || 'An error occurred while fetching games');
      setLoading(false);
    };

    // ✅ רישום מאזינים לאירועים מהשרת C++
    on('available_games', handleAvailableGames);
    on('error', handleError);

    // ✅ בקשת רשימת המשחקים הזמינים מהשרת C++
    if (isConnected) {
      console.log('🔄 Requesting available games from C++ server...');
      send({ type: 'get_available_games' });
    } else {
      console.log('⚠️ Not connected to server, waiting for connection...');
      setError('Connecting to server...');
    }

    // ✅ ניקוי המאזינים כאשר הקומפוננטה מתפרקת
    return () => {
      console.log('🧹 Cleaning up OnlineGameList socket listeners...');
      off('available_games');
      off('error');
    };
  }, [isConnected, on, off, send]);

  // ✅ כשלוחצים על "צור משחק חדש"
  const handleCreateGame = () => {
    console.log('➕ Creating new game...');
    navigate('/online-setup');
  };

  // ✅ כשלוחצים על "הצטרף" למשחק
  const handleJoinGame = (game: ServerGame) => {
    console.log('🎮 Attempting to join game:', game.id);
    
    if (game.joinCode && game.joinCode !== "0") {
      // משחק פרטי - צריך להכניס קוד
      console.log('🔒 Private game detected, navigating to code entry...');
      navigate(`/join-with-code?gameId=${game.id}&targetCode=${game.joinCode}`);
    } else {
      // משחק ציבורי - הצטרפות ישירה
      console.log('🌐 Public game detected, joining directly...');
      joinGameDirectly(game);
    }
  };

  // ✅ הצטרפות ישירה למשחק ציבורי
  const joinGameDirectly = (game: ServerGame) => {
    const creatorData = sessionStorage.getItem('creator');
    const creator = creatorData ? JSON.parse(creatorData) : null;
    
    if (!creator) {
      setError('Player data not found. Please login again.');
      navigate('/auth');
      return;
    }

    console.log('📤 Sending join request for public game...');
    
    const joinData = {
      type: 'joinGameByCode',
      gameCode: game.joinCode || game.id, // משחק ציבורי
      playerName: creator.playerName,
      playerId: creator.playerId
    };

    send(joinData);
    
    // האזנה לתגובת ההצטרפות
    const handleJoinResponse = (data: any) => {
      if (data.type === 'game_joined' && data.status === 'success') {
        console.log('✅ Successfully joined public game!');
        navigate(`/waiting-room?id=${game.id}`);
        off('game_joined');
      } else if (data.type === 'error') {
        console.error('❌ Failed to join game:', data.message);
        setError(data.message);
        off('game_joined');
      }
    };

    on('game_joined', handleJoinResponse);
    
    // ניקוי לאחר 10 שניות
    setTimeout(() => {
      off('game_joined');
    }, 10000);
  };

  // ✅ רענון רשימת המשחקים
  const handleRefreshGames = () => {
    if (isConnected) {
      console.log('🔄 Refreshing available games...');
      setLoading(true);
      setError(null);
      send({ type: 'get_available_games' });
    } else {
      setError('Not connected to server. Please check your connection.');
    }
  };

  // ✅ מציאת שם המארח
  const getHostName = (players: ServerGame['players']): string => {
    const host = players.find(player => player.isHost);
    return host?.name || 'Unknown Host';
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Available Games" />
      
      <div className="flex-grow px-8 py-10 relative z-10">
        {/* כפתורים עליונים */}
        <div className="flex justify-between items-center mb-6">
          <Button onClick={handleCreateGame} className="flex-1 mr-3">
            <div className="flex items-center justify-center">
              <Plus size={24} className="mr-2" />
              Create New Game
            </div>
          </Button>
          
          <Button 
            onClick={handleRefreshGames} 
            variant="secondary"
            disabled={loading}
            className="px-4"
            fullWidth={false}
          >
            <RefreshCw size={18} className={`${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* הודעות מצב */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            ❌ {error}
          </div>
        )}

        {!isConnected && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            ⚠️ Connecting to server... If this persists, please check your connection.
          </div>
        )}

        {/* תוכן מרכזי */}
        {loading ? (
          // מסך טעינה
          <div className="flex justify-center items-center py-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading available games...</p>
            </div>
          </div>
        ) : gameRooms.length === 0 ? (
          // אין משחקים
          <div className="text-center py-10">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No games available</h3>
            <p className="text-gray-500 mb-4">Be the first to create a game!</p>
            <Button onClick={handleCreateGame} className="mx-auto" fullWidth={false}>
              Create Your Game
            </Button>
          </div>
        ) : (
          // רשימת משחקים
          <div className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-gray-600">
                🎯 Found {gameRooms.length} available game{gameRooms.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            {gameRooms.map(game => (
              <Card key={game.id} className="transform transition-transform hover:scale-[1.02]">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-red-600">
                      {getHostName(game.players)}'s Game
                    </h3>
                    
                    <div className="flex items-center text-red-500 mt-1">
                      <Users size={16} className="mr-1" />
                      <span>{game.currentPlayers}/{game.maxPlayers} Players</span>
                    </div>
                    
                    <div className="text-sm text-gray-500 mt-1 space-x-2">
                      <span>🎮 {game.gameType}</span>
                      <span>•</span>
                      <span>{game.isPublic ? '🌐 Public' : '🔒 Private'}</span>
                      <span>•</span>
                      <span>📊 {game.status}</span>
                    </div>
                    
                    {/* הצגת קוד משחק אם יש */}
                    {game.joinCode && game.joinCode !== "0" && (
                      <div className="text-sm text-blue-600 mt-1">
                        🔑 Code: {game.joinCode}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <Button 
                      onClick={() => handleJoinGame(game)}
                      variant="secondary"
                      fullWidth={false}
                      className="px-6"
                      disabled={!game.canJoin}
                    >
                      {game.canJoin ? 'Join' : 'Full'}
                    </Button>
                    
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(game.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* מידע על החיבור */}
        <div className="mt-8 text-center">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
            isConnected 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            {isConnected ? 'Connected to server' : 'Not connected'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnlineGameList;