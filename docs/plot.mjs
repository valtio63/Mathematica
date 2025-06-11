export function setupPlot(model) {
  // Create constants for plotting
  const DRAW_CONST = {
    margin: 40,
    plotXMin: -0.6,
    plotXMax: 0.6,
    plotYMin: -0.25,
    plotYMax: 0.25,
    mollerColorA: [0, 0, 255],  // Blue
    mollerColorB: [0, 0, 0],    // Black
    mollerColorC: [255, 0, 0],  // Red
    mottColor: [148, 0, 211],   // Purple
    detectorColor: [0, 255, 0], // Green
    detectorFill: [200, 240, 255, 0.7] // Pale cyan-gray, semi-transparent
  };

  // Create the container if it doesn't exist
  let container = document.getElementById('canvasContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'canvasContainer';
    document.querySelector('.plot').appendChild(container);
  }
  
  // Create canvas element
  const canvas = document.createElement('canvas');
  canvas.style.width = '100%';
  canvas.style.height = 'auto';
  container.innerHTML = '';
  container.appendChild(canvas);
  
  // Setup sizing
  function resizeCanvas() {
    const width = container.offsetWidth;
    const height = width / 2;
    canvas.width = width;
    canvas.height = height;
    container.style.height = height + 'px';
    drawPlot();
  }
  
  // Map physical coords to canvas coords
  function mapX(x) {
    return DRAW_CONST.margin + (x - DRAW_CONST.plotXMin) / 
      (DRAW_CONST.plotXMax - DRAW_CONST.plotXMin) * 
      (canvas.width - 2 * DRAW_CONST.margin);
  }
  
  function mapY(y) {
    return canvas.height - DRAW_CONST.margin - (y - DRAW_CONST.plotYMin) / 
      (DRAW_CONST.plotYMax - DRAW_CONST.plotYMin) * 
      (canvas.height - 2 * DRAW_CONST.margin);
  }
  

  function drawGridAndTicks(ctx) {
  // Set up styles for grid lines
  ctx.strokeStyle = '#ddd'; // Light gray for grid lines
  ctx.lineWidth = 0.5;
  
  // Draw vertical grid lines (every 0.1 units)
  for (let x = Math.ceil(DRAW_CONST.plotXMin * 10) / 10; x <= DRAW_CONST.plotXMax; x += 0.1) {
    const px = mapX(x);
    ctx.beginPath();
    ctx.moveTo(px, DRAW_CONST.margin);
    ctx.lineTo(px, canvas.height - DRAW_CONST.margin);
    ctx.stroke();
  }
  
  // Draw horizontal grid lines (every 0.1 units)
  for (let y = Math.ceil(DRAW_CONST.plotYMin * 10) / 10; y <= DRAW_CONST.plotYMax; y += 0.1) {
    const py = mapY(y);
    ctx.beginPath();
    ctx.moveTo(DRAW_CONST.margin, py);
    ctx.lineTo(canvas.width - DRAW_CONST.margin, py);
    ctx.stroke();
  }
  
  // Draw ticks (every 0.05 units)
  ctx.strokeStyle = '#000'; // Black for ticks
  ctx.lineWidth = 1;
  const tickSize = 6; // Pixel length of tick marks
  
  // X-axis ticks - define explicit values to avoid floating point issues
  const xTicks = [];
  for (let i = -12; i <= 12; i++) {
    xTicks.push(i * 0.05);
  }
  
  // Draw each X tick with label
  xTicks.forEach(x => {
    const px = mapX(x);
    
    // Draw tick mark
    ctx.beginPath();
    ctx.moveTo(px, canvas.height - DRAW_CONST.margin);
    ctx.lineTo(px, canvas.height - DRAW_CONST.margin + tickSize);
    ctx.stroke();
    
    // Label every tick
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = '10px sans-serif';
    ctx.fillText(x.toFixed(2), px, canvas.height - DRAW_CONST.margin + tickSize + 2);
  });
  
  // Y-axis ticks - define explicit values to avoid floating point issues
  const yTicks = [];
  for (let i = -5; i <= 5; i++) {
    yTicks.push(i * 0.05);
  }
  
  // Draw each Y tick with label
  yTicks.forEach(y => {
    const py = mapY(y);
    
    // Draw tick mark
    ctx.beginPath();
    ctx.moveTo(DRAW_CONST.margin, py);
    ctx.lineTo(DRAW_CONST.margin - tickSize, py);
    ctx.stroke();
    
    // Label every tick
    ctx.fillStyle = '#000';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.font = '10px sans-serif';
    ctx.fillText(y.toFixed(2), DRAW_CONST.margin - tickSize - 2, py);
  });
}


  // Main drawing function
  function drawPlot() {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines first (behind everything else)
    drawGridAndTicks(ctx);

    // Draw frame
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(
      DRAW_CONST.margin, 
      DRAW_CONST.margin, 
      canvas.width - 2 * DRAW_CONST.margin, 
      canvas.height - 2 * DRAW_CONST.margin
    );
    
    // Draw data points
    const results = model.getSimulationResults();
    const graphicsParams = model.getGraphicsParams();
    const dotSize = graphicsParams?.dotSize || 5;
    
    if (results && results.mollerPoints) {
      // Draw Møller points
      const {mollerPoints, mottPoints, xData, T0, T1} = results;
      
      mollerPoints.forEach((point, i) => {
        const normVal = (xData[i] - T0) / (T1 - T0);
        let color;
        
        if (normVal < 0.5) {
          // Lerp between blue and black
          const t = normVal * 2;
          color = `rgb(${Math.round(t * DRAW_CONST.mollerColorB[0])}, 
                       ${Math.round(t * DRAW_CONST.mollerColorB[1])}, 
                       ${Math.round(DRAW_CONST.mollerColorA[2] * (1-t) + DRAW_CONST.mollerColorB[2] * t)})`;
        } else {
          // Lerp between black and red
          const t = (normVal - 0.5) * 2;
          color = `rgb(${Math.round(DRAW_CONST.mollerColorB[0] * (1-t) + DRAW_CONST.mollerColorC[0] * t)}, 
                       ${Math.round(DRAW_CONST.mollerColorB[1] * (1-t))}, 
                       ${Math.round(DRAW_CONST.mollerColorB[2] * (1-t))})`;
        }
        
        const px = mapX(point.x);
        const py = mapY(point.y);
        
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(px, py, dotSize/2, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Draw Mott points
      ctx.fillStyle = `rgb(${DRAW_CONST.mottColor[0]}, ${DRAW_CONST.mottColor[1]}, ${DRAW_CONST.mottColor[2]})`;
      
      mottPoints.forEach(point => {
        const px = mapX(point.x);
        const py = mapY(point.y);
        
        ctx.beginPath();
        ctx.arc(px, py, dotSize/2, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    
    // Draw detector
    const measurementParams = model.getMeasurementParams();
    if (measurementParams) {
      const detectorWidth = measurementParams.detector_width || 0.02;
      const detectorHeight = measurementParams.detector_height || 0.02;
      const detectorCenterX = measurementParams.detector_center_x || 0;
      
      const x1 = mapX(detectorCenterX - detectorWidth/2);
      const y1 = mapY(detectorHeight/2);
      const x2 = mapX(detectorCenterX + detectorWidth/2);
      const y2 = mapY(-detectorHeight/2);
      
      ctx.fillStyle = `rgba(${DRAW_CONST.detectorFill[0]}, ${DRAW_CONST.detectorFill[1]}, 
                            ${DRAW_CONST.detectorFill[2]}, ${DRAW_CONST.detectorFill[3]})`;
      ctx.strokeStyle = `rgb(${DRAW_CONST.detectorColor[0]}, ${DRAW_CONST.detectorColor[1]}, 
                             ${DRAW_CONST.detectorColor[2]})`;
      ctx.lineWidth = 3;
      
      ctx.fillRect(x1, y1, x2-x1, y2-y1);
      ctx.strokeRect(x1, y1, x2-x1, y2-y1);
    }
  }
  
  // Handle window resize
  window.addEventListener('resize', resizeCanvas);
  
  // Create observer to update the plot when model changes
  const observer = {
    update: () => {
      drawPlot();
    }
  };
  
  // Register the observer with the model
  model.addObserver(observer);
  
  // Initial setup
  resizeCanvas();
  return { redraw: drawPlot };
}