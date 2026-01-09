const CarbonCalc = require("../src/calc");
const Factors = require("../src/factors");

describe("CarbonCalc validation", () => {
  test("distance must be a number > 0", () => {
    expect(CarbonCalc.validateDistance(NaN).ok).toBe(false);
    expect(CarbonCalc.validateDistance(0).ok).toBe(false);
    expect(CarbonCalc.validateDistance(-10).ok).toBe(false);
    expect(CarbonCalc.validateDistance(0.01).ok).toBe(true);
  });

  test("passengers must be an integer >= 1", () => {
    expect(CarbonCalc.validatePassengers(0).ok).toBe(false);
    expect(CarbonCalc.validatePassengers(-1).ok).toBe(false);
    expect(CarbonCalc.validatePassengers(1.2).ok).toBe(false);
    expect(CarbonCalc.validatePassengers(1).ok).toBe(true);
    expect(CarbonCalc.validatePassengers(3).ok).toBe(true);
  });
});

describe("CarbonCalc distance conversion", () => {
  test("miles -> km uses 1.60934", () => {
    expect(CarbonCalc.toKm(10, "miles")).toBeCloseTo(16.0934, 6);
  });

  test("km stays as km", () => {
    expect(CarbonCalc.toKm(10, "km")).toBeCloseTo(10, 6);
  });

  test("invalid unit throws", () => {
    expect(() => CarbonCalc.toKm(10, "yards")).toThrow();
  });
});

describe("Land calculations", () => {
  test("car (diesel) uses vehicle-km and divides per passenger", () => {
    const input = {
      mode: "land",
      unit: "km",
      distance: 100,
      passengers: 2,
      landMode: "car",
      option: "diesel",
    };

    const out = CarbonCalc.calculate(input, Factors);

    // Factor from factors.js (diesel)
    expect(out.factor).toBeCloseTo(0.173, 6);

    // Total = 0.173 * 100 = 17.3
    expect(out.totalKg).toBeCloseTo(17.3, 6);

    // Per passenger = 17.3 / 2 = 8.65
    expect(out.perPassengerKg).toBeCloseTo(8.65, 6);

    expect(out.factorUnit).toBe("vehicle.km");
    expect(out.isCar).toBe(true);
  });

  test("rail (national_rail) uses passenger-km and multiplies by passengers", () => {
    const input = {
      mode: "land",
      unit: "km",
      distance: 100,
      passengers: 2,
      landMode: "rail",
      option: "national_rail",
    };

    const out = CarbonCalc.calculate(input, Factors);

    // Factor from factors.js (national rail)
    expect(out.factor).toBeCloseTo(0.03545, 6);

    // Per passenger = 0.03545 * 100 = 3.545
    expect(out.perPassengerKg).toBeCloseTo(3.545, 6);

    // Group total = 3.545 * 2 = 7.09
    expect(out.totalKg).toBeCloseTo(7.09, 6);

    expect(out.factorUnit).toBe("passenger.km");
    expect(out.isCar).toBe(false);
  });
});

describe("Air calculations", () => {
  test("air short-haul economy returns both With RF and Without RF totals", () => {
    const input = {
      mode: "air",
      unit: "km",
      distance: 1000,
      passengers: 2,
      haul: "short_haul_to_from_uk",
      flightClass: "economy",
    };

    const out = CarbonCalc.calculate(input, Factors);

    // factors from factors.js for short-haul economy
    expect(out.factorWithRF).toBeCloseTo(0.12576, 6);
    expect(out.factorWithoutRF).toBeCloseTo(0.07435, 6);

    // per passenger totals
    expect(out.perPassengerWithRFKg).toBeCloseTo(125.76, 6);
    expect(out.perPassengerWithoutRFKg).toBeCloseTo(74.35, 6);

    // group totals (x2 passengers)
    expect(out.totalWithRFKg).toBeCloseTo(251.52, 6);
    expect(out.totalWithoutRFKg).toBeCloseTo(148.7, 6);
  });
});
