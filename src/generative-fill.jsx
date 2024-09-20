import { StrictMode, useState, useRef, useEffect } from 'react'
import { createRoot } from 'react-dom/client'

function App() {
  const [state, setState] = useState({ file: null, selectedArea: null, prompt: null });
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [path, setPath] = useState([]);

  useEffect(() => {
    if (state.file && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.height / img.width;
        canvas.width = 400;
        canvas.height = canvas.width * aspectRatio;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = URL.createObjectURL(state.file);
    }
  }, [state.file]);

  const startDrawing = (e) => {
    setIsDrawing(true);
    setPath([{ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }]);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    setPath([...path, { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }]);
  };

  const endDrawing = () => {
    setIsDrawing(false);
    if (path.length > 2) {
      setState({ ...state, selectedArea: path });
    }
  };

  useEffect(() => {
    if (canvasRef.current && state.file) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        if (path.length > 0) {
          ctx.beginPath();
          ctx.moveTo(path[0].x, path[0].y);
          path.forEach((point) => ctx.lineTo(point.x, point.y));
          ctx.closePath();

          ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.shadowColor = 'yellow';
          ctx.shadowBlur = 10;
          ctx.strokeStyle = 'yellow';
          ctx.stroke();
        }
      };
      img.src = URL.createObjectURL(state.file);
    }
  }, [path, state.file]);

  const handleSubmit = () => {
    if (state.selectedArea && state.prompt) {
      const canvas = canvasRef.current;

      // Create a new canvas for the original image
      const originalCanvas = document.createElement('canvas');
      originalCanvas.width = canvas.width;
      originalCanvas.height = canvas.height;
      const originalCtx = originalCanvas.getContext('2d');

      // Draw the original image without any drawings
      const img = new Image();
      img.onload = () => {
        originalCtx.drawImage(img, 0, 0, originalCanvas.width, originalCanvas.height);

        // Create a new canvas for the mask
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = canvas.width;
        maskCanvas.height = canvas.height;
        const maskCtx = maskCanvas.getContext('2d');

        // Draw the mask
        maskCtx.fillStyle = 'white';
        maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
        maskCtx.fillStyle = 'black';
        maskCtx.beginPath();
        maskCtx.moveTo(state.selectedArea[0].x, state.selectedArea[0].y);
        state.selectedArea.forEach((point) => maskCtx.lineTo(point.x, point.y));
        maskCtx.closePath();
        maskCtx.fill();

        // Convert canvases to blobs, then to File objects
        Promise.all([
          new Promise(resolve => originalCanvas.toBlob(blob => resolve(new File([blob], 'image.png', { type: 'image/png' })))),
          new Promise(resolve => maskCanvas.toBlob(blob => resolve(new File([blob], 'mask.png', { type: 'image/png' }))))
        ]).then(([uploadedFile, blackAndWhiteMaskFile]) => {
          window.Poe.sendMessage(state.prompt, { attachments: [uploadedFile, blackAndWhiteMaskFile] });
        });
      };
      img.src = URL.createObjectURL(state.file);
    }
  };

  if (!state.file) {
    return <>
      <p>Upload a file you want to change</p>
      <input type="file" onChange={(event) => {
        const file = event.target.files[0];
        setState({ file, selectedArea: null });
      }} />
    </>
  }

    return <>
      <p>Select an area to change</p>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
        style={{ width: '400px', maxWidth: '100%', height: 'auto' }}
      />
      {state.selectedArea && <input type="text" placeholder="Enter a prompt" onChange={(event) => setState({ ...state, prompt: event.target.value })} />}
      {state.selectedArea && <button onClick={handleSubmit}>Submit</button>}
    </>
  
}
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <div style={{ display: 'flex', gap: 12, flexDirection: 'column', justifyContent: 'center',  minHeight: '400px', padding: 10 }}>
      <App />
    </div>
  </StrictMode>,
)
