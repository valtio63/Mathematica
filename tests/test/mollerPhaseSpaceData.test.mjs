import {jest} from '@jest/globals';
jest.useFakeTimers();

import {
  magneticRigidity,
  mollerInitialConditions
} from '../../docs/mollerPhaseSpaceData.mjs';

test('Magnetic rigidity should take electron mass into account', () => {
  expect(magneticRigidity(123.0)).toBeCloseTo(0.4119883, 5);
});

test(
  'Moller initial conditions at 155.0, 155.0 / 2 ' +
  'should give the expected theta1', () =>{

  // Since `theta1` is not part of the output, we use this
  // extra object to capture it during the calculation.
  const intermediateResults = {};

  const initialConditions =
    mollerInitialConditions(155.0, 155.0 / 2, intermediateResults);

  // theta1 should be 4.6271 deg, to 5 relevant digits.
  const expectedTheta1Deg = 4.6271;
  const expectedTheta1Rad = expectedTheta1Deg * Math.PI / 180.0;
  expect(intermediateResults.theta1).toBeCloseTo(expectedTheta1Rad, 5);

  // second and fourth components are theta1 * cos(phi) and theta1 * sin(phi),
  // so we can actually use Pythagorean theorem to extract theta1 in a
  // different way.
  const theta1 = Math.hypot(initialConditions[1],initialConditions[3]);
  expect(theta1).toBeCloseTo(intermediateResults.theta1, 5);
  expect(theta1).toBeCloseTo(expectedTheta1Rad, 5);
});

