import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useDemo } from '@/hooks/useDemo';
import { TestTube, Sparkles } from 'lucide-react';

const DemoIndicator = () => {
  const { isDemo, loading } = useDemo();
  const [show, setShow] = React.useState(false);
  React.useEffect(() => {
    try { setShow(localStorage.getItem('show_demo_badge') === 'true'); } catch {}
  }, []);

  if (loading || !isDemo || !show) return null;

  return (
    <div className="fixed top-20 right-4 z-50">
      <Badge 
        variant="secondary" 
        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg animate-pulse"
      >
        <TestTube className="w-3 h-3 mr-1" />
        Modo Demo
        <Sparkles className="w-3 h-3 ml-1" />
      </Badge>
    </div>
  );
};

export default DemoIndicator;