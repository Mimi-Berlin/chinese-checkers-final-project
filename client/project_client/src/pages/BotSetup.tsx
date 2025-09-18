import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import Header from '../components/Header';
import Button from '../components/Button';
import Card from '../components/Card';
import { useSocket } from '../contexts/SocketContext';

const BotSetup: React.FC = () => {
  const navigate = useNavigate();
  const { send, on, off, isConnected } = useSocket();

  useEffect(() => {
    // האזנה לתשובה מהשרת על יצירת משחק
    on('game_created', (data) => {
      console.log('🎮 Game created successfully:', data);
      
      if (data.status === 'success') {
        console.log('Game initialized successfully with ID:', data.gameId);
        
        // שמירת פרטי המשחק ב-sessionStorage
        sessionStorage.setItem('game_id', data.gameId);
        sessionStorage.setItem('game_type', data.gameType);
        sessionStorage.setItem('join_code', data.joinCode);
        sessionStorage.setItem('max_players', data.maxPlayers.toString());
        
        // מעבר למשחק
        navigate(`/game?mode=bot&players=${data.maxPlayers}&gameId=${data.gameId}`);
      } else {
        alert('אירעה שגיאה ביצירת המשחק. אנא נסה שוב.');
        console.error('Game creation failed:', data);
      }
    });

    // האזנה לשגיאות
    on('error', (data) => {
      console.error('❌ Error from server:', data);
      alert(`שגיאה: ${data.message}`);
    });

    return () => {
      off('game_created');
      off('error');
    };
  }, [on, off, navigate]);

  const playerCounts = [2, 3, 4, 6];

  const handlePlayerCountSelect = (count: number) => {
    if (!isConnected) {
      alert('אין חיבור לשרת. אנא נסה שוב.');
      return;
    }

    // כרגע תמיכה רק ב-2 שחקנים
    // if (count !== 2 && count !== 4) {
    //   alert(`כמות שחקנים ${count} לא זמינה כרגע. בחר 2 שחקנים.`);
    //   return;
    // }

    try {
      // קבלת נתוני היוצר מ-sessionStorage
      const creatorStr = sessionStorage.getItem('creator');
      const creatorObj = creatorStr ? JSON.parse(creatorStr) : null;

      if (!creatorObj) {
        alert('נתוני היוצר חסרים. אנא התחבר שוב.');
        navigate('/auth');
        return;
      }

      console.log('🚀 Creating bot game with creator:', creatorObj);

      // הכנת נתוני המשחק
      const gameData = {
        type: 'createGame',
        creator: {
          playerId: creatorObj.playerId,
          playerName: creatorObj.playerName,
          email: creatorObj.email || "",
          code: creatorObj.code || ""
        },
        maxPlayers: count,
        gameType: 'bot',  // סוג משחק: בוט
        isPublic: true,   // משחק ציבורי
        joinCode: "",     // ריק למשחק בוט
        status: 'WAITING' // סטטוס התחלתי
      };

      console.log('📤 Sending game creation request:', gameData);

      // שליחת בקשת יצירת משחק
      send(gameData);

      // שמירת נתונים בסשן
      sessionStorage.setItem('maxPlayers', count.toString());
      sessionStorage.setItem('gameType', 'bot');

    } catch (error) {
      console.error('❌ Error creating game:', error);
      alert('שגיאה ביצירת המשחק. אנא נסה שוב.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="הגדרת משחק בוט" />

      <div className="flex-grow flex flex-col justify-center px-8 py-10 relative z-10">
        <Card className="mb-6">
          <div className="flex items-center justify-center mb-4">
            <Users className="text-red-600 mr-3" size={24} />
            <h2 className="text-xl font-bold text-red-600">בחר מספר שחקנים</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {playerCounts.map(count => {
              // const isDisabled = count !== 2 && count !== 4;
              // const isAvailable = count === 2 || count === 4;
             
              const isDisabled = false
              const isAvailable = true

              return (
                <button
                  key={count}
                  onClick={() => handlePlayerCountSelect(count)}
                  disabled={isDisabled}
                  className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-colors
                    ${isDisabled
                      ? 'bg-gray-200 border-gray-400 text-gray-500 cursor-not-allowed'
                      : 'bg-white border-red-500 text-red-600 hover:bg-red-50 cursor-pointer'}`}
                >
                  <span className="text-3xl font-bold mb-2">{count}</span>
                  <span className="text-sm">שחקנים</span>
                  {isAvailable && (
                    <span className="text-xs text-green-600 mt-1">✓ זמין</span>
                  )}
                  {isDisabled && (
                    <span className="text-xs text-gray-400 mt-1">בקרוב</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              💡 כרגע תמיכה במשחק של 2 שחקנים בלבד
            </p>
            <p className="text-xs text-gray-500 mt-1">
              משחקים נוספים יתווספו בעדכונים הבאים
            </p>
          </div>
        </Card>

        {/* מידע על החיבור */}
        <Card className="mt-4">
          <div className="text-center">
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
                אנא בדוק את החיבור לאינטרנט ונסה שוב
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BotSetup;