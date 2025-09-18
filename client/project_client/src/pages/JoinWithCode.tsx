// // import React, { useState, useRef, useEffect } from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import Header from '../components/Header';
// // import Card from '../components/Card';

// // const JoinWithCode: React.FC = () => {
// //   const navigate = useNavigate();
// //   const [code, setCode] = useState<string>('');
// //   const inputRef = useRef<HTMLInputElement>(null);
  
// //   useEffect(() => {
// //     // Focus the input when component mounts
// //     if (inputRef.current) {
// //       inputRef.current.focus();
// //     }
// //   }, []);
  
// //   const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     const newValue = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
// //     setCode(newValue);
    
// //     // Auto-navigate when 4 digits are entered
// //     if (newValue.length === 4) {
// //       setTimeout(() => {
// //         navigate(`/game?mode=online&type=friend&code=${newValue}`);
// //       }, 500);
// //     }
// //   };

// //   // Generate display value with asterisks
// //   const displayValue = '****'.slice(0, 4 - code.length) + code;
  
// //   return (
// //     <div className="flex flex-col min-h-screen">
// //       <Header title="Join with Code" />
      
// //       <div className="flex-grow flex flex-col justify-center px-8 py-10 relative z-10">
// //         <Card className="flex flex-col items-center justify-center py-8">
// //           <h2 className="text-2xl font-bold text-red-600 mb-6">Enter the 4-digit code:</h2>
          
// //           <div className="code-input">
// //             <input
// //               ref={inputRef}
// //               type="text"
// //               pattern="[0-9]*"
// //               inputMode="numeric"
// //               value={displayValue}
// //               onChange={handleCodeChange}
// //               className="w-64 h-20 text-center text-4xl tracking-[1em] pl-[1em] border-2 border-red-500 rounded-lg bg-white bg-opacity-80 font-mono"
// //               style={{ caretColor: 'transparent' }}
// //             />
// //           </div>
// //         </Card>
        
// //         {/* Number Pad */}
// //         <div className="mt-8 grid grid-cols-3 gap-2">
// //           {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
// //             <button
// //               key={num}
// //               className="h-16 bg-white rounded-md text-2xl font-semibold hover:bg-gray-100"
// //               onClick={() => {
// //                 if (code.length < 4) {
// //                   setCode(prev => `${prev}${num}`);
                  
// //                   // Auto-navigate when 4 digits are entered
// //                   if (code.length === 3) {
// //                     setTimeout(() => {
// //                       navigate(`/game?mode=online&type=friend&code=${code}${num}`);
// //                     }, 500);
// //                   }
// //                 }
// //               }}
// //             >
// //               {num}
// //             </button>
// //           ))}
// //           <button 
// //             className="h-16 bg-gray-200 rounded-md text-2xl font-semibold hover:bg-gray-300"
// //             onClick={() => setCode(prev => prev.slice(0, -1))}
// //           >
// //             ⨯
// //           </button>
// //           <button
// //             className="h-16 bg-white rounded-md text-2xl font-semibold hover:bg-gray-100"
// //             onClick={() => {
// //               if (code.length < 4) {
// //                 setCode(prev => `${prev}0`);
                
// //                 // Auto-navigate when 4 digits are entered
// //                 if (code.length === 3) {
// //                   setTimeout(() => {
// //                     navigate(`/game?mode=online&type=friend&code=${code}0`);
// //                   }, 500);
// //                 }
// //               }
// //             }}
// //           >
// //             0
// //           </button>
// //           <button 
// //             className="h-16 bg-gray-200 rounded-md text-2xl font-semibold hover:bg-gray-300"
// //             onClick={() => {
// //               if (code.length === 4) {
// //                 navigate(`/game?mode=online&type=friend&code=${code}`);
// //               }
// //             }}
// //           >
// //             סיום
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default JoinWithCode;


// import React, { useState, useRef, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Header from '../components/Header';
// import Card from '../components/Card';
// import Button from '../components/Button';
// import { useSocket } from '../contexts/SocketContext';

// const JoinWithCode: React.FC = () => {
//   const navigate = useNavigate();
//   const { send, on, off, isConnected } = useSocket();
  
//   const [code, setCode] = useState<string>('');
//   const [isJoining, setIsJoining] = useState(false);
//   const [error, setError] = useState<string>('');
//   const inputRef = useRef<HTMLInputElement>(null);
  
//   useEffect(() => {
//     // Focus על הקלט בטעינה
//     if (inputRef.current) {
//       inputRef.current.focus();
//     }
//   }, []);

//   // 🔗 הגדרת מאזינים לWebSocket
//   useEffect(() => {
//     if (!isConnected) return;

//     // 🚪 מאזין להצטרפות מוצלחת
//     on('room_joined', (data) => {
//       console.log('🎉 Successfully joined room:', data);
//       setIsJoining(false);
      
//       if (data.status === 'success') {
//         const gameId = data.game.gameId;
//         navigate(`/waiting-room?id=${gameId}&code=${code}`);
//       }
//     });

//     // ❌ מאזין לשגיאות
//     on('error', (data) => {
//       console.error('❌ Error joining:', data);
//       setIsJoining(false);
//       setError(data.message || 'שגיאה בהצטרפות למשחק');
//     });

//     return () => {
//       off('room_joined');
//       off('error');
//     };
//   }, [isConnected, on, off, navigate, code]);

//   // 🎮 טיפול בשינוי קוד
//   const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const newValue = e.target.value.replace(/[^0-9A-Za-z]/g, '').slice(0, 6); // קוד עד 6 תווים
//     setCode(newValue.toUpperCase());
//     setError(''); // נקה שגיאות קודמות
//   };

//   // 🚀 ביצוע הצטרפות
//   const handleJoinGame = () => {
//     if (!code || code.length < 3) {
//       setError('אנא הכנס קוד תקין (לפחות 3 תווים)');
//       return;
//     }

//     if (!isConnected) {
//       setError('אין חיבור לשרת. אנא נסה שוב.');
//       return;
//     }

//     // קבלת נתוני השחקן
//     const creatorStr = sessionStorage.getItem('creator');
//     if (!creatorStr) {
//       setError('נתוני השחקן חסרים. אנא התחבר מחדש.');
//       navigate('/auth');
//       return;
//     }

//     const creator = JSON.parse(creatorStr);
    
//     console.log('🚀 Attempting to join with code:', code);
//     setIsJoining(true);
//     setError('');

//     // שליחת בקשת הצטרפות
//     send({
//       type: 'join_game_room',
//       gameCode: code,
//       playerName: creator.playerName,
//       playerId: creator.playerId
//     });
//   };

//   // ⌨️ טיפול בלחיצה על Enter
//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter' && code.length >= 3 && !isJoining) {
//       handleJoinGame();
//     }
//   };

//   // 🔢 טיפול בלחיצה על מספר במקלדת
//   const handleNumberClick = (num: number | string) => {
//     if (code.length < 6) {
//       const newCode = code + num.toString().toUpperCase();
//       setCode(newCode);
//       setError('');
//     }
//   };

//   // ⌫ מחיקה
//   const handleBackspace = () => {
//     setCode(prev => prev.slice(0, -1));
//     setError('');
//   };

//   // 🎨 יצירת תצוגת הקוד עם placeholder
//   const displayValue = code.padEnd(6, '_').slice(0, 6);
  
//   return (
//     <div className="flex flex-col min-h-screen">
//       <Header title="הצטרפות עם קוד" />
      
//       <div className="flex-grow flex flex-col justify-center px-8 py-10 relative z-10">
        
//         {/* 🎯 כרטיס הקוד */}
//         <Card className="flex flex-col items-center justify-center py-8 mb-6">
//           <h2 className="text-2xl font-bold text-red-600 mb-6">הכנס קוד המשחק:</h2>
          
//           {/* 📱 תצוגת הקוד */}
//           <div className="code-input mb-4">
//             <input
//               ref={inputRef}
//               type="text"
//               value={displayValue}
//               onChange={handleCodeChange}
//               onKeyPress={handleKeyPress}
//               className="w-80 h-20 text-center text-4xl tracking-[0.5em] border-2 border-red-500 rounded-lg bg-white bg-opacity-80 font-mono"
//               style={{ caretColor: 'transparent' }}
//               maxLength={6}
//               placeholder="______"
//               disabled={isJoining}
//             />
//           </div>

//           {/* ❌ הצגת שגיאות */}
//           {error && (
//             <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-center">
//               {error}
//             </div>
//           )}

//           {/* 🎮 כפתור הצטרפות */}
//           <Button 
//             onClick={handleJoinGame}
//             disabled={code.length < 3 || isJoining || !isConnected}
//             className={`w-full max-w-xs ${(code.length < 3 || isJoining || !isConnected) ? 'opacity-50' : ''}`}
//           >
//             {isJoining ? (
//               <div className="flex items-center justify-center">
//                 <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
//                 מצטרף...
//               </div>
//             ) : (
//               'הצטרף למשחק'
//             )}
//           </Button>
//         </Card>
        
//         {/* ⌨️ מקלדת מספרים */}
//         <div className="grid grid-cols-3 gap-3 mb-6">
//           {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
//             <button
//               key={num}
//               className="h-16 bg-white rounded-md text-2xl font-semibold hover:bg-gray-100 transition-colors border-2 border-red-300"
//               onClick={() => handleNumberClick(num)}
//               disabled={isJoining}
//             >
//               {num}
//             </button>
//           ))}
          
//           {/* ⌫ כפתור מחיקה */}
//           <button 
//             className="h-16 bg-gray-200 rounded-md text-xl font-semibold hover:bg-gray-300 transition-colors"
//             onClick={handleBackspace}
//             disabled={isJoining}
//           >
//             ⌫
//           </button>
          
//           {/* 0 */}
//           <button
//             className="h-16 bg-white rounded-md text-2xl font-semibold hover:bg-gray-100 transition-colors border-2 border-red-300"
//             onClick={() => handleNumberClick(0)}
//             disabled={isJoining}
//           >
//             0
//           </button>
          
//           {/* ✓ כפתור אישור */}
//           <button 
//             className="h-16 bg-green-500 text-white rounded-md text-xl font-semibold hover:bg-green-600 transition-colors"
//             onClick={handleJoinGame}
//             disabled={code.length < 3 || isJoining || !isConnected}
//           >
//             ✓
//           </button>
//         </div>

//         {/* 🔤 מקלדת אותיות (לקודים עם אותיות) */}
//         <Card className="mb-4">
//           <h3 className="text-center text-red-600 font-semibold mb-3">או הכנס אותיות:</h3>
//           <div className="grid grid-cols-6 gap-2">
//             {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'].map(letter => (
//               <button
//                 key={letter}
//                 className="h-12 bg-white rounded text-sm font-semibold hover:bg-gray-100 transition-colors border border-red-300"
//                 onClick={() => handleNumberClick(letter)}
//                 disabled={isJoining}
//               >
//                 {letter}
//               </button>
//             ))}
//           </div>
//         </Card>

//         {/* 📊 סטטוס חיבור */}
//         <div className="text-center">
//           <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
//             isConnected 
//               ? 'bg-green-100 text-green-800' 
//               : 'bg-red-100 text-red-800'
//           }`}>
//             <div className={`w-2 h-2 rounded-full mr-2 ${
//               isConnected ? 'bg-green-500' : 'bg-red-500'
//             }`}></div>
//             {isConnected ? 'מחובר לשרת' : 'לא מחובר לשרת'}
//           </div>
          
//           {!isConnected && (
//             <p className="text-xs text-gray-500 mt-2">
//               בדוק את החיבור לאינטרנט ונסה שוב
//             </p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default JoinWithCode;

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Card from '../components/Card';
import { useSocket } from '../contexts/SocketContext';

const JoinWithCode: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { send, on, off, isConnected } = useSocket();
  
  const inputRef = useRef<HTMLInputElement>(null);
  const [code, setCode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // ✅ קבלת פרמטרים מה-URL
  const queryParams = new URLSearchParams(location.search);
  const gameId = queryParams.get('gameId'); // אם בא ממשחק ספציפי
  const targetCode = queryParams.get('targetCode'); // הקוד הנכון למשחק

  useEffect(() => {
    // Focus the input when component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }

  
    const handleJoinResponse = (data: any) => {
      setLoading(false);
      if (data.type === 'private_game_joined' && data.status === 'success') {
        console.log('✅ Successfully joined game!');
        navigate(`/waiting-room?id=${data.gameId || gameId}`);
      } else if (data.type === 'error') {
        console.error('❌ Join failed:', data.message);
        setError(data.message || 'Failed to join game');
      }
    };

    on('private_game_joined', handleJoinResponse);
    on('error', handleJoinResponse);

    return () => {
      off('private_game_joined');
      off('error');
    };
  }, [on, off, navigate, gameId]);
  
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/[^A-Za-z0-9]/g, '').slice(0, 6); // ✅ עד 6 תווים
    setCode(newValue);
    setError(''); // נקה שגיאות בזמן הקלדה
  };

  // ✅ טיפול בשליחת הקוד
  const handleSubmit = () => {
    if (code.length < 3) {
      setError('Code must be at least 3 characters');
      return;
    }

    // ✅ בדיקת קוד ספציפי אם יש
    if (targetCode && code !== targetCode) {
      setError(`Incorrect code. Expected: ${targetCode}`);
      return;
    }

    if (!isConnected) {
      setError('Not connected to server. Please try again.');
      return;
    }

    // קבלת נתוני השחקן מהסשן
    const creatorData = sessionStorage.getItem('creator');
    const creator = creatorData ? JSON.parse(creatorData) : null;
    
    if (!creator) {
      setError('Player data not found. Please login again.');
      navigate('/auth');
      return;
    }

    setLoading(true);
    setError('');

    console.log('📤 Attempting to join game with code:', code);

    const joinData = {
      type: 'joinGameByCode',
      gameId: gameId,
      gameCode: code,
      playerName: creator.playerName,
      playerId: creator.playerId
    };

    send(joinData);
  };

  // ✅ הוספת מספר לקוד
  const addDigit = (digit: string) => {
    if (code.length < 6) {
      const newCode = code + digit;
      setCode(newCode);
      setError('');
      
      // ✅ שליחה אוטומטית אם הגענו לאורך הנדרש
      if (targetCode && newCode === targetCode) {
        setTimeout(() => handleSubmit(), 300);
      }
    }
  };

  // ✅ מחיקת התו האחרון
  const removeLastDigit = () => {
    setCode(prev => prev.slice(0, -1));
    setError('');
  };

  // Generate display value
  const displayValue = code.padEnd(6, '*').slice(0, 6);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Enter Game Code" />
      
      <div className="flex-grow flex flex-col justify-center px-8 py-10 relative z-10">
        <Card className="flex flex-col items-center justify-center py-8">
          {/* ✅ הוספת מידע על המשחק אם יש */}
          {gameId && (
            <div className="mb-4 text-center">
              <h3 className="text-lg font-semibold text-red-600">Joining Private Game</h3>
              <p className="text-sm text-gray-600">Game ID: {gameId}</p>
              {targetCode && (
                <p className="text-xs text-blue-600 mt-1">
                  💡 Enter the correct code to join this game
                </p>
              )}
            </div>
          )}

          <h2 className="text-2xl font-bold text-red-600 mb-6">
            Enter the {targetCode ? targetCode.length : '3-6'} character code:
          </h2>
          
          <div className="code-input mb-4">
            <input
              ref={inputRef}
              type="text"
              value={displayValue}
              onChange={handleCodeChange}
              className={`w-80 h-20 text-center text-4xl tracking-[0.5em] pl-[0.5em] border-2 rounded-lg bg-white bg-opacity-80 font-mono ${
                error ? 'border-red-500' : 'border-red-500'
              }`}
              style={{ caretColor: 'transparent' }}
              placeholder="Enter code..."
              disabled={loading}
            />
          </div>

          {/* ✅ הצגת שגיאות */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              ❌ {error}
            </div>
          )}

          {/* ✅ מצב טעינה */}
          {loading && (
            <div className="mb-4 flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mr-2"></div>
              <span className="text-gray-600">Joining game...</span>
            </div>
          )}

          {/* ✅ כפתור שליחה ידני */}
          <button
            onClick={handleSubmit}
            disabled={loading || code.length < 3}
            className={`px-8 py-3 rounded-lg font-semibold ${
              loading || code.length < 3
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {loading ? 'Joining...' : 'Join Game'}
          </button>
        </Card>
        
        {/* Number Pad */}
        <div className="mt-8 grid grid-cols-3 gap-2">
          {/* ✅ מקלדת מספרים ואותיות */}
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              className="h-16 bg-white rounded-md text-2xl font-semibold hover:bg-gray-100 disabled:opacity-50"
              onClick={() => addDigit(num)}
              disabled={loading || code.length >= 6}
            >
              {num}
            </button>
          ))}
          
          {/* שורה תחתונה */}
          <button 
            className="h-16 bg-gray-200 rounded-md text-2xl font-semibold hover:bg-gray-300 disabled:opacity-50"
            onClick={removeLastDigit}
            disabled={loading || code.length === 0}
          >
            ⌫
          </button>
          
          <button
            className="h-16 bg-white rounded-md text-2xl font-semibold hover:bg-gray-100 disabled:opacity-50"
            onClick={() => addDigit('0')}
            disabled={loading || code.length >= 6}
          >
            0
          </button>
          
          {/* ✅ כפתורי אותיות לקודים מורכבים */}
          <button
            className="h-16 bg-blue-100 rounded-md text-lg font-semibold hover:bg-blue-200 disabled:opacity-50"
            onClick={() => addDigit('G')}
            disabled={loading || code.length >= 6}
          >
            G
          </button>
        </div>

        {/* ✅ מידע על החיבור */}
        <div className="mt-6 text-center">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
            isConnected 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            {isConnected ? 'Connected' : 'Connecting...'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinWithCode;