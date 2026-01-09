/* calc.js
   Pure calculation helpers so we can unit test the logic easily.
*/

function round2(n) {
  return Math.round(n * 100) / 100;
}

function toKm(distance, unit) {
  if (unit === "mi") return distance * 1.60934;
  return distance; // km
}

function parsePositiveNumber(raw, fieldName) {
  // Keep validation simple and readable (student-level)
  if (raw === "") {
    return { value: null, error: `Enter a number for ${fieldName}.` };
  }

  const n = Number(raw);
  if (isNaN(n)) {
    return { value: null, error: `Enter a number for ${fieldName}.` };
  }

  if (n <= 0) {
    return { value: null, error: `${fieldName} must be greater than 0.` };
  }

  return { value: n, error: "" };
}

function parsePassengers(raw) {
  if (raw === "") return { value: 1, error: "" }; // default to 1 if empty
  const n = Number(raw);

  if (isNaN(n) || !Number.isInteger(n)) {
    return { value: null, error: "Passengers must be a whole number." };
  }

  if (n < 1) return { value: null, error: "Passengers must be at least 1." };
  if (n > 9) return { value: null, error: "Passengers must be 9 or fewer (demo limit)." };

  return { value: n, error: "" };
}

function landFactor(factors, landMode, option) {
  const modeObj = factors.land[landMode];
  if (!modeObj) return null;
  return modeObj[option] || null;
}

function calculateLand(inputs, factors) {
  const f = landFactor(factors, inputs.landMode, inputs.option);
  if (!f) {
    return { ok: false, error: "Could not find a factor for the selected land option." };
  }

  const km = toKm(inputs.distance, inputs.unit);

  let totalKg;
  let perPassengerKg;

  if (f.basis === "vehicle") {
    totalKg = f.kgPerKm * km;
    perPassengerKg = totalKg / inputs.passengers;
  } else {
    // passenger basis
    perPassengerKg = f.kgPerKm * km;
    totalKg = perPassengerKg * inputs.passengers;
  }

  return {
    ok: true,
    label: f.label,
    km: round2(km),
    perPassengerKg: round2(perPassengerKg),
    totalKg: round2(totalKg)
  };
}

function airFactor(factors, haul, flightClass) {
  const haulObj = factors.air[haul];
  if (!haulObj) return null;
  return haulObj[flightClass] || null;
}

function calculateAir(inputs, factors) {
  const f = airFactor(factors, inputs.haul, inputs.flightClass);
  if (!f) {
    return { ok: false, error: "Could not find a factor for the selected flight option." };
  }

  const km = toKm(inputs.distance, inputs.unit);

  const perWithRF = f.withRF * km;
  const perWithoutRF = f.withoutRF * km;

  const totalWithRF = perWithRF * inputs.passengers;
  const totalWithoutRF = perWithoutRF * inputs.passengers;

  return {
    ok: true,
    label: f.label,
    km: round2(km),
    perPassengerWithRF: round2(perWithRF),
    perPassengerWithoutRF: round2(perWithoutRF),
    totalWithRF: round2(totalWithRF),
    totalWithoutRF: round2(totalWithoutRF)
  };
}

function calculate(inputs, factors) {
  if (inputs.mode === "air") return calculateAir(inputs, factors);
  return calculateLand(inputs, factors);
}

// Browser access
window.CarbonCalc = {
  round2,
  toKm,
  parsePositiveNumber,
  parsePassengers,
  calculateLand,
  calculateAir,
  calculate
};

// Jest/Node access
if (typeof module !== "undefined") {
  module.exports = {
    round2,
    toKm,
    parsePositiveNumber,
    parsePassengers,
    calculateLand,
    calculateAir,
    calculate
  };
}
