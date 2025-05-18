import { mollerPhaseSpaceData } from "./mollerPhaseSpaceData.mjs";

// Define initial parameters (immutable settings for the physics data)
const params = {
  deltaT1: 10,
  zVal: 1,
  Bs: 8.0,
  Lc1: 0.75,
  PlotRangeX: 0.1
};

// Save a copy of default parameters for full scenario resets.
const defaultParams = { ...params };

// Utility: set up slider event listener to update params and display current value.
function setupSlider(id, paramKey) {
  const slider = document.getElementById(id);
  const valueDisplay = document.getElementById(id + 'Value');
  slider.addEventListener('input', () => {
    params[paramKey] = parseFloat(slider.value);
    valueDisplay.textContent = slider.value;
    redraw();
  });
}

setupSlider('deltaT1', 'deltaT1');
setupSlider('zVal', 'zVal');
setupSlider('Bs', 'Bs');
setupSlider('Lc1', 'Lc1');
setupSlider('PlotRangeX', 'PlotRangeX');

// Scenarios of special interest.
// Note that the "partial" scenarios adjust only a subset of parameters.
const scenarios = [
  {
    title: "Default Scenario",
    partial: false,
    params: { deltaT1: 35, zVal: 0.47, Bs: 8.0, Lc1: 0.75, PlotRangeX: 0.1 }
  },
  {
    title: "Vary PlotRangeX",
    partial: false,
    params: { deltaT1: 20, zVal: 0.7, Bs: 6.5, Lc1: 1.2, PlotRangeX: 0.19 }
  },
  {
    title: "High ΔT1",
    partial: false,
    params: { deltaT1: 73.6, zVal: 0.9, Bs: 3.0, Lc1: 0.5, PlotRangeX: 0.1 }
  },
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
  }
];

// Set up scenario buttons in the buttons container.
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
        // For partial scenarios, only update provided keys:
        for (const key in scenario.params) {
          params[key] = scenario.params[key];
          const slider = document.getElementById(key);
          slider.value = scenario.params[key];
          const display = document.getElementById(key + "Value");
          display.textContent = scenario.params[key];
        }
      } else {
        // For full scenarios, override all keys:
        Object.keys(params).forEach(key => {
          // Use scenario value if provided, otherwise reset to default.
          params[key] = scenario.params.hasOwnProperty(key) ? scenario.params[key] : defaultParams[key];
          const slider = document.getElementById(key);
          slider.value = params[key];
          const display = document.getElementById(key + "Value");
          display.textContent = params[key];
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
  const availableHeight = window.innerHeight; // or subtract any offset if needed
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

// p5.js draw – attached to the window as required
window.draw = () => {
  background(240);

  // Compute physics data inside draw, keeping variables local.
  const { mollerPoints, mottPoints, xData, T0, T1 } = mollerPhaseSpaceData(params);

  // Define plotting area dimensions
  const margin = 40;
  const plotWidth = width - 2 * margin;
  const plotHeight = height - 2 * margin;

  // Draw frame and axes labels
  stroke(0);
  noFill();
  rect(margin, margin, plotWidth, plotHeight);
  textAlign(CENTER);
  fill(0);
  text("x [m]", width / 2, height - 10);
  push();
  translate(10, height / 2);
  rotate(-HALF_PI);
  text("y [m]", 0, 0);
  pop();
  noStroke();
  fill(0);
  text("Phase Space at z = " + nf(params.zVal, 1, 2), width / 2, margin - 10);

  // Draw Møller points with a color gradient
  const blueCol  = color(0, 0, 255);
  const blackCol = color(0, 0, 0);
  const redCol   = color(255, 0, 0);
  for (let i = 0; i < mollerPoints.length; i++) {
    const normVal = map(xData[i], T0, T1, 0, 1);
    const col = normVal < 0.5
      ? lerpColor(blueCol, blackCol, normVal * 2)
      : lerpColor(blackCol, redCol, (normVal - 0.5) * 2);
    
    const px = map(mollerPoints[i].x, -params.PlotRangeX, params.PlotRangeX, margin, width - margin);
    const py = map(mollerPoints[i].y, -0.1, 0.1, height - margin, margin);
    
    fill(col);
    noStroke();
    ellipse(px, py, 20, 20);
  }

  // Draw Mott points as outlined violet circles
  strokeWeight(1);
  stroke(148, 0, 211);
  noFill();
  mottPoints.forEach(pt => {
    const px = map(pt.x, -params.PlotRangeX, params.PlotRangeX, margin, width - margin);
    const py = map(pt.y, -0.1, 0.1, height - margin, margin);
    ellipse(px, py, 8, 8);
  });
};
