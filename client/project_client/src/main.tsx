import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { SocketProvider } from './contexts/SocketContext';
import './index.css';
import BackgroundBubbles from './components/BackgroundBubbles';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BackgroundBubbles/>
    <BrowserRouter>
      <SocketProvider>
        <App />
      </SocketProvider>
    </BrowserRouter>
  </StrictMode>
);