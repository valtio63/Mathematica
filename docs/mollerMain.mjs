import { mollerPhaseSpaceData } from "./mollerPhaseSpaceData.mjs";

// Define physics parameters
const physicsParams = {
  deltaT1: 10,
  zVal: 1,
  Bs: 8.0,
  grad: 1.7,
  Lc1: 0.75,
  PlotRangeX: 0.2,
  centerT: 155.0 / 2,
  normalizationOn: true,
  detector_center_y: 0.2,
  detector_geometry: "square"
};

// Save a copy for full scenario resets.
const defaultPhysicsParams = { ...physicsParams };

// Define graphics parameters (for things like dot size)
const graphicsParams = {
  dotSize: 5
};

// Utility: set up slider for physics parameters.
function setupPhysicsSlider(id, paramKey) {
  const slider = document.getElementById(id);
  const valueDisplay = document.getElementById(id + 'Value');
  slider.addEventListener('input', () => {
    physicsParams[paramKey] = parseFloat(slider.value);
    valueDisplay.textContent = slider.value;
    redraw();
  });
}

// Utility: set up slider for graphics parameters.
function setupGraphicsSlider(id, paramKey) {
  const slider = document.getElementById(id);
  const valueDisplay = document.getElementById(id + 'Value');
  slider.addEventListener('input', () => {
    graphicsParams[paramKey] = parseFloat(slider.value);
    valueDisplay.textContent = slider.value;
    redraw();
  });
}

// Set up sliders for physics parameters.
setupPhysicsSlider('deltaT1', 'deltaT1');
setupPhysicsSlider('zVal', 'zVal');
setupPhysicsSlider('Bs', 'Bs');
setupPhysicsSlider('Lc1', 'Lc1');
setupPhysicsSlider('centerT', 'centerT');
setupPhysicsSlider('grad', 'grad');
setupPhysicsSlider('detector_center_y', 'detector_center_y');

// Set up slider for graphics parameter (dot size).
setupGraphicsSlider('dotSize', 'dotSize');

// Set up the normalizationOn toggle checkbox.
const normalizationCheckbox = document.getElementById('normalizationOn');
normalizationCheckbox.addEventListener('change', () => {
  physicsParams.normalizationOn = normalizationCheckbox.checked;
  redraw();
});

// Physics scenarios (only affect physicsParams).
const scenarios = [
  {
    title: "ΔT1 = 0.1",
    partial: true,
    params: { deltaT1: 0.1 }
  },
  {
    title: "ΔT1 = 10",
    partial: true,
    params: { deltaT1: 10 }
  },
  {
    title: "ΔT1 = 50",
    partial: true,
    params: { deltaT1: 50 }
  },
  {
    title: "RangeX = 0.01",
    partial: true,
    params: { PlotRangeX: 0.01 }
  },
  {
    title: "RangeX = 0.1",
    partial: true,
    params: { PlotRangeX: 0.1 }
  },
  {
    title: "Reset centerT = 155.0 / 2",
    partial: true,
    params: { centerT: (155.0 / 2) }
  }
];

// Set up scenario buttons in the buttons container (update only physics parameters).
function setupScenarios() {
  const buttonsContainer = document.querySelector(".buttons");
  scenarios.forEach(scenario => {
    const btn = document.createElement("button");
    btn.textContent = scenario.title;
    if (scenario.partial) {
      btn.classList.add("partial");
    }
    btn.addEventListener("click", () => {
      if (scenario.partial) {
        // Only update the keys provided.
        for (const key in scenario.params) {
          physicsParams[key] = scenario.params[key];
          const slider = document.getElementById(key);
          slider.value = scenario.params[key];
          const display = document.getElementById(key + "Value");
          display.textContent = scenario.params[key];
        }
      } else {
        // Full scenario: override all physics keys.
        Object.keys(physicsParams).forEach(key => {
          physicsParams[key] = scenario.params.hasOwnProperty(key)
            ? scenario.params[key]
            : defaultPhysicsParams[key];
          const slider = document.getElementById(key);
          slider.value = physicsParams[key];
          const display = document.getElementById(key + "Value");
          display.textContent = physicsParams[key];
        });
      }
      redraw();
    });
    buttonsContainer.appendChild(btn);
  });
}

setupScenarios();

window.setup = () => {
  setSquareCanvas();
  noLoop();
};

function setSquareCanvas() {
  const container = document.getElementById("canvasContainer");
  const containerWidth = container.clientWidth;
  const availableHeight = window.innerHeight;
  const size = Math.min(containerWidth, availableHeight);
  if (window.myCanvas) {
    resizeCanvas(size, size);
  } else {
    window.myCanvas = createCanvas(size, size);
    window.myCanvas.parent("canvasContainer");
  }
}

window.windowResized = () => {
  setSquareCanvas();
};

/** Helper method that finds a span with given 'id'
 * and sets its text content to the given numeric value.
 */
function setSpanText(id, value) {
  const span = document.getElementById(id);
  if (span) {
    console.log("Found the span for id:", id, ":", span);
    console.log("The value is ", value);
    span.textContent = value.toFixed(2);
  } else {
    console.warn(`Span with id '${id}' not found.`);
  }
}

/**
 * Maps physical coordinates (x, y) to plot coordinates (px, py).
 * Handles margins and axis scaling.
 */
function physicalCoordsToPlotCoords({ x, y }) {
  const margin = 40;
  const plotWidth = width - 2 * margin;
  const plotHeight = height - 2 * margin;
  const px = map(
    x,
    -physicsParams.PlotRangeX,
    physicsParams.PlotRangeX,
    margin,
    width - margin
  );
  const py = map(
    y,
    -0.2,
    0.2,
    height - margin,
    margin
  );
  return { x: px, y: py };
}

/**
 * Maps plot coordinates (px, py) to physical coordinates (x, y).
 * Handles margins and axis scaling.
 */
function plotCoordsToPhysicalCoords({ x, y }) {
  const margin = 40;
  const plotWidth = width - 2 * margin;
  const plotHeight = height - 2 * margin;
  const physX = map(
    x,
    margin,
    width - margin,
    -physicsParams.PlotRangeX,
    physicsParams.PlotRangeX
  );
  const physY = map(
    y,
    height - margin,
    margin,
    -0.2,
    0.2
  );
  return { x: physX, y: physY };
}

window.draw = () => {
  const DRAW_CONST = {
    margin: 40,
    gridLines: 5,
    xTicks: 10,
    yTicks: 10,
    xLabel: "x [m]",
    yLabel: "y [m]",
    titlePrefix: "Phase Space at z = ",
    tickLabelSize: 10,
    tickLength: 5,
    tickLabelOffset: 5,
    plotYMin: -0.4,
    plotYMax: +0.4,
    mollerColorA: [0, 0, 255],
    mollerColorB: [0, 0, 0],
    mollerColorC: [255, 0, 0],
    mottColor: [148, 0, 211]
  };

  background(240);

  // Compute physics data only based on physics parameters.
  const observer = {};
  const { mollerPoints, mottPoints, xData, T0, T1, mottHits, mollerHits } = mollerPhaseSpaceData(physicsParams, observer);
  setSpanText("detector_hits_count_moller", mollerHits);
  setSpanText("detector_hits_count_mott", mottHits);

  const margin = DRAW_CONST.margin;
  const plotWidth = width - 2 * margin;
  const plotHeight = height - 2 * margin;

  // Draw frame and axes.
  stroke(0);
  noFill();
  rect(margin, margin, plotWidth, plotHeight);
  textAlign(CENTER);
  fill(0);
  text(DRAW_CONST.xLabel, width / 2, height - 10);
  push();
  translate(10, height / 2);
  rotate(-HALF_PI);
  text(DRAW_CONST.yLabel, 0, 0);
  pop();
  noStroke();
  fill(0);
  text(
    DRAW_CONST.titlePrefix + nf(physicsParams.zVal, 1, 2),
    width / 2,
    margin - 10
  );

  // Draw grid lines and ticks over the plot area.
  stroke(200);
  strokeWeight(0.5);

  // Horizontal grid lines and tick marks.
  for (let i = 0; i < DRAW_CONST.gridLines; i++) {
    let t = i / (DRAW_CONST.gridLines - 1);
    let yPhys = lerp(DRAW_CONST.plotYMin, DRAW_CONST.plotYMax, t);
    let { y } = physicalCoordsToPlotCoords({ x: 0, y: yPhys });
    line(margin, y, width - margin, y);
    // Draw tick marks on the left and right boundaries.
    line(margin - DRAW_CONST.tickLength, y, margin, y);
    line(width - margin, y, width - margin + DRAW_CONST.tickLength, y);
  }

  // Vertical grid lines and tick marks.
  for (let i = 0; i < DRAW_CONST.gridLines; i++) {
    let t = i / (DRAW_CONST.gridLines - 1);
    let xPhys = lerp(-physicsParams.PlotRangeX, physicsParams.PlotRangeX, t);
    let { x } = physicalCoordsToPlotCoords({ x: xPhys, y: 0 });
    line(x, margin, x, height - margin);
    // Draw tick marks along the bottom and top boundaries.
    line(x, height - margin, x, height - margin + DRAW_CONST.tickLength);
    line(x, margin, x, margin - DRAW_CONST.tickLength);
  }

  // Draw x-axis tick marks and labels.
  textSize(DRAW_CONST.tickLabelSize);
  fill(0);
  textAlign(CENTER, TOP);
  for (let i = 0; i < DRAW_CONST.xTicks; i++) {
    let t = i / (DRAW_CONST.xTicks - 1);
    let xPhys = lerp(-physicsParams.PlotRangeX, physicsParams.PlotRangeX, t);
    let { x } = physicalCoordsToPlotCoords({ x: xPhys, y: 0 });
    stroke(200);
    line(x, height - margin, x, height - margin + 3);
    noStroke();
    text(nf(xPhys, 1, 2), x, height - margin + DRAW_CONST.tickLabelOffset);
  }

  // Draw y-axis tick marks and labels
  textAlign(RIGHT, CENTER);
  for (let i = 0; i < DRAW_CONST.yTicks; i++) {
    let t = i / (DRAW_CONST.yTicks - 1);
    let yPhys = lerp(DRAW_CONST.plotYMin, DRAW_CONST.plotYMax, t);
    let { y } = physicalCoordsToPlotCoords({ x: 0, y: yPhys });
    stroke(200);
    line(margin - 3, y, margin, y);
    noStroke();
    text(nf(yPhys, 1, 2), margin - DRAW_CONST.tickLabelOffset, y);
  }

  // Draw the detector as a little square at x = 0,
  // y = physicsParams.detector_center_y, with side length = 2.
  // TODO: side length should be a parameter.
  // Example: side length in physical units
  const detectorSidePhys = 0.02;
  const detectorCenter = physicalCoordsToPlotCoords({
    x: 0,
    y: physicsParams.detector_center_y
  });
  const detectorTopLeft = physicalCoordsToPlotCoords({
    x: -detectorSidePhys / 2,
    y: physicsParams.detector_center_y + detectorSidePhys / 2
  });
  const detectorBottomRight = physicalCoordsToPlotCoords({
    x: detectorSidePhys / 2,
    y: physicsParams.detector_center_y - detectorSidePhys / 2
  });
  // Fill the detector rectangle with pale cyan grayish color, then draw border
  fill(200, 240, 255, 180); // pale cyan-gray, semi-transparent
  stroke(0, 255, 0); // bright green
  strokeWeight(3);   // 3 px thick
  rect(
    detectorTopLeft.x,
    detectorTopLeft.y,
    detectorBottomRight.x - detectorTopLeft.x,
    detectorBottomRight.y - detectorTopLeft.y
  );
  strokeWeight(1); // reset to default after drawing
  noFill(); // reset fill to default

  // Draw Møller points as filled circles.
  const blueCol = color(...DRAW_CONST.mollerColorA);
  const blackCol = color(...DRAW_CONST.mollerColorB);
  const redCol = color(...DRAW_CONST.mollerColorC);
  for (let i = 0; i < mollerPoints.length; i++) {
    const normVal = map(xData[i], T0, T1, 0, 1);
    const col =
      normVal < 0.5
        ? lerpColor(blueCol, blackCol, normVal * 2)
        : lerpColor(blackCol, redCol, (normVal - 0.5) * 2);
    const { x, y } = physicalCoordsToPlotCoords(mollerPoints[i]);
    fill(col);
    noStroke();
    ellipse(x, y, graphicsParams.dotSize, graphicsParams.dotSize);
  }

  // Draw Mott points as filled circles.
  fill(color(...DRAW_CONST.mottColor));
  noStroke();
  mottPoints.forEach((pt) => {
    const { x, y } = physicalCoordsToPlotCoords(pt);
    ellipse(x, y, graphicsParams.dotSize, graphicsParams.dotSize);
  });
};
