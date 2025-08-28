import { useState, useEffect } from 'react';

interface DeviceInfo {
  userAgent: string;
  language: string;
  platform: string;
  screenResolution: string;
  timezone: string;
  cookieEnabled: boolean;
  onlineStatus: boolean;
}

export const useDeviceFingerprint = () => {
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);

  useEffect(() => {
    const generateFingerprint = () => {
      const info: DeviceInfo = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        cookieEnabled: navigator.cookieEnabled,
        onlineStatus: navigator.onLine
      };

      // Criar fingerprint simples baseado nas informações do dispositivo
      const fingerprintData = [
        info.userAgent,
        info.language,
        info.platform,
        info.screenResolution,
        info.timezone
      ].join('|');

      // Hash simples (não criptográfico, apenas para identificação)
      const hash = btoa(fingerprintData).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);

      setFingerprint(hash);
      setDeviceInfo(info);
    };

    generateFingerprint();
  }, []);

  return {
    fingerprint,
    deviceInfo
  };
};