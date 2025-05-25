const electronMass = 0.510998; // MeV
const speedOfLight = 2.99792458e8; // m/s

export function magneticRigidity(T) {
  return ((T + electronMass) * 1e6) / speedOfLight;
}

/**
 * @param intermediateResults optional object that can be used to collect
 *                            some of the intermediate results that are
 *                            not exposed otherwise. For testing only.
 */
export function mollerInitialConditions(T0, T1) {
  const E0 = T0 + electronMass;
  const E1 = T1 + electronMass;
  const E2 = E0 + electronMass - E1;

  const T2 = T0 - T1;

  const p0 = Math.sqrt(E0 * E0 - electronMass * electronMass);
  const p1 = Math.sqrt(E1 * E1 - electronMass * electronMass);
  const p2 = Math.sqrt(E2 * E2 - electronMass * electronMass);

  const theta1 = +Math.acos((p0 * p0 + p1 * p1 - p2 * p2) / (2 * p0 * p1));
  const theta2 = -Math.acos((p0 * p0 + p2 * p2 - p1 * p1) / (2 * p0 * p2));
  const phi = Math.random() * 2 * Math.PI;
  const startCoordX = Math.random() * 0.002 - 0.001;
  const startCoordY = Math.random() * 0.002 - 0.001;

  // Creates an object with energy, theta, and 4-component vector
  function mkInit(T, theta) {
    return {
      T,
      theta,
      vec: [
        startCoordX, 
        theta * Math.cos(phi), 
        startCoordY, 
        theta * Math.sin(phi)
      ]
    };
  }
  return [
    mkInit(T1, theta1),
    mkInit(T2, theta2)
  ];
}

export function mollerPhaseSpaceData(params) {

  function mottInitialConditions() {
    const x = Math.random() * 0.002 - 0.001;
    const y = Math.random() * 0.002 - 0.001;
    const theta = Math.random() * 0.001;
    const phi = Math.random() * 2 * Math.PI;
    return [x, theta * Math.cos(phi), y, theta * Math.sin(phi)];
  }

  function driftMatrix(Lc) {
    return [
      [1, Lc, 0, 0],
      [0, 1,  0, 0],
      [0, 0,  1, Lc],
      [0, 0,  0, 1]
    ];
  }

  function solenoidMatrix(Bs, Ls, T) {
    const k = Math.abs(Bs) / magneticRigidity(T);
    const phi = k * Ls;
    const f = Math.sin(phi) / k;
    const g = (1 - Math.cos(phi)) / k;
    return [
      [ Math.cos(phi), f,             Math.sin(phi),  g ],
      [ -k * Math.sin(phi), Math.cos(phi), -k * g,      Math.sin(phi) ],
      [ -Math.sin(phi), -g,            Math.cos(phi), f ],
      [ k * g,         -Math.sin(phi), -k * Math.sin(phi), Math.cos(phi) ]
    ];
  }

  function multiplyMatrixVector(m, v) {
    const result = [];
    for (let i = 0; i < 4; i++) {
        let sum = 0;
        for (let j = 0; j < 4; j++){
           sum += m[i][j] * v[j];
        }
        result.push(sum);
    }
    return result;
  }

  function multiplyMatrices(a, b) {
    const result = [];
    for (let i = 0; i < 4; i++){
       result[i] = [];
       for (let j = 0; j < 4; j++){
           let sum = 0;
           for (let k = 0; k < 4; k++){
              sum += a[i][k] * b[k][j];
           }
           result[i][j] = sum;
       }
    }
    return result;
  }

  // --- Begin computation ---
  const mollerPoints = [];
  const mottPoints = [];
  const xData = [];
  const centerT = params.centerT;
  const Tmin = centerT - params.deltaT1;
  const Tmax = centerT + params.deltaT1;
  const steps = 2550;

  // Compute Møller points.
  for (let i = 0; i <= steps; i++) {
    const T1 = Tmin + (Tmax - Tmin) * (i / steps);
    const electronInitialConds =
      mollerInitialConditions(155.0, T1);

    const md = driftMatrix(params.Lc1);

    let sharedCorrectionAngle;

    for (let initCond of electronInitialConds) {
      const ms = solenoidMatrix(params.Bs, 0.40607 * params.zVal, initCond.T);
      const combined = multiplyMatrices(md, ms);
      const vec = multiplyMatrixVector(combined, initCond.vec)

      const x = vec[0];
      const y = vec[2];
      if (sharedCorrectionAngle === undefined) {  
        sharedCorrectionAngle = Math.atan2(y, x);
      }
      
      const sin_corr = Math.sin(sharedCorrectionAngle);
      const cos_corr = Math.cos(sharedCorrectionAngle);
      const correctedX = +cos_corr * x + sin_corr * y;
      const correctedY = -sin_corr * x + cos_corr * y;

      xData.push(initCond.T);  
      mollerPoints.push({
        x: params.normalizationOn ? correctedX : x,
        y: params.normalizationOn ? correctedY : y
      });
    }
  }

  // Compute Mott points.
  for (let i = 0; i < 49; i++) {
    const md = driftMatrix(params.Lc1);
    const ms = solenoidMatrix(params.Bs, 0.40607 * 1, 155.0);
    const combined = multiplyMatrices(md, ms);
    const vec = multiplyMatrixVector(combined, mottInitialConditions());
    mottPoints.push({ x: vec[0], y: vec[2] });
  }

  return { mollerPoints, mottPoints, xData, T0: Tmin, T1: Tmax };
}
