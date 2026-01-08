const CarbonCalc = require("../src/calc");
const CarbonFactors = require("../src/factors");

describe("validation", () => {
  test("distance must be > 0", () => {
    expect(CarbonCalc.validateDistance(0).ok).toBe(false);
    expect(CarbonCalc.validateDistance(-1).ok).toBe(false);
    expect(CarbonCalc.validateDistance(1).ok).toBe(true);
  });

  test("passengers must be integer >= 1", () => {
    expect(CarbonCalc.validatePassengers(0).ok).toBe(false);
    expect(CarbonCalc.validatePassengers(1.2).ok).toBe(false);
    expect(CarbonCalc.validatePassengers(1).ok).toBe(true);
  });
});

describe("unit conversion", () => {
  test("miles -> km", () => {
    expect(CarbonCalc.toKm(1, "miles")).toBeCloseTo(1.60934);
  });
  test("km unchanged", () => {
    expect(CarbonCalc.toKm(10, "km")).toBeCloseTo(10);
  });
});

describe("land calculations", () => {
  test("car diesel: 100 km, 1 passenger", () => {
    const out = CarbonCalc.calculate(
      { mode: "land", unit: "km", distance: 100, passengers: 1, landMode: "car", option: "diesel" },
      CarbonFactors
    );
    expect(out.totalKg).toBeCloseTo(17.30, 2);
    expect(out.perPassengerKg).toBeCloseTo(17.30, 2);
    expect(out.factorUnit).toBe("vehicle.km");
  });

  test("rail national: 100 km, 2 passengers", () => {
    const out = CarbonCalc.calculate(
      { mode: "land", unit: "km", distance: 100, passengers: 2, landMode: "rail", option: "national_rail" },
      CarbonFactors
    );
    expect(out.perPassengerKg).toBeCloseTo(3.55, 2);
    expect(out.totalKg).toBeCloseTo(7.09, 2);
    expect(out.factorUnit).toBe("passenger.km");
  });
});

describe("air calculations", () => {
  test("short-haul economy: 1000 km, 1 passenger", () => {
    const out = CarbonCalc.calculate(
      { mode: "air", unit: "km", distance: 1000, passengers: 1, haul: "short_haul_to_from_uk", flightClass: "economy" },
      CarbonFactors
    );
    expect(out.totalWithRFKg).toBeCloseTo(125.76, 2);
    expect(out.totalWithoutRFKg).toBeCloseTo(74.35, 2);
  });
});
