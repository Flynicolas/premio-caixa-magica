import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { useErrorTracking } from '@/hooks/useErrorTracking';
import App from './App.tsx';
import './index.css';

const AppWithErrorTracking = () => {
  useErrorTracking(); // Ativa monitoramento global de erros
  return <App />;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <AppWithErrorTracking />
      <Toaster />
    </Router>
  </StrictMode>,
);