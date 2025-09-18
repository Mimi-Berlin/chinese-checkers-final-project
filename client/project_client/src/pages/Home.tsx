import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, ShoppingCart, User, Info, Share2 } from 'lucide-react';
import Button from '../components/Button';

const Home: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col min-h-screen">
      <div className="header py-6">
        <h1 className="text-2xl font-bold">Chinese Checkers</h1>
      </div>
      
      <div className="flex-grow flex flex-col justify-center px-8 py-10 relative z-10">
        <Button 
          onClick={() => {
            sessionStorage.setItem('gameType','ONLINE');
            navigate('/online-game-list');}}
          className="my-3 py-4 text-lg"
        >
          PLAY ONLINE
          <div className="text-sm mt-1 font-normal">Find a human player to play with</div>
        </Button>
        
        <Button 
          onClick={() => {
            sessionStorage.setItem('gameType', 'BOT');
           navigate('/bot-game-setup');}}
          className="my-3 py-4 text-lg"
        >
          Play with a bot
          <div className="text-sm mt-1 font-normal">Train playing against the computer</div>
        </Button>
        
        <Button 
          onClick={() => navigate('/how-to-play')}
          variant="secondary"
          className="mt-8 mx-auto text-lg"
          fullWidth={false}
        >
          HOW TO PLAY
        </Button>
      </div>
      
      <div className="fixed bottom-0 w-full flex justify-around pb-4 pt-8 max-w-[480px]">
        <div 
          className="w-14 h-14 rounded-full bg-primary-red flex items-center justify-center text-white cursor-pointer hover:bg-opacity-90"
          onClick={() => navigate('/settings')}
        >
          <Settings size={24} />
        </div>
        <div className="w-14 h-14 rounded-full bg-primary-red flex items-center justify-center text-white cursor-pointer hover:bg-opacity-90">
          <ShoppingCart size={24} />
        </div>
        <div 
          className="w-14 h-14 rounded-full bg-primary-red flex items-center justify-center text-white cursor-pointer hover:bg-opacity-90"
          onClick={() => navigate('/auth')}
        >
          <User size={24} />
        </div>
        <div 
          className="w-14 h-14 rounded-full bg-primary-red flex items-center justify-center text-white cursor-pointer hover:bg-opacity-90"
          onClick={() => navigate('/how-to-play')}
        >
          <Info size={24} />
        </div>
        <div className="w-14 h-14 rounded-full bg-primary-red flex items-center justify-center text-white cursor-pointer hover:bg-opacity-90">
          <Share2 size={24} />
        </div>
      </div>
      
      <div className="text-center pb-4 text-gray-700 text-sm">
        <p>More games | News | Contact us</p>
      </div>
    </div>
  );
};

export default Home;