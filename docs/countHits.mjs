// This function is responsible for counting of the Mott / Moller hits
// in the detector geometry.

export function countHits(simulationResults, measurementParams) {
  const { mottPoints, mollerPoints } = simulationResults;
  const { detector_center_x, detector_width, detector_height } = measurementParams;

  function count(hits) {
    let res = 0;
    for (const {x, y} of hits) {
      const xDist = Math.abs(x - detector_center_x);
      const yDist = Math.abs(y);
      if (xDist <= detector_width / 2 && yDist <= detector_height / 2) {
        res++;
      }
    }
    return res;
  }

  const mottHits = count(mottPoints);
  const mollerHits = count(mollerPoints);

  const mottPercent = mottPoints.length === 0 ? 0 : (mottHits / mottPoints.length) * 100;
  const mollerPercent = mollerPoints.length === 0 ? 0 : (mollerHits / mollerPoints.length) * 100;
  return { mottHits, mollerHits, mottPercent, mollerPercent };
}
