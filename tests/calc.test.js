// calc.test.js - Simple tests for carbon calculator

const CarbonCalc = require('../src/calc.js');
const CarbonFactors = require('../src/factors.js');

describe('Carbon Calculator Tests', () => {
  
  test('converts miles to kilometers correctly', () => {
    var result = CarbonCalc.milesToKm(10);
    expect(result).toBeCloseTo(16.09, 2);
  });

  test('rounds to two decimal places', () => {
    expect(CarbonCalc.roundToTwo(12.345)).toBe(12.35);
    expect(CarbonCalc.roundToTwo(12.344)).toBe(12.34);
  });

  test('calculates car emissions correctly', () => {
    var result = CarbonCalc.calculateLandEmissions(100, 'km', 'car', 'petrol', 1);
    
    expect(result.success).toBe(true);
    expect(result.total).toBeCloseTo(17, 1);
  });

  test('calculates car emissions with multiple passengers', () => {
    var result = CarbonCalc.calculateLandEmissions(100, 'km', 'car', 'diesel', 2);
    
    expect(result.success).toBe(true);
    expect(result.total).toBeCloseTo(17, 1);
    expect(result.perPerson).toBeCloseTo(8.5, 1);
  });

  test('calculates bus emissions correctly', () => {
    var result = CarbonCalc.calculateLandEmissions(100, 'km', 'bus', 'local', 2);
    
    expect(result.success).toBe(true);
    expect(result.perPerson).toBeCloseTo(10, 1);
    expect(result.total).toBeCloseTo(20, 1);
  });

  test('calculates rail emissions correctly', () => {
    var result = CarbonCalc.calculateLandEmissions(50, 'km', 'rail', 'national', 1);
    
    expect(result.success).toBe(true);
    expect(result.perPerson).toBeCloseTo(2, 1);
  });

  test('calculates flight emissions with RF', () => {
    var result = CarbonCalc.calculateAirEmissions(1000, 'km', 'short', 'economy', 1);
    
    expect(result.success).toBe(true);
    expect(result.perPersonWithRF).toBeCloseTo(130, 10);
    expect(result.perPersonWithoutRF).toBeCloseTo(70, 10);
  });

  test('handles miles input for flights', () => {
    var result = CarbonCalc.calculateAirEmissions(100, 'miles', 'short', 'economy', 1);
    
    expect(result.success).toBe(true);
    expect(result.distanceKm).toBeCloseTo(160.93, 2);
  });

  test('calculates flight emissions for multiple passengers', () => {
    var result = CarbonCalc.calculateAirEmissions(1000, 'km', 'long', 'business', 3);
    
    expect(result.success).toBe(true);
    expect(result.totalWithRF).toBeCloseTo(result.perPersonWithRF * 3, 2);
  });
});
