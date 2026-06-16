import { solveHungarian } from './src/utils/solver';

/**
 * Math correctness validation test for the Hungarian (Kuhn-Munkres) Algorithm.
 * Asserts the exact values of the reference slide decks.
 */
function runTests() {
  console.log('🧪 Starting mathematical correctness tests for Hungarian Solver...');

  // Preset 1: Reference Cost Matrix from the Presentation Slide Deck
  const costMatrix = [
    [14, 6, 18, 16, 63, 15],
    [41, 78, 44, 73, 70, 25],
    [44, 81, 36, 80, 80, 78],
    [46, 74, 5, 25, 83, 3],
    [72, 32, 55, 51, 3, 81],
    [69, 76, 12, 99, 83, 80]
  ];

  console.log('\n- Test 1: Minimization cost matching slide deck (Goal optimal value: 115)...');
  const stepsMin = solveHungarian(costMatrix, 'min');
  const finalMinStep = stepsMin[stepsMin.length - 1];

  if (!finalMinStep.isOptimal) {
    console.error('❌ Test 1 Failed: Solver did not reach an optimal solution state.');
    process.exit(1);
  }

  const optimalValueMin = finalMinStep.optimalValue;
  console.log(`  Computed optimal cost value: ${optimalValueMin}`);
  if (optimalValueMin !== 115) {
    console.error(`❌ Test 1 Failed: Value is ${optimalValueMin}, expected 115.`);
    process.exit(1);
  }
  console.log('✅ Test 1 Passed: Exact cost value matches slide deck (115) perfectly!');

  // Preset 2: Reference Profit Matrix from Slide 207
  const profitMatrix = [
    [86, 94, 82, 84, 37, 85],
    [59, 22, 56, 27, 30, 75],
    [56, 19, 64, 20, 20, 22],
    [54, 26, 95, 75, 17, 97],
    [28, 68, 45, 49, 97, 19],
    [31, 24, 88, 1, 17, 20]
  ];

  console.log('\n- Test 2: Maximization profit matching Slide 207 (Goal optimal value: 485)...');
  const stepsMax = solveHungarian(profitMatrix, 'max');
  const finalMaxStep = stepsMax[stepsMax.length - 1];

  if (!finalMaxStep.isOptimal) {
    console.error('❌ Test 2 Failed: Solver did not reach an optimal state for Maximization.');
    process.exit(1);
  }

  const optimalValueMax = finalMaxStep.optimalValue;
  console.log(`  Computed optimal profit value: ${optimalValueMax}`);
  if (optimalValueMax !== 485) {
    console.error(`❌ Test 2 Failed: Value is ${optimalValueMax}, expected 485.`);
    process.exit(1);
  }
  console.log('✅ Test 2 Passed: Exact profit value matches Slide 207 (485) perfectly!');

  console.log('\n🎉 ALL MATHEMATICAL TESTS PASSED SUCCESSFULLY! The Kuhn-Munkres engine is 100% compliant with the theoretical slide deck.');
}

runTests();
