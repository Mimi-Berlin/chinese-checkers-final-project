
import React, { useEffect } from 'react'; // ודא ש-useEffect מיובא
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PlayOnline from './pages/PlayOnline';
import PlayWithFriend from './pages/PlayWithFriend';
import JoinWithCode from './pages/JoinWithCode';
import Game from './pages/Game';
import HowToPlay from './pages/HowToPlay';
import Settings from './pages/Settings';
import Auth from './pages/Auth';
import BotSetup from './pages/BotSetup';
import OnlineGameList from './pages/OnlineGameList';
import OnlineSetup from './pages/OnlineSetup';
import WaitingRoom from './pages/WaitingRoom';
import ColorSelect from './components/ColorSelect';
import Board from './pages/board'; // נראה שזה לוח המשחק הראשי

// ייבוא פונקציית השמעת הצליל
import { playClickSound } from './sound/sound'; // שנה את הנתיב בהתאם למקום שבו יצרת את הקובץ

function App() {
  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const clickableElement = target.closest(
        'button, a, [role="button"], .button, .clickable-div, .cursor-pointer' // הוספנו כאן קלאסים וסלקטורים ספציפיים
      );

      if (clickableElement) {
       if (
          !clickableElement.classList.contains('chess') &&
          !clickableElement.classList.contains('possible-move')
        ) {
          playClickSound();
        }        
      }
    };

    document.addEventListener('click', handleGlobalClick);

    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, []);
  return (
    <div className="app-container relative min-h-screen overflow-hidden">
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/home" element={<Home />} />
        <Route path="/play-online" element={<PlayOnline />} />
        <Route path="/play-with-friend" element={<PlayWithFriend />} />
        <Route path="/join-with-code" element={<JoinWithCode />} />
        <Route path="/color-select" element={<ColorSelect />} />
        <Route path="/game" element={<Board />} /> {/* הלוח שלך נמצא כאן */}
        <Route path="/how-to-play" element={<HowToPlay />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/bot-game-setup" element={<BotSetup />} />
        <Route path="/online-game-list" element={<OnlineGameList />} />
        <Route path="/online-setup" element={<OnlineSetup />} />
        <Route path="/waiting-room" element={<WaitingRoom />} />
      </Routes>
    </div>
  );
}

export default App;