import { mollerPhaseSpaceData } from "./mollerPhaseSpaceData.mjs";

// Define physics parameters
const physicsParams = {
  deltaT1: 10,
  zVal: 1,
  Bs: 8.0,
  Lc1: 0.75,
  PlotRangeX: 0.1,
  centerT: 155.0 / 2
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
setupPhysicsSlider('PlotRangeX', 'PlotRangeX');
setupPhysicsSlider('centerT', 'centerT');

// Set up slider for graphics parameter (dot size).
setupGraphicsSlider('dotSize', 'dotSize');

// Physics scenarios (only affect physicsParams).
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

window.draw = () => {
  background(240);

  // Compute physics data only based on physics parameters.
  const { mollerPoints, mottPoints, xData, T0, T1 } = mollerPhaseSpaceData(physicsParams);

  const margin = 40;
  const plotWidth = width - 2 * margin;
  const plotHeight = height - 2 * margin;

  // Draw frame and axes.
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
  text("Phase Space at z = " + nf(physicsParams.zVal, 1, 2), width / 2, margin - 10);

  // Draw grid lines and ticks over the plot area.
  const n = 5; // number of grid lines (adjust as needed)
  stroke(200); // light gray color for grid lines
  strokeWeight(0.5); // thin grid lines
  
  // Horizontal grid lines and tick marks.
  for (let i = 0; i < n; i++) {
    let y = margin + (i * plotHeight) / (n - 1);
    line(margin, y, width - margin, y);
    // Draw tick marks on the left (vertical axis) and right boundaries.
    line(margin - 5, y, margin, y);           // left tick
    line(width - margin, y, width - margin + 5, y); // right tick
  }
  
  // Vertical grid lines and tick marks.
  for (let i = 0; i < n; i++) {
    let x = margin + (i * plotWidth) / (n - 1);
    line(x, margin, x, height - margin);
    // Draw tick marks along the bottom and top boundaries.
    line(x, height - margin, x, height - margin + 5); // bottom tick
    line(x, margin, x, margin - 5);                   // top tick
  }

  // Draw x-axis tick marks and labels.
  const xTicks = 10; // number of ticks along the x-axis
  textSize(10);
  fill(0);
  textAlign(CENTER, TOP);
  for (let i = 0; i < xTicks; i++) {
    let t = i / (xTicks - 1);
    let x = lerp(margin, width - margin, t);
    // Map from display coordinates to data value.
    let value = lerp(-physicsParams.PlotRangeX, physicsParams.PlotRangeX, t);
    // Draw a short tick mark.
    stroke(200);
    line(x, height - margin, x, height - margin + 3);
    // Draw a label slightly below the tick.
    noStroke();
    text(nf(value, 1, 2), x, height - margin + 5);
  }

  // Draw y-axis tick marks and labels.
  const yTicks = 10; // number of ticks along the y-axis
  textAlign(RIGHT, CENTER);
  for (let i = 0; i < yTicks; i++) {
    let t = i / (yTicks - 1);
    let y = lerp(height - margin, margin, t);
    // Map from display coordinates to data value for y.
    let value = lerp(-0.1, 0.1, t);
    // Draw a short tick mark.
    stroke(200);
    line(margin - 3, y, margin, y);
    // Draw a label to the left of the tick.
    noStroke();
    text(nf(value, 1, 2), margin - 5, y);
  }

  // Draw Møller points as filled circles.
  const blueCol  = color(0, 0, 255);
  const blackCol = color(0, 0, 0);
  const redCol   = color(255, 0, 0);
  for (let i = 0; i < mollerPoints.length; i++) {
    const normVal = map(xData[i], T0, T1, 0, 1);
    const col = normVal < 0.5 
      ? lerpColor(blueCol, blackCol, normVal * 2) 
      : lerpColor(blackCol, redCol, (normVal - 0.5) * 2);
    const px = map(mollerPoints[i].x, -physicsParams.PlotRangeX, physicsParams.PlotRangeX, margin, width - margin);
    const py = map(mollerPoints[i].y, -0.1, 0.1, height - margin, margin);
    fill(col);
    noStroke();
    ellipse(px, py, graphicsParams.dotSize, graphicsParams.dotSize);
  }

  // Draw Mott points as filled circles.
  fill(color(148, 0, 211));
  noStroke();
  mottPoints.forEach(pt => {
    const px = map(pt.x, -physicsParams.PlotRangeX, physicsParams.PlotRangeX, margin, width - margin);
    const py = map(pt.y, -0.1, 0.1, height - margin, margin);
    ellipse(px, py, graphicsParams.dotSize, graphicsParams.dotSize);
  });
};
