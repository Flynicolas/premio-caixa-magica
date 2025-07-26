import { useCallback } from 'react';

interface UseScratchCardBackgroundImageProps {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
}

export const useScratchCardBackgroundImage = () => {
  const applyImageBackground = useCallback(
    async (
      canvas: HTMLCanvasElement, 
      ctx: CanvasRenderingContext2D, 
      imageUrl: string
    ) => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
          try {
            // Limpar canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Desenhar imagem de fundo redimensionada
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Adicionar overlay semi-transparente para criar efeito de raspadinha
            const gradient = ctx.createRadialGradient(
              canvas.width / 2, canvas.height / 2, 0,
              canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
            );
            gradient.addColorStop(0, 'rgba(200, 200, 200, 0.8)');
            gradient.addColorStop(0.5, 'rgba(180, 180, 180, 0.9)');
            gradient.addColorStop(1, 'rgba(160, 160, 160, 0.95)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Adicionar textura metálica
            addMetallicTexture(ctx, canvas.width, canvas.height);
            
            resolve();
          } catch (error) {
            console.error('Erro ao aplicar imagem de fundo:', error);
            reject(error);
          }
        };
        
        img.onerror = () => {
          console.error('Erro ao carregar imagem:', imageUrl);
          reject(new Error('Falha ao carregar imagem'));
        };
        
        img.src = imageUrl;
      });
    },
    []
  );

  const addMetallicTexture = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      // Adicionar ruído metálico
      const imageData = ctx.createImageData(width, height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        if (Math.random() > 0.95) { // Apenas alguns pixels para textura sutil
          const brightness = Math.random() * 100 + 155;
          data[i] = brightness;     // R
          data[i + 1] = brightness; // G
          data[i + 2] = brightness; // B
          data[i + 3] = 50;         // Alpha
        } else {
          data[i + 3] = 0; // Transparente
        }
      }
      
      ctx.globalCompositeOperation = 'overlay';
      ctx.putImageData(imageData, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      
      // Adicionar brilhos pontuais
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      for (let i = 0; i < 15; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 3 + 1;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    []
  );

  return {
    applyImageBackground,
    addMetallicTexture
  };
};

export default useScratchCardBackgroundImage;