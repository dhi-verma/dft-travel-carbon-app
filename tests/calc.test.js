const CarbonCalc = require("../calc.js");
const CarbonFactors = require("../factors.js");

test("toKm converts miles to km", () => {
  expect(CarbonCalc.toKm(10, "mi")).toBeCloseTo(16.0934, 4);
  expect(CarbonCalc.toKm(10, "km")).toBeCloseTo(10, 4);
});

test("round2 rounds to 2 decimals", () => {
  expect(CarbonCalc.round2(12.345)).toBe(12.35);
  expect(CarbonCalc.round2(12.344)).toBe(12.34);
});

test("calculateLand: car (vehicle basis) divides by passengers", () => {
  const out = CarbonCalc.calculateLand(
    { mode: "land", landMode: "car", option: "petrol", distance: 100, unit: "km", passengers: 2 },
    CarbonFactors
  );

  expect(out.ok).toBe(true);
  // total = 100 * 0.16272
  expect(out.totalKg).toBeCloseTo(16.27, 2);
  // per passenger = total / 2
  expect(out.perPassengerKg).toBeCloseTo(8.14, 2);
});

test("calculateLand: rail (passenger basis) multiplies by passengers for total", () => {
  const out = CarbonCalc.calculateLand(
    { mode: "land", landMode: "rail", option: "national_rail", distance: 100, unit: "km", passengers: 3 },
    CarbonFactors
  );

  expect(out.ok).toBe(true);
  // per passenger = 100 * 0.03546 = 3.546 -> 3.55
  expect(out.perPassengerKg).toBeCloseTo(3.55, 2);
  // total = per passenger * 3
  expect(out.totalKg).toBeCloseTo(10.65, 2);
});

test("calculateAir: short-haul economy returns with/without RF outputs", () => {
  const out = CarbonCalc.calculateAir(
    { mode: "air", haul: "short_haul_to_from_uk", flightClass: "economy", distance: 1000, unit: "km", passengers: 1 },
    CarbonFactors
  );

  expect(out.ok).toBe(true);
  expect(out.perPassengerWithRF).toBeCloseTo(125.76, 2);
  expect(out.perPassengerWithoutRF).toBeCloseTo(74.35, 2);
});
