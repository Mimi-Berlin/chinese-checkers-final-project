
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Lock, Globe, Dice6 } from 'lucide-react';
import Header from '../components/Header';
import Button from '../components/Button';
import Card from '../components/Card';
import { useSocket } from '../contexts/SocketContext';

const OnlineSetup: React.FC = () => {
  const navigate = useNavigate();
  const { send, on, off, isConnected } = useSocket();
  
  const [selectedCount, setSelectedCount] = useState<number | null>(null);
  const [gameType, setGameType] = useState<'public' | 'private' | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string>('');

  const playerCounts = [2, 3, 4, 6];

  useEffect(() => {
    if (!isConnected) return;

    on('game_created', (data) => {
      console.log('🎉 Game created successfully:', data);
      setIsCreating(false);
      
      if (data.status === 'success') {

        sessionStorage.setItem('game_id', data.gameId);
        sessionStorage.setItem('game_type', data.gameType);
        sessionStorage.setItem('join_code', data.joinCode || '');
        sessionStorage.setItem('max_players', data.maxPlayers.toString());

        navigate(`/waiting-room?id=${data.gameId}&code=${data.joinCode || ''}`);
      }
    });

    on('error', (data) => {
      console.error('❌ Error creating game:', data);
      setIsCreating(false);
      setError(data.message || 'שגיאה ביצירת המשחק');
    });

    return () => {
      off('game_created');
      off('error');
    };
  }, [isConnected, on, off, navigate]);


  const handlePlayerCountSelect = (count: number) => {
    setSelectedCount(count);
    setGameType(null); 
    setError('');
  };


  const handleCreateGame = (type: 'public' | 'private') => {
    if (!selectedCount) {
      setError('אנא בחר מספר שחקנים');
      return;
    }

    if (!isConnected) {
      setError('אין חיבור לשרת. אנא נסה שוב.');
      return;
    }


    const creatorStr = sessionStorage.getItem('creator');
    if (!creatorStr) {
      setError('נתוני היוצר חסרים. אנא התחבר מחדש.');
      navigate('/auth');
      return;
    }

    const creator = JSON.parse(creatorStr);
    
    console.log('🚀 Creating online game...');
    setIsCreating(true);
    setGameType(type);
    setError('');

    // יצירת קוד אוטומטי למשחק פרטי
    const joinCode = type === 'private' 
      ? 'G' + Date.now().toString().slice(-5) 
      : '';

    // נתוני המשחק החדש
    const gameData = {
      type: 'createGame',
      creator: {
        playerId: creator.playerId,
        playerName: creator.playerName,
        email: creator.email || '',
        code: creator.code || ''
      },
      maxPlayers: selectedCount,
      gameType: 'online', // תמיד אונליין כאן
      isPublic: type === 'public',
      joinCode: joinCode,
      status: 'WAITING'
    };

    console.log('📤 Sending game creation request:', gameData);
    send(gameData);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="יצירת משחק אונליין" />
      
      <div className="flex-grow flex flex-col justify-center px-8 py-10 relative z-10">
        
        {/* 👥 בחירת מספר שחקנים */}
        <Card className="mb-6">
          <div className="flex items-center justify-center mb-4">
            <Users className="text-red-600 mr-3" size={24} />
            <h2 className="text-xl font-bold text-red-600">בחר מספר שחקנים</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {playerCounts.map(count => (
              <button
                key={count}
                onClick={() => handlePlayerCountSelect(count)}
                disabled={isCreating}
                className={`flex flex-col items-center justify-center p-6 bg-white rounded-lg border-2 transition-colors
                  ${selectedCount === count 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-red-300 hover:bg-red-50'
                  } 
                  ${isCreating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span className="text-3xl font-bold text-red-600 mb-2">{count}</span>
                <span className="text-sm text-red-600">שחקנים</span>
              </button>
            ))}
          </div>
        </Card>

        {/* ❌ הצגת שגיאות */}
        {error && (
          <Card className="mb-6">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-center">
              {error}
            </div>
          </Card>
        )}

        {/* 🎮 בחירת סוג המשחק */}
        {selectedCount && (
          <Card className="mb-6">
            <div className="flex items-center justify-center mb-4">
              <h2 className="text-xl font-bold text-red-600">סוג המשחק</h2>
            </div>
            
            <div className="space-y-4">
              {/* 🌐 משחק ציבורי */}
              <button
                onClick={() => handleCreateGame('public')}
                disabled={isCreating}
                className={`w-full flex items-center justify-between p-4 bg-white rounded-lg border-2 border-red-300 hover:bg-red-50 transition-colors ${
                  isCreating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <div className="flex items-center">
                  <Globe className="text-red-600 mr-3" size={24} />
                  <div className="text-left">
                    <div className="font-semibold text-red-600">משחק ציבורי</div>
                    <div className="text-sm text-red-500">כל אחד יכול להצטרף</div>
                  </div>
                </div>
                <div className="text-red-400">→</div>
              </button>

              {/* 🔒 משחק פרטי */}
              <button
                onClick={() => handleCreateGame('private')}
                disabled={isCreating}
                className={`w-full flex items-center justify-between p-4 bg-white rounded-lg border-2 border-red-300 hover:bg-red-50 transition-colors ${
                  isCreating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <div className="flex items-center">
                  <Lock className="text-red-600 mr-3" size={24} />
                  <div className="text-left">
                    <div className="font-semibold text-red-600">משחק פרטי</div>
                    <div className="text-sm text-red-500">הצטרפות רק עם קוד</div>
                  </div>
                </div>
                <div className="text-red-400">→</div>
              </button>
            </div>
          </Card>
        )}

        {/* ⏳ הצגת מצב יצירה */}
        {isCreating && (
          <Card>
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-red-600 font-semibold">
                {gameType === 'public' ? 'יוצר משחק ציבורי...' : 'יוצר משחק פרטי...'}
              </p>
              <p className="text-red-500 text-sm mt-2">
                מגדיר חדר עבור {selectedCount} שחקנים
              </p>
            </div>
          </Card>
        )}

        {/* 📊 סטטוס חיבור */}
        <div className="mt-6 text-center">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
            isConnected 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            {isConnected ? 'מחובר לשרת' : 'לא מחובר לשרת'}
          </div>
          
          {!isConnected && (
            <p className="text-xs text-gray-500 mt-2">
              בדוק את החיבור לאינטרנט ונסה שוב
            </p>
          )}
        </div>

        {/* 💡 עצות למשתמש */}
        {selectedCount && !isCreating && (
          <Card className="mt-4">
            <div className="text-center">
              <Dice6 className="text-red-600 mx-auto mb-2" size={20} />
              <p className="text-red-600 text-sm">
                💡 <strong>טיפ:</strong> במשחק ציבורי, כל אחד יכול להצטרף.
                במשחק פרטי, תקבל קוד לשיתוף עם חברים.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OnlineSetup;