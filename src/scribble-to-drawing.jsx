import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

const DrawingApp = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [description, setDescription] = useState('');

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const clearCanvas = () => {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };
    const setCanvasSize = () => {
      const size = Math.max(Math.min(400, window.innerWidth - 100), 400);
      canvas.width = size;
      canvas.height = size;
      clearCanvas();
      setDescription('');
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);


    clearCanvas();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
    };
  }, []);

  const startDrawing = (e) => {
    setIsDrawing(true);
    draw(e);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'black';
    ctx.lineTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const generateImage = () => {
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL('image/png');
    fetch(imageData)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'drawing.png', { type: 'image/png' });
        window.Poe.sendMessage("@scribbleToDrawing " + description, { attachments: [file] });
      });
  };

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      body {
        font-family: Arial, sans-serif;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20px;
      }
      #canvasContainer {
        width: 100%;
        max-width: 400px;
      }
      canvas {
        border: 1px solid #000;
        cursor: crosshair;
        width: 100%;
        height: auto;
      }
      #controls {
        margin-top: 20px;
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        justify-content: center;
      }
      input, button {
        padding: 5px 10px;
        font-size: 16px;
      }
    `;
    document.head.appendChild(style);

    const picoCSS = document.createElement('link');
    picoCSS.rel = 'stylesheet';
    picoCSS.href = 'https://cdn.jsdelivr.net/npm/@picocss/pico@2.0.6/css/pico.min.css';
    document.head.appendChild(picoCSS);

    return () => {
      document.head.removeChild(style);
      document.head.removeChild(picoCSS);
    };
  }, []);

  return (
    <>
      <h3>Scribble to drawing</h3>
      <div id="canvasContainer">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
        />
      </div>
      <div id="controls">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Prompt"
        />
        <button onClick={clearCanvas}>Clear</button>
        <button onClick={generateImage}>Generate</button>
      </div>
    </>
  );
};

const root = createRoot(document.getElementById('root'));
root.render(<DrawingApp />);
