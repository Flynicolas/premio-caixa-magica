import React from 'react';
import { RTPHealthMonitor } from './scratch-card-rtp/RTPHealthMonitor';

const RTPDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Dashboard RTP - Sistema Corrigido</h2>
        <p className="text-muted-foreground">
          Visão completa da saúde financeira e RTP das raspadinhas
        </p>
      </div>

      {/* Monitor de Saúde RTP */}
      <RTPHealthMonitor />
    </div>
  );
};

export default RTPDashboard;