import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Card from '../components/Card';
import { Volume2, VolumeX, Music, Disc, Moon, Sun, Globe, HelpCircle } from 'lucide-react';

const Settings: React.FC = () => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('English');
  
  const toggleSound = () => setSoundEnabled(!soundEnabled);
  const toggleMusic = () => setMusicEnabled(!musicEnabled);
  const toggleDarkMode = () => setDarkMode(!darkMode);
  
  const languages = ['English', 'Español', 'עברית', '中文', 'Français', 'Deutsch'];
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Settings" />
      
      <div className="flex-grow px-6 py-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <h2 className="text-xl font-bold text-red-600 mb-4">Sound & Display</h2>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  {soundEnabled ? <Volume2 size={24} color="#e63946" /> : <VolumeX size={24} color="#e63946" />}
                  <span className="ml-3 text-red-600">Sound Effects</span>
                </div>
                <div 
                  className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer ${soundEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
                  onClick={toggleSound}
                >
                  <motion.div 
                    className="w-4 h-4 bg-white rounded-full"
                    animate={{ x: soundEnabled ? 24 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Music size={24} color="#e63946" />
                  <span className="ml-3 text-red-600">Background Music</span>
                </div>
                <div 
                  className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer ${musicEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
                  onClick={toggleMusic}
                >
                  <motion.div 
                    className="w-4 h-4 bg-white rounded-full"
                    animate={{ x: musicEnabled ? 24 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  {darkMode ? <Moon size={24} color="#e63946" /> : <Sun size={24} color="#e63946" />}
                  <span className="ml-3 text-red-600">Dark Mode</span>
                </div>
                <div 
                  className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer ${darkMode ? 'bg-green-500' : 'bg-gray-300'}`}
                  onClick={toggleDarkMode}
                >
                  <motion.div 
                    className="w-4 h-4 bg-white rounded-full"
                    animate={{ x: darkMode ? 24 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6"
        >
          <Card>
            <h2 className="text-xl font-bold text-red-600 mb-4">Language</h2>
            
            <div className="flex items-center mb-4">
              <Globe size={24} color="#e63946" />
              <span className="ml-3 text-red-600">Select Language</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {languages.map((lang) => (
                <div
                  key={lang}
                  className={`py-2 px-4 rounded-lg text-center cursor-pointer ${
                    language === lang ? 'bg-red-500 text-white' : 'bg-gray-100 text-red-500'
                  }`}
                  onClick={() => setLanguage(lang)}
                >
                  {lang}
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6"
        >
          <Card>
            <h2 className="text-xl font-bold text-red-600 mb-4">Help & Support</h2>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center py-2 cursor-pointer">
                <HelpCircle size={24} color="#e63946" />
                <span className="ml-3 text-red-600">Game Tutorial</span>
              </div>
              
              <div className="flex items-center py-2 cursor-pointer">
                <Disc size={24} color="#e63946" />
                <span className="ml-3 text-red-600">Contact Support</span>
              </div>
              
              <div className="text-center text-sm text-gray-500 mt-2">
                Version 1.0.0
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;