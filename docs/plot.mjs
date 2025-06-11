// Plotting functionality for the physics simulation - simplified

/**
 * Sets up the canvas for drawing the visualization
 * @param {object} model - The application model
 */
export function setupCanvas(model) {
  // Constants for the plot
  const DRAW_CONST = {
    margin: 40,
    gridLines: 5,
    xTicks: 10,
    yTicks: 5,
    xLabel: "x [m]",
    yLabel: "y [m]",
    titlePrefix: "Phase Space at z = ",
    tickLabelSize: 10,
    tickLength: 5,
    tickLabelOffset: 5,
    // Fixed physical ranges
    plotXMin: -0.5,
    plotXMax: 0.5,
    plotYMin: -0.25,
    plotYMax: 0.25,
    // Colors
    mollerColorA: [0, 0, 255],  // Blue
    mollerColorB: [0, 0, 0],    // Black
    mollerColorC: [255, 0, 0],  // Red
    mottColor: [148, 0, 211],   // Purple
    detectorColor: [0, 255, 0], // Green
    detectorFill: [200, 240, 255, 180] // Pale cyan-gray, semi-transparent
  };

  const sketch = (p) => {
    p.setup = () => {
      setupCanvasSize(p);
      p.noLoop(); // We'll redraw only when model changes
    };

    p.windowResized = () => {
      setupCanvasSize(p);
      p.redraw();
    };

function setupCanvasSize(p) {
  const container = document.getElementById('canvasContainer');
  if (!container) {
    console.error('Cannot find #canvasContainer');
    return;
  }
  
  console.log('Container dimensions:', container.offsetWidth, 'x', container.offsetHeight);
  
  // Use the aspect ratio from CSS (2:1)
  const containerWidth = container.offsetWidth;
  const size = containerWidth;
  const height = containerWidth / 2 - 1; // Match the aspect ratio from CSS
  
  console.log('Creating canvas with dimensions:', size, 'x', height);
  
  if (p.canvas) {
    p.resizeCanvas(size, height);
  } else {
    const canvas = p.createCanvas(size, height);
    canvas.parent(container);
    
    // Fix the positioning of the canvas
    setTimeout(() => {
      const canvasElement = container.querySelector('canvas');
      if (canvasElement) {
        canvasElement.style.position = 'static'; // Change from absolute to static
        canvasElement.style.display = 'block';
        canvasElement.style.margin = '0 auto';
        
        // Force the container to have the correct height
        container.style.height = height + 'px';
        
        console.log('Fixed canvas positioning');
      }
    }, 100);
  }
}

    /**
     * Maps physical coordinates to plot coordinates
     */
    function physicalToPlot(x, y) {
      const margin = DRAW_CONST.margin;
      const px = p.map(
        x,
        DRAW_CONST.plotXMin,
        DRAW_CONST.plotXMax,
        margin,
        p.width - margin
      );
      const py = p.map(
        y,
        DRAW_CONST.plotYMin,
        DRAW_CONST.plotYMax,
        p.height - margin,
        margin
      );
      return { x: px, y: py };
    }

    function drawFrame() {
      const margin = DRAW_CONST.margin;
      const plotWidth = p.width - 2 * margin;
      const plotHeight = p.height - 2 * margin;

      // Draw frame
      p.stroke(0);
      p.noFill();
      p.rect(margin, margin, plotWidth, plotHeight);
      
      // Draw labels
      p.textAlign(p.CENTER);
      p.fill(0);
      p.text(DRAW_CONST.xLabel, p.width / 2, p.height - 10);
      
      p.push();
      p.translate(10, p.height / 2);
      p.rotate(-p.HALF_PI);
      p.text(DRAW_CONST.yLabel, 0, 0);
      p.pop();
      
      // Draw title with current z value
      const physicsParams = model.getPhysicsParams();
      p.textAlign(p.CENTER);
      p.noStroke();
      p.fill(0);
      p.text(
        DRAW_CONST.titlePrefix + p.nf(physicsParams.zVal, 1, 2),
        p.width / 2,
        margin - 10
      );
    }

    function drawGrid() {
      p.stroke(200);
      p.strokeWeight(0.5);

      // Horizontal grid lines
      for (let i = 0; i <= DRAW_CONST.gridLines; i++) {
        const y = p.map(
          i / DRAW_CONST.gridLines, 
          0, 1, 
          DRAW_CONST.plotYMin, 
          DRAW_CONST.plotYMax
        );
        const { x: px, y: py } = physicalToPlot(0, y);
        
        // Draw grid line
        p.line(DRAW_CONST.margin, py, p.width - DRAW_CONST.margin, py);
        
        // Draw tick marks
        p.line(DRAW_CONST.margin - DRAW_CONST.tickLength, py, DRAW_CONST.margin, py);
        p.line(p.width - DRAW_CONST.margin, py, p.width - DRAW_CONST.margin + DRAW_CONST.tickLength, py);
      }

      // Vertical grid lines
      for (let i = 0; i <= DRAW_CONST.gridLines; i++) {
        const x = p.map(
          i / DRAW_CONST.gridLines, 
          0, 1, 
          DRAW_CONST.plotXMin, 
          DRAW_CONST.plotXMax
        );
        const { x: px, y: py } = physicalToPlot(x, 0);
        
        // Draw grid line
        p.line(px, DRAW_CONST.margin, px, p.height - DRAW_CONST.margin);
        
        // Draw tick marks
        p.line(px, p.height - DRAW_CONST.margin, px, p.height - DRAW_CONST.margin + DRAW_CONST.tickLength);
        p.line(px, DRAW_CONST.margin, px, DRAW_CONST.margin - DRAW_CONST.tickLength);
      }
    }

    function drawAxisLabels() {
      // X-axis labels
      p.textSize(DRAW_CONST.tickLabelSize);
      p.fill(0);
      p.textAlign(p.CENTER, p.TOP);
      
      for (let i = 0; i <= DRAW_CONST.xTicks; i++) {
        const x = p.map(i / DRAW_CONST.xTicks, 0, 1, DRAW_CONST.plotXMin, DRAW_CONST.plotXMax);
        const { x: px } = physicalToPlot(x, 0);
        
        p.noStroke();
        p.text(p.nf(x, 1, 2), px, p.height - DRAW_CONST.margin + DRAW_CONST.tickLabelOffset);
      }
      
      // Y-axis labels
      p.textAlign(p.RIGHT, p.CENTER);
      
      for (let i = 0; i <= DRAW_CONST.yTicks; i++) {
        const y = p.map(i / DRAW_CONST.yTicks, 0, 1, DRAW_CONST.plotYMin, DRAW_CONST.plotYMax);
        const { y: py } = physicalToPlot(0, y);
        
        p.noStroke();
        p.text(p.nf(y, 1, 2), DRAW_CONST.margin - DRAW_CONST.tickLabelOffset, py);
      }
    }

    function drawDetector() {
      // Get detector parameters from measurement params
      const measurementParams = model.getMeasurementParams();
      
      // Safety check - return if parameters are missing
      if (!measurementParams) return;
      
      const detectorWidth = measurementParams.detector_width || 0.02;
      const detectorHeight = measurementParams.detector_height || 0.02;
      const detectorCenterX = measurementParams.detector_center_x || 0;
      const detectorCenterY = 0; // Fixed at y=0
      
      // Calculate detector corners in physical coordinates
      const topLeft = physicalToPlot(
        detectorCenterX - detectorWidth / 2,
        detectorCenterY + detectorHeight / 2
      );
      
      const bottomRight = physicalToPlot(
        detectorCenterX + detectorWidth / 2,
        detectorCenterY - detectorHeight / 2
      );
      
      // Draw detector
      p.fill(...DRAW_CONST.detectorFill);
      p.stroke(...DRAW_CONST.detectorColor);
      p.strokeWeight(3);
      p.rect(
        topLeft.x,
        topLeft.y,
        bottomRight.x - topLeft.x,
        bottomRight.y - topLeft.y
      );
      
      // Reset styles
      p.strokeWeight(1);
      p.noFill();
    }

    function drawPoints() {
      const graphicsParams = model.getGraphicsParams();
      const simulationResults = model.getSimulationResults();
      
      // Safety check - return if results are missing
      if (!simulationResults || !simulationResults.mollerPoints) {
        return;
      }
      
      const { mollerPoints, mottPoints, xData, T0, T1 } = simulationResults;
      const dotSize = graphicsParams?.dotSize || 5;
      
      // Draw Møller points with gradient coloring
      const blueCol = p.color(...DRAW_CONST.mollerColorA);
      const blackCol = p.color(...DRAW_CONST.mollerColorB);
      const redCol = p.color(...DRAW_CONST.mollerColorC);
      
      p.noStroke();
      
      for (let i = 0; i < mollerPoints.length; i++) {
        // Normalize T value for color gradient
        const normVal = p.map(xData[i], T0, T1, 0, 1);
        const col = normVal < 0.5
          ? p.lerpColor(blueCol, blackCol, normVal * 2)
          : p.lerpColor(blackCol, redCol, (normVal - 0.5) * 2);
        
        const { x: px, y: py } = physicalToPlot(
          mollerPoints[i].x, 
          mollerPoints[i].y
        );
        
        p.fill(col);
        p.ellipse(px, py, dotSize, dotSize);
      }
      
      // Draw Mott points
      p.fill(p.color(...DRAW_CONST.mottColor));
      
      for (const point of mottPoints) {
        const { x: px, y: py } = physicalToPlot(point.x, point.y);
        p.ellipse(px, py, dotSize, dotSize);
      }
    }

    p.draw = () => {
      p.background(240);
      
      // Draw the plot components in order
      drawFrame();
      drawGrid();
      drawAxisLabels();
      drawDetector();
      drawPoints();
    };

    // Create observer to update the plot when model changes
    const observer = {
      update: () => {
        p.redraw();
      }
    };
    
    // Register the observer with the model
    model.addObserver(observer);
  };

  // Start the p5 sketch
  new p5(sketch);
}

/**
 * Sets up the p5 plot in the canvasContainer
 * @param {object} model - The application model
 */
export function setupPlot(model) {
  setupCanvas(model);
}
