import { mollerPhaseSpaceData } from "./mollerPhaseSpaceData.mjs";
import { countHits } from "./countHits.mjs";

// The model holds the entire state of the application.
export function Model() {
  
  const physicsParams = {
    numParticles: 10000,
    deltaT1: 10,
    zVal: 1,
    Bs: 8.0,
    grad: -1.7,
    Lc1: 0.75,
    centerT: 77.5,
    normalizationOn: false
  };
  
  const measurementParams = {
    detector_center_x: 0.2,
    detector_width: 0.02,
    detector_height: 0.02,
    detector_geometry: "square"
  };
  
  const graphicsParams = {
    dotSize: 5
  };

  const observers = [];
  function addObserver(observer) {
    observers.push(observer);
  }
  function notifyObservers() {
    observers.forEach(observer => observer.update());
  }
  function getPhysicsParams() {
    return { ...physicsParams };
  }
  function getPhysicsParam(key) {
    if (physicsParams.hasOwnProperty(key)) {
      return physicsParams[key];
    } else {
      const available = Object.keys(physicsParams).join(", ");
      console.error(`Unknown physics parameter: ${key}. Available parameters: ${available}`);
      throw new Error(`Unknown physics parameter: ${key}. Available parameters: ${available}`);
    }
  }
  function getMeasurementParams() {
    return { ...measurementParams };
  }
  function getMeasurementParam(key) {
    if (measurementParams.hasOwnProperty(key)) {
      return measurementParams[key];
    } else {
      const available = Object.keys(measurementParams).join(", ");
      console.error(`Unknown measurement parameter: ${key}. Available parameters: ${available}`);
      throw new Error(`Unknown measurement parameter: ${key}. Available parameters: ${available}`);
    }
  }
  function getGraphicsParams() {
    return { ...graphicsParams };
  }
  function setPhysicsParam(key, value) {
    if (physicsParams.hasOwnProperty(key)) {
      physicsParams[key] = value;

      // Every time the physics parameters change,
      // we need to rerun the simulation.
      rerunSimulation();
      recount();
      notifyObservers();
    } else {
      console.warn(`Unknown physics parameter: ${key}`);
    }
  }
  function setMeasurementParam(key, value) {
    if (measurementParams.hasOwnProperty(key)) {
      measurementParams[key] = value;
      recount();
      notifyObservers();
    } else {
      console.warn(`Unknown measurement parameter: ${key}`);
    }
  }
  function setGraphicsParam(key, value) {
    if (graphicsParams.hasOwnProperty(key)) {
      graphicsParams[key] = value;
      notifyObservers();
    } else {
      console.warn(`Unknown graphics parameter: ${key}`);
    }
  }

  let simulationResults = {};
  // Initially run the simulation to populate the results.
  rerunSimulation();

  function rerunSimulation() {
    simulationResults = mollerPhaseSpaceData(physicsParams);
  }
  function getSimulationResults() {
    return simulationResults;
  }

  let hitCounts = {};

  function recount() {
    hitCounts = countHits(simulationResults, measurementParams);
  }

  recount();

  function getHitCounts() {
    return { ...hitCounts };
  }

  function getHitCount(key) {
    if (hitCounts.hasOwnProperty(key)) {
      return hitCounts[key];
    } else {
      const available = Object.keys(hitCounts).join(", ");
      console.error(`Unknown hit count key: ${key}. Available keys: ${available}`);
      throw new Error(`Unknown hit count key: ${key}. Available keys: ${available}`);
    }
  }

  return {
    addObserver,
    notifyObservers,
    getPhysicsParams,
    getPhysicsParam,
    getMeasurementParams,
    getMeasurementParam,
    getGraphicsParams,
    setPhysicsParam,
    setMeasurementParam,
    setGraphicsParam,
    getSimulationResults,
    getHitCounts,
    getHitCount
  };
}
