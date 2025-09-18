
import React, { useState, useEffect, useRef } from 'react'; // ✨ הוסף useRef
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, Clock, Crown, Play, LogOut, RefreshCw, X } from 'lucide-react';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import { useSocket } from '../contexts/SocketContext';

// 🎯 ממשקים לחדר המתנה
interface RoomPlayer {
  playerId: string;
  name: string;
  color: string;
  isHost: boolean;
  type: 'human' | 'bot';
  playerIndex: number;
}

interface RoomStatus {
  gameId: string;
  gameStatus: string;
  currentPlayers: number;
  maxPlayers: number;
  gameType: string;
  isPublic: boolean;
  joinCode: string;
  canStart: boolean;
  isFull: boolean;
  createdAt: string;
  players: RoomPlayer[];
  host?: {
    playerId: string;
    name: string;
  };
}

const WaitingRoom: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { send, on, off, isConnected } = useSocket();
  
  // 📋 קבלת פרמטרים מה-URL
  const params = new URLSearchParams(location.search);
  const gameId = params.get('id') || '';
  const joinCode = params.get('code') || '';
  const isBotGame = params.get('bot') === 'true';
  
;
  const [roomStatus, setRoomStatus] = useState<RoomStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeWaiting, setTimeWaiting] = useState(0);
  const [isHost, setIsHost] = useState(false);
  const [currentPlayerId, setCurrentPlayerId] = useState<string>('');
  
  // ✨ מצבי ספירה לאחור - כל המשתנים הדרושים
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [countdownInterval, setCountdownInterval] = useState<NodeJS.Timeout | null>(null);
  const [isGameStarting, setIsGameStarting] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false); // ✨ הוסף את זה
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null); // ✨ הוסף את זה

  const clearCountdownTimer = () => {
    try {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      if (countdownInterval) {
        clearInterval(countdownInterval);
        setCountdownInterval(null);
      }
      setCountdown(0);
      setShowCountdown(false);
      setIsGameStarting(false);
      setIsCountingDown(false);
    } catch (error) {
      console.error(' Error clearing countdown timer:', error);
    }
  };


  const startGameCountdown = (seconds: number) => {
    try {
      console.log(`🕐 Starting game countdown: ${seconds} seconds`);
      
      if (typeof seconds !== 'number' || seconds <= 0) {
        console.error(' Invalid countdown seconds:', seconds);
        seconds = 3; 
      }
      
      clearCountdownTimer(); 
      
      setCountdown(seconds);
      setShowCountdown(true);
      setIsGameStarting(true);
      setIsCountingDown(true);
      
      countdownIntervalRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
           
            clearCountdownTimer();
            navigateToGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (error) {
      console.error(' Error starting countdown:', error);
    }
  };

  const navigateToGame = () => {
    try {
      console.log('🎮 Navigating to game...');
      
      if (roomStatus) {
        sessionStorage.setItem('game_id', roomStatus.gameId);
        sessionStorage.setItem('game_type', 'online');
        sessionStorage.setItem('max_players', roomStatus.maxPlayers.toString());

        const gameUrl = `/game?mode=online&players=${roomStatus.maxPlayers}&gameId=${roomStatus.gameId}`;
        console.log('🔗 Game URL:', gameUrl);
        navigate(gameUrl);
      } else {
        console.error(' No room status available for navigation');

        if (gameId) {
          navigate(`/game?mode=online&gameId=${gameId}`);
        }
      }
    } catch (error) {
      console.error(' Error navigating to game:', error);
    }
  };

  //לא עושה אופציה כזו כרגע
const cancelCountdown = () => {
    try {
      console.log('❌ Countdown cancelled by user');
      clearCountdownTimer();
      
      if (isConnected && gameId) {
        send({
          type: 'cancel_game_start',
          gameId: gameId
        });
      }
    } catch (error) {
      console.error('❌ Error cancelling countdown:', error);
    }
  };


  useEffect(() => {
    const timer = setInterval(() => {
      setTimeWaiting(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const creatorStr = sessionStorage.getItem('creator');
    if (creatorStr) {
      const creator = JSON.parse(creatorStr);
      setCurrentPlayerId(creator.playerId);
    }
  }, []);

  useEffect(() => {
    if (!isConnected || !gameId) return;

    console.log('🏠 Setting up room listeners for game:', gameId);
    
    let hasSentInitialRequest = false;

    const handleRoomStatusUpdate = (data: any) => {
      console.log(' Room status update:', data);
      
      if (data.status === 'success' && data.game) {
        const game = data.game;
        
       
        const roomData: RoomStatus = {
          gameId: game._id || game.id,
          gameStatus: game.status,
          currentPlayers: game.players?.length || 0,
          maxPlayers: game.maxPlayers,
          gameType: game.gameType,
          isPublic: game.isPublic,
          joinCode: game.joinCode,
          canStart: game.players?.length >= 2,
          isFull: game.players?.length >= game.maxPlayers,
          createdAt: game.createdAt,
          players: game.players || []
        };
        
        setRoomStatus(roomData);
        setLoading(false);
        setError(null);
        
       
        const myPlayer = game.players?.find((p: any) => p.playerId === currentPlayerId);
        setIsHost(myPlayer?.isHost || false);
                
      }
    };

   
    const handlePlayerJoined = (data: any) => {
      console.log('👥 Player joined room:', data);
      
      if (data.gameId === gameId) {
        setRoomStatus(prev => {
          if (!prev) return prev;
          
          const playerExists = prev.players.some(p => 
            p.playerId == data.joinedPlayer?.playerId
          );
          if (playerExists) return prev;
          
          const newPlayer: RoomPlayer = {
            playerId: data.joinedPlayer?.playerId || '',
            name: data.joinedPlayer?.name || '',
            color: data.joinedPlayer?.color || 'gray',
            isHost: data.joinedPlayer?.isHost || false,
            type: data.joinedPlayer?.type || 'human',
            playerIndex: prev.players.length
          };
          
          const updatedPlayers = [...prev.players, newPlayer];
          
          return {
            ...prev,
            players: updatedPlayers,
            currentPlayers: data.totalPlayers || updatedPlayers.length,
            canStart: updatedPlayers.length >= 2,
            isFull: updatedPlayers.length >= prev.maxPlayers,
            gameStatus: data.gameStatus || prev.gameStatus
          };
        });
      }
    };


    const handlePlayerLeft = (data: any) => {
      console.log('🚪 Player left room:', data);
      
      if (data.gameId === gameId) {
        if (isCountingDown) {
          cancelCountdown();
        }
        
        setRoomStatus(prev => {
          if (!prev) return prev;
          
          const updatedPlayers = prev.players.filter(p => p.playerId !== data.playerId);
          
          return {
            ...prev,
            players: updatedPlayers,
            currentPlayers: updatedPlayers.length,
            canStart: updatedPlayers.length >= 2,
            isFull: false
          };
        });
      }
    };


    const handleGameStarted = (data: any) => {
      console.log('🎮 Game started automatically!', data);
      
      if (data.gameId === gameId) {
        if (isCountingDown) {
          cancelCountdown();
        }
        
        setRoomStatus(prev => prev ? {...prev, gameStatus: 'ACTIVE'} : prev);
        
        handleGameTransition({
          _id: data.gameId,
          id: data.gameId,
          gameType: data.gameType,
          maxPlayers: data.maxPlayers,
          status: 'ACTIVE',
          players: data.players || []
        });
      }
    };

    const handleRoomFullGameStarting = (data: any) => {
      try {
        console.log('🎯 Room full! Game starting soon...', data);

        if (!data || !data.gameId) {
          console.error('❌ Invalid room full data:', data);
          return;
        }
        
        if (data.gameId == gameId) {
          console.log(' Starting countdown for game start...');
          
          const creatorData = sessionStorage.getItem('creator');
          const creator = creatorData ? JSON.parse(creatorData) : null;
          
          if (creator && data.players) {
            const yourPlayer = data.players.find((p: any) => p.playerId === creator.playerId);
            
            if (yourPlayer) {
              const yourPlayerInfo = {
                playerId: yourPlayer.playerId,
                playerName: yourPlayer.name,
                playerIndex: yourPlayer.playerIndex,
                color: yourPlayer.color,
                pieceType: yourPlayer.pieceType,
                isHost: yourPlayer.isHost,
                gameType: 'online' 
              };
              
              sessionStorage.setItem('your_player_info', JSON.stringify(yourPlayerInfo));
              console.log(' Your multiplayer player info saved:', yourPlayerInfo);
            } else {
              console.error(' Could not find your player in the list!');
            }
          }

          const countdownTime = data.countdownSeconds || 3;
          startGameCountdown(countdownTime);
          

          setRoomStatus(prev => {
            if (!prev) return prev;
            
            return {
              ...prev,
              gameStatus: 'ACTIVE',
              isFull: true
            };
          });
        }
      } catch (error) {
        console.error(' Error handling room full game starting:', error);
      }
    };

    const handleError = (data: any) => {
      console.error(' Room error:', data);
      setError(data.message || 'Unknown error occurred');
      setLoading(false);
    };

 
    on('game_data', handleRoomStatusUpdate);
    on('player_joined_room', handlePlayerJoined);
    on('player_left_room', handlePlayerLeft);
    on('game_started', handleGameStarted);
    on('room_full_game_starting', handleRoomFullGameStarting); // ✨ המאזין החדש
    on('error', handleError);


    return () => {
      console.log('🧹 Cleaning up WaitingRoom listeners');
      off('game_data');
      off('player_joined_room');
      off('player_left_room');
      off('game_started');
      off('room_full_game_starting'); // ✨ נקה את המאזין החדש
      off('error');
      
      clearCountdownTimer(); // ✨ נקה טיימר
    };
  }, [gameId, isConnected, currentPlayerId, on, off, send, navigate]);

  // ✅ נקה טיימר כשהקומפוננטה נסגרת
  useEffect(() => {
    return () => {
      clearCountdownTimer();
    };
  }, []);

  // ✅ עזיבת החדר
  const handleLeaveRoom = () => {
    const confirmLeave = window.confirm('Are you sure you want to leave the room?');
    if (!confirmLeave) return;

    console.log('🚪 Leaving room...');
    
    // ביטול ספירה אם יוצא
    if (isCountingDown || isGameStarting) {
      clearCountdownTimer();
    }
    
    if (isConnected && gameId) {
      send({
        type: 'leave_game',
        gameId: gameId,
        playerId: currentPlayerId
      });
    }
    
    navigate('/online-game-list');
  };

  // 🔄 רענון ידני (במקרה חירום)
  const handleRefresh = () => {
    console.log('🔄 Manual refresh requested');
    setLoading(true);
    
    send({
      type: 'getGameById',
      gameId: gameId
    });
  };

  // ⏰ פורמט זמן המתנה
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 🎨 צבע לפי סוג שחקן
  const getPlayerTypeIcon = (player: RoomPlayer) => {
    if (player.isHost) return <Crown size={16} className="text-yellow-500" />;
    if (player.type === 'bot') return <span className="text-blue-500">🤖</span>;
    return <span className="text-green-500">👤</span>;
  };

  // ✨ רכיב לתצוגת הטיימר
  const renderGameStartCountdown = () => {
    try {
      if (!showCountdown || !isGameStarting) return null;

      return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-12 text-center shadow-2xl max-w-md mx-4">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                🎯 כל השחקנים נכנסו!
              </h2>
              <p className="text-lg text-gray-600">
                המשחק מתחיל בעוד...
              </p>
            </div>
            
            {/* מונה הספירה לאחור */}
            <div className="mb-6">
              <div className="text-8xl font-bold text-green-600 animate-pulse">
                {countdown || 0}
              </div>
            </div>
            
            {/* הודעה */}
            <div className="text-gray-500">
              <p>מכין את המשחק...</p>
            </div>
            
            {/* פס התקדמות */}
            <div className="mt-6 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${Math.max(0, Math.min(100, ((3 - (countdown || 0)) / 3) * 100))}%` }}
              />
            </div>
          </div>
        </div>
      );
    } catch (error) {
      console.error('❌ Error rendering countdown:', error);
      return null;
    }
  };


  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header title="Waiting Room" />
        
        <div className="flex-grow flex flex-col justify-center px-8 py-10 relative z-10">
          <Card className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-red-600">Loading room data...</p>
            {gameId && (
              <p className="text-gray-500 mt-2">Room: {gameId}</p>
            )}
          </Card>
        </div>
      </div>
    );
  }

  // ❌ מסך שגיאה
  if (error || !roomStatus) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header title="Error" />
        
        <div className="flex-grow flex flex-col justify-center px-8 py-10 relative z-10">
          <Card className="text-center">
            <p className="text-red-600 mb-4">{error || 'Unable to load room'}</p>
            <div className="space-y-2">
              <Button onClick={handleRefresh} className="w-full">
                <RefreshCw size={16} className="mr-2" />
                Try Again
              </Button>
              <Button onClick={() => navigate('/home')} variant="secondary" className="w-full">
                Back to Home
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Waiting Room" />
      
      <div className="flex-grow flex flex-col justify-center px-8 py-10 relative z-10">
        
        {/* 📊 מידע על החדר */}
        <Card className="mb-6">
          {/* ✨ ספירה לאחור */}
          {isCountingDown && (
            <div className="mb-4 p-4 bg-green-100 border-2 border-green-500 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-700 mb-2">
                🎯 Ready to Start!
              </div>
              <div className="text-4xl font-bold text-green-600 mb-2">
                {countdown}
              </div>
              <div className="text-sm text-green-600">
                Starting automatically... All players ready!
              </div>
              {isHost && (
                <button
                  onClick={cancelCountdown}
                  className="mt-2 px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                >
                  ❌ Cancel Start
                </button>
              )}
            </div>
          )}
          
          <div className="text-center mb-4">
            <div className="flex items-center justify-center mb-2">
              <Clock className="text-red-600 mr-2" size={20} />
              <span className="text-lg font-bold text-red-600">
                {formatTime(timeWaiting)}
              </span>
            </div>
            
            <div className="flex items-center justify-center mb-2">
              <Users className="text-red-600 mr-2" size={20} />
              <span className="text-md font-semibold text-red-600">
                {roomStatus.currentPlayers}/{roomStatus.maxPlayers} Players
              </span>
              {roomStatus.isFull && !isCountingDown && (
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  ✅ Full
                </span>
              )}
            </div>

            {/* מצב החדר */}
            <div className="flex items-center justify-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm ${
                roomStatus.gameStatus === 'WAITING' ? 'bg-yellow-100 text-yellow-800' :
                roomStatus.gameStatus === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {roomStatus.gameStatus}
              </span>
              
              {/* מצב חיבור */}
              <span className={`px-2 py-1 rounded-full text-xs flex items-center ${
                isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-1 ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          {/* 👥 רשימת שחקנים - מסודרת לפי מקומות */}
          <div className="space-y-2 mb-4">
            {[...Array(roomStatus.maxPlayers)].map((_, index) => {
              const player = roomStatus.players.find(p => p.playerIndex === index) || 
                           roomStatus.players[index]; // fallback למיקום במערך
              
              if (player) {
                return (
                  <div
                    key={player.playerId}
                    className={`p-3 rounded-lg border-2 flex items-center justify-between transition-all duration-300 ${
                      player.playerId === currentPlayerId 
                        ? 'border-red-500 bg-red-50 shadow-md' 
                        : 'border-green-400 bg-green-50'
                    } ${isCountingDown ? 'animate-pulse' : ''}`}
                  >
                    <div className="flex items-center">
                      <div className="mr-3 text-sm font-bold text-gray-600">
                        #{index + 1}
                      </div>
                      {getPlayerTypeIcon(player)}
                      <span className="ml-2 text-red-600 font-medium">
                        {player.name}
                        {player.playerId === currentPlayerId && ' (You)'}
                      </span>
                      {player.isHost && (
                        <Crown size={16} className="ml-2 text-yellow-500" />
                      )}
                    </div>
                    
                    {/* צבע שחקן */}
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-gray-300"
                      style={{ backgroundColor: player.color }}
                      title={`Color: ${player.color}`}
                    ></div>
                  </div>
                );
              } else {
                // מקום ריק
                return (
                  <div
                    key={`empty-${index}`}
                    className="p-3 rounded-lg border-2 border-red-300 border-dashed bg-gray-50 flex items-center"
                  >
                    <div className="mr-3 text-sm font-bold text-gray-400">
                      #{index + 1}
                    </div>
                    <span className="text-red-400">Waiting for player...</span>
                  </div>
                );
              }
            })}
          </div>

          {/* 🎮 פרטי המשחק */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <span className="text-gray-600">Game Type:</span>
              <span className="ml-2 font-medium text-red-600">{roomStatus.gameType}</span>
            </div>
            <div>
              <span className="text-gray-600">Visibility:</span>
              <span className="ml-2 font-medium text-red-600">
                {roomStatus.isPublic ? 'Public' : 'Private'}
              </span>
            </div>
          </div>

          {/*  קוד חדר (למשחקים פרטיים) */}
          {!roomStatus.isPublic && joinCode && (
            <div className="text-center mb-4 p-3 bg-gray-100 rounded-lg">
              <p className="text-gray-600 text-sm">Room Code:</p>
              <p className="text-2xl font-bold text-red-600 tracking-wider">{joinCode}</p>
              <p className="text-xs text-gray-500">Share this code with friends</p>
            </div>
          )}

          {/*  הוסף אינדיקטור אם המשחק מתחיל */}
          {isGameStarting && !showCountdown && (
            <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg text-center">
              <div className="text-green-800 font-semibold">
                 המשחק מתחיל...
              </div>
            </div>
          )}

          {/*  כפתורי פעולה */}
          <div className="space-y-2">
            {/* מצב ספירה לאחור */}
            {isCountingDown ? (
              <div className="text-center">
                <div className="text-green-600 text-sm mb-2">
                   Game starting automatically in {countdown} seconds...
                </div>
                {isHost && (
                  <Button
                    onClick={cancelCountdown}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    <X size={16} className="mr-2" />
                    Cancel Start
                  </Button>
                )}
              </div>
            ) : (
              <>
                {/* כפתור התחלת משחק ידנית - רק למארח ורק אם יש מספיק שחקנים */}
                {isHost && roomStatus.canStart && !roomStatus.isFull && (
                  <Button
                    onClick={() => {
                      console.log(' Host manually starting game...');
                      send({
                        type: 'start_game',
                        gameId: gameId
                      });
                    }}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Play size={16} className="mr-2" />
                    Start Game Now ({roomStatus.currentPlayers} players)
                  </Button>
                )}
                
                {/* הודעה אם אין מספיק שחקנים */}
                {!roomStatus.canStart && (
                  <div className="text-center text-gray-600 text-sm py-2">
                    Need at least 2 players to start the game
                  </div>
                )}
                
                {/* הודעה אם הלובי מלא אבל אין ספירה */}
                {roomStatus.isFull && !isCountingDown && (
                  <div className="text-center text-green-600 text-sm py-2">
                    ✅ Lobby is full! Game will start automatically when all players are ready.
                  </div>
                )}
              </>
            )}
            
            {/* כפתור יציאה */}
            <Button
              onClick={handleLeaveRoom}
              variant="secondary"
       
              className="w-full flex items-center justify-center"
              disabled={isCountingDown || isGameStarting} // ✨ בטל כשמתחיל
            >
              <LogOut size={16} className="mr-2" />
              Leave Room
            </Button>
            
            {/* כפתור רענון */}
            <Button
              onClick={handleRefresh}
              variant="secondary"
              className="w-full flex items-center justify-center text-sm"
              disabled={isCountingDown || isGameStarting} // ✨ בטל כשמתחיל
            >
              <RefreshCw size={14} className="mr-2" />
              Refresh
            </Button>
          </div>
        </Card>
      </div>
      
      {/* ✨ הטיימר - זה חייב להיות בסוף! */}
      {renderGameStartCountdown()}
    </div>
  );
};

export default WaitingRoom;