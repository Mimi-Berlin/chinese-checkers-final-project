import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import Header from '../components/Header';
import Button from '../components/Button';
import Card from '../components/Card';
import { useSocket } from '../contexts/SocketContext';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { send, on, off, isConnected } = useSocket();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    on('auth_ack', (data) => {
      const serverMessage = data.message;
      const playerName = data.player_name;
      const playerId = data.player_id;
      console.log('Player name:', playerName);
      console.log('Server response:', serverMessage);

      const creator = {
        playerId: playerId,
        playerName: playerName,
       };
       sessionStorage.setItem('creator', JSON.stringify(creator));
    if (serverMessage === 'Login successful' || serverMessage === 'User registered successfully') {
        if (playerName) {
          alert(`ברוכים הבאים, ${playerName}!`);
        }
        navigate('/home');
      } else {
        setError(serverMessage);
      }
    });
    return () => off('auth_ack');
  }, [on, off, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || (!isLogin && !username)) {
      setError('Please fill in all fields');
      return;
    }

    const authData = {
      type: isLogin ? 'login' : 'addPlayer',
      email: email,
      code: password,
      name:(isLogin ? {} :  username )
    };

    if (isConnected) {
      send(authData);
    } else {
      setError('Connection to server failed. Please try again.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header title={isLogin ? "Login" : "Register"} />
      
      <div className="flex-grow flex flex-col justify-center px-8 py-10 relative z-10">
        <Card className="w-full max-w-md mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-500" size={20} />
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-full bg-white bg-opacity-90 border-2 border-red-500 focus:outline-none focus:border-red-600"
                />
              </div>
            )}
            
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-500" size={20} />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full bg-white bg-opacity-90 border-2 border-red-500 focus:outline-none focus:border-red-600"
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-500" size={20} />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full bg-white bg-opacity-90 border-2 border-red-500 focus:outline-none focus:border-red-600"
              />
            </div>

            {error && (
              <p className="text-red-600 text-center text-sm">{error}</p>
            )}

            <Button type="submit">
              {isLogin ? 'LOGIN' : 'REGISTER'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-red-600 hover:text-red-700 text-sm"
            >
              {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Auth;