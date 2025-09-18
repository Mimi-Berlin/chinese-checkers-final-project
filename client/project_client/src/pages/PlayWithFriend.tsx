import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Button from '../components/Button';
import Card from '../components/Card';

const PlayWithFriend: React.FC = () => {
  const navigate = useNavigate();
  const [gameCode, setGameCode] = useState<string>('');
  
  useEffect(() => {
    // Generate a random 4-digit code
    const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
    setGameCode(randomCode);
  }, []);
  
  const handleShare = () => {
    // In a real app, this would use the Web Share API or copy to clipboard
    alert(`Code ${gameCode} copied to clipboard!`);
    
    // Navigate to game after a short delay
    setTimeout(() => {
      navigate(`/game?mode=online&type=friend&code=${gameCode}`);
    }, 1500);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Play with Friend" />
      
      <div className="flex-grow flex flex-col justify-center px-8 py-10 relative z-10">
        <Card className="flex flex-col items-center justify-center py-8">
          <h2 className="text-2xl font-bold text-red-600 mb-6">Share this code with your friend:</h2>
          
          <div className="text-8xl font-bold text-red-600 mb-6">
            {gameCode}
          </div>
          
          <p className="text-xl text-red-600">
            The game will start automatically after they join.
          </p>
        </Card>
        
        <Button onClick={handleShare} className="mt-6">
          SHARE
        </Button>
      </div>
    </div>
  );
};

export default PlayWithFriend;