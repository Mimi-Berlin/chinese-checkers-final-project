import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare } from 'lucide-react';
import Header from '../components/Header';
import Button from '../components/Button';
import Card from '../components/Card';

const PlayOnline: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Play Online" />
      
      <div className="flex-grow flex flex-col justify-center px-8 py-10 relative z-10">
        <Card className="flex items-center">
          <CheckSquare className="text-indigo-600 mr-3" size={24} />
          <div className="text-left">
            <h3 className="text-xl font-bold text-red-600">Fast paced</h3>
            <p className="text-red-600">Super Chinese Checkers</p>
          </div>
        </Card>
        
        <Button 
          onClick={() => navigate('/game?mode=online&type=random')}
          className="my-3 py-4 text-lg"
        >
          FIND OPPONENT
          <div className="text-sm mt-1 font-normal">Get matched with a random player</div>
        </Button>
        
        <Button 
          onClick={() => navigate('/play-with-friend')}
          className="my-3 py-4 text-lg"
        >
          PLAY WITH FRIEND
          <div className="text-sm mt-1 font-normal">Get a code to send to your friend</div>
        </Button>
        
        <Button 
          onClick={() => navigate('/join-with-code')}
          className="my-3 py-4 text-lg"
        >
          JOIN WITH CODE
          <div className="text-sm mt-1 font-normal">Enter the code sent by your friend</div>
        </Button>
      </div>
    </div>
  );
};

export default PlayOnline;