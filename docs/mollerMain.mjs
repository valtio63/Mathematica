import { 
  setupPhysicsSlider,
  setupPhysicsCheckbox,
  setupMeasurementSlider,
  setupMeasurementCounter,
  setupGraphicsSlider,
  setupButton,
} from "./ui.mjs";

import { setupPlot } from "./plot.mjs";

import { Model } from "./model.mjs";


const physicsParamsSliderSettings = {
  numParticles: {
    min: 100,
    max: 50000,
    step: 100,
    label: "num Particles",
    id: "num_particles"
  },
  deltaT1: {
    min: 0.1,
    max: 77,
    step: 0.1,
    label: "ΔT1",
    id: "deltaT1"
  },
  zVal: {
    min: 0,
    max: 1,
    step: 0.01,
    label: "z Scale",
    id: "zVal"
  },
  Bs: {
    min: 0.01,
    max: 9,
    step: 0.1,
    label: "Bₛ [T]",
    id: "Bs"
  },
  grad: {
    min: -2.5,
    max: 2.5,
    step: 0.01,
    label: "grad_q [T/m]",
    id: "grad"
  },
  Lc1: {
    min: 0,
    max: 2,
    step: 0.01,
    label: "Drift L [m]",
    id: "Lc1"
  },
  centerT: {
    min: 10.0,
    max: 145.0,
    step: 1.0,
    label: "centerT",
    id: "centerT"
  }
}

const physicsParamsCheckboxSettings = {
  normalizationOn: {
    label: "Normalization",
    id: "normalizationOn"
  }
}

const measurementSliderSettings = {
  detector_center_x: {
    min: -0.5,
    max: 0.5,
    step: 0.01,
    label: "Detector Offset",
    id: "detector_center_y"
  },
  detector_width: {
    min: 0.01,
    max: 0.1,
    step: 0.01,
    label: "Detector Width",
    id: "detector_width"
  }
}

const measurementCounterSettings = {
  mottHits: {
    label: "Mott Hits" 
  },
  mottPercent: {
    label: "Mott (%)"
  },
  mollerHits: {
    label: "Møller Hits"
  },
  mollerPercent: {
    label: "Møller (%)"
  }
}

const graphicsSliderSettings = {
  dotSize: {
    min: 1,
    max: 10,
    step: 1,
    label: "Dot Size",
    id: "dotSize"
  }
}

const buttons = [
  {
    title: "Reset centerT = 155.0 / 2",
    settings: { physicsParams: { centerT: (155.0 / 2) } }
  },
  {
    title: "ΔT1 = 0.1",
    settings: {
      physicsParams: { deltaT1: 0.1 }
    }
  },
  {
    title: "ΔT1 = 10",
    settings: { physicsParams: { deltaT1: 10 } }
  },
  {
    title: "ΔT1 = 50",
    settings: { physicsParams: { deltaT1: 50 } }
  },
];

const model = Model();

for (const [key, settings] of Object.entries(physicsParamsSliderSettings)) {
  setupPhysicsSlider(key, settings, model);
}

for (const [key, settings] of Object.entries(physicsParamsCheckboxSettings)) {
  setupPhysicsCheckbox(key, settings, model);
}

for (const [key, settings] of Object.entries(measurementCounterSettings)) {
  setupMeasurementCounter(key, settings, model);
}

for (const [key, settings] of Object.entries(measurementSliderSettings)) {
  setupMeasurementSlider(key, settings, model);
}

for (const [key, settings] of Object.entries(graphicsSliderSettings)) {
  setupGraphicsSlider(key, settings, model);
}

for (const button of buttons) {
  setupButton(button.title, button.settings, model);
}

setupPlot(model);

model.notifyObservers();
