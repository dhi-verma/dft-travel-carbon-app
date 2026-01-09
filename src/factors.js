/* factors.js
  A small subset of travel emission factors (kg CO2 per km).

  Note: factors_2025.json is kept as "source evidence", but this file is the simplified
  in-app structure that matches the dropdown values and calc.js fields.
*/

const CarbonFactors = {
  meta: {
    year: 2025,
    note: "Simplified factors for coursework demo (subset of UK travel factors)."
  },

  land: {
    car: {
      petrol: { label: "Car (petrol)", kgPerKm: 0.16272, basis: "vehicle" },
      diesel: { label: "Car (diesel)", kgPerKm: 0.17000, basis: "vehicle" },
      ev: { label: "Car (EV)", kgPerKm: 0.06000, basis: "vehicle" }
    },

    bus: {
      local_bus: { label: "Local bus", kgPerKm: 0.10200, basis: "passenger" },
      coach: { label: "Coach", kgPerKm: 0.02700, basis: "passenger" }
    },

    rail: {
      national_rail: { label: "National Rail", kgPerKm: 0.03546, basis: "passenger" },
      tram_metro: { label: "Tram / Metro", kgPerKm: 0.02800, basis: "passenger" }
    },

    taxi: {
      average_taxi: { label: "Taxi (average)", kgPerKm: 0.18000, basis: "vehicle" }
    }
  },

  air: {
    short_haul_to_from_uk: {
      economy: { label: "Short-haul (Economy)", withRF: 0.12576, withoutRF: 0.07435 },
      premium_economy: { label: "Short-haul (Premium economy)", withRF: 0.15000, withoutRF: 0.09000 },
      business: { label: "Short-haul (Business)", withRF: 0.20000, withoutRF: 0.12000 },
      first: { label: "Short-haul (First)", withRF: 0.23000, withoutRF: 0.14000 }
    },

    medium_haul: {
      economy: { label: "Medium-haul (Economy)", withRF: 0.15000, withoutRF: 0.09000 },
      premium_economy: { label: "Medium-haul (Premium economy)", withRF: 0.18000, withoutRF: 0.11000 },
      business: { label: "Medium-haul (Business)", withRF: 0.24000, withoutRF: 0.14500 },
      first: { label: "Medium-haul (First)", withRF: 0.27000, withoutRF: 0.16000 }
    },

    long_haul: {
      economy: { label: "Long-haul (Economy)", withRF: 0.17000, withoutRF: 0.10200 },
      premium_economy: { label: "Long-haul (Premium economy)", withRF: 0.21000, withoutRF: 0.12500 },
      business: { label: "Long-haul (Business)", withRF: 0.29000, withoutRF: 0.17500 },
      first: { label: "Long-haul (First)", withRF: 0.33000, withoutRF: 0.20000 }
    }
  }
};

// Browser export (guarded)
if (typeof window !== "undefined") {
  window.CarbonFactors = CarbonFactors;
}

// Jest/Node export
if (typeof module !== "undefined") {
  module.exports = CarbonFactors;
}
