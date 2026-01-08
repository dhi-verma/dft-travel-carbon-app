(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.CarbonCalc = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  function round(n, dp) {
    const m = Math.pow(10, dp);
    return Math.round((n + Number.EPSILON) * m) / m;
  }

  function toKm(distance, unit) {
    if (unit === "km") return distance;
    return distance * 1.60934;
  }

  function validateDistance(distance) {
    if (distance === null || distance === undefined || Number.isNaN(distance)) {
      return { ok: false, message: "Enter a number for distance." };
    }
    if (!Number.isFinite(distance)) return { ok: false, message: "Distance must be a finite number." };
    if (distance <= 0) return { ok: false, message: "Distance must be greater than 0." };
    if (distance > 100000) return { ok: false, message: "Distance is unrealistically large. Please double-check." };
    return { ok: true, message: "" };
  }

  function validatePassengers(passengers) {
    if (passengers === null || passengers === undefined || Number.isNaN(passengers)) {
      return { ok: false, message: "Enter a number for passengers." };
    }
    if (!Number.isFinite(passengers)) return { ok: false, message: "Passengers must be a finite number." };
    if (!Number.isInteger(passengers)) return { ok: false, message: "Passengers must be a whole number." };
    if (passengers < 1) return { ok: false, message: "Passengers must be at least 1." };
    if (passengers > 1000) return { ok: false, message: "Passengers is unrealistically large. Please double-check." };
    return { ok: true, message: "" };
  }

  function format(n) {
    return Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });
  }

  function landFactor(factors, landMode, optionKey) {
    if (landMode === "car") return factors.land.car[optionKey];
    if (landMode === "taxi") return factors.land.taxis[optionKey];
    if (landMode === "bus") return factors.land.bus[optionKey];
    if (landMode === "rail") return factors.land.rail[optionKey];
    throw new Error("Unknown land mode.");
  }

  function calculateLand(input, factors) {
    const distanceKm = toKm(input.distance, input.unit);
    const pax = input.passengers;

    const factorRec = landFactor(factors, input.landMode, input.option);
    const factor = factorRec.kgco2e_per_unit;
    const factorUnit = factorRec.unit;

    const isCar = input.landMode === "car";

    let totalKg;
    let perPassengerKg;

    if (isCar) {
      totalKg = distanceKm * factor;
      perPassengerKg = totalKg / pax;
    } else {
      perPassengerKg = distanceKm * factor;
      totalKg = perPassengerKg * pax;
    }

    return {
      distanceKm: round(distanceKm, 2),
      factor: round(factor, 5),
      factorUnit,
      isCar,
      totalKg: round(totalKg, 2),
      perPassengerKg: round(perPassengerKg, 2),
    };
  }

  function flightFactor(factors, haul, flightClass) {
    const rec = factors.air[haul];
    if (!rec) throw new Error("Unknown haul.");
    const cls = rec[flightClass];
    if (!cls) throw new Error("Unknown flight class for selected haul.");
    return cls;
  }

  function calculateAir(input, factors) {
    const distanceKm = toKm(input.distance, input.unit);
    const pax = input.passengers;

    const rec = flightFactor(factors, input.haul, input.flightClass);

    const factorWithRF = rec.with_rf;
    const factorWithoutRF = rec.without_rf;

    const perPassengerWithRF = distanceKm * factorWithRF;
    const perPassengerWithoutRF = distanceKm * factorWithoutRF;

    const totalWithRFKg = perPassengerWithRF * pax;
    const totalWithoutRFKg = perPassengerWithoutRF * pax;

    return {
      distanceKm: round(distanceKm, 2),
      factorWithRF: round(factorWithRF, 5),
      factorWithoutRF: round(factorWithoutRF, 5),
      perPassengerWithRF: round(perPassengerWithRF, 2),
      perPassengerWithoutRF: round(perPassengerWithoutRF, 2),
      totalWithRFKg: round(totalWithRFKg, 2),
      totalWithoutRFKg: round(totalWithoutRFKg, 2),
    };
  }

  function calculate(input, factors) {
    if (input.mode === "land") return calculateLand(input, factors);
    if (input.mode === "air") return calculateAir(input, factors);
    throw new Error("Unknown mode.");
  }

  return {
    round,
    toKm,
    validateDistance,
    validatePassengers,
    calculate,
    format,
  };
});
