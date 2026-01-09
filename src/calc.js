// calc.js - Calculation functions for carbon emissions

// Emission factors (kg CO2 per km)
// Data simplified from UK Government conversion factors for student project
const EMISSION_FACTORS = {
  land: {
    car: {
      petrol: { factor: 0.17, basis: 'vehicle', label: 'Car (Petrol)' },
      diesel: { factor: 0.17, basis: 'vehicle', label: 'Car (Diesel)' },
      ev: { factor: 0.06, basis: 'vehicle', label: 'Car (Electric)' }
    },
    bus: {
      local: { factor: 0.10, basis: 'passenger', label: 'Local Bus' },
      coach: { factor: 0.03, basis: 'passenger', label: 'Coach' }
    },
    rail: {
      national: { factor: 0.04, basis: 'passenger', label: 'National Rail' },
      metro: { factor: 0.03, basis: 'passenger', label: 'Metro/Tram' }
    },
    taxi: {
      regular: { factor: 0.18, basis: 'vehicle', label: 'Taxi' }
    }
  },
  air: {
    short: {
      economy: { withRF: 0.13, withoutRF: 0.07, label: 'Short-haul Economy' },
      premium: { withRF: 0.15, withoutRF: 0.09, label: 'Short-haul Premium' },
      business: { withRF: 0.20, withoutRF: 0.12, label: 'Short-haul Business' },
      first: { withRF: 0.23, withoutRF: 0.14, label: 'Short-haul First' }
    },
    medium: {
      economy: { withRF: 0.15, withoutRF: 0.09, label: 'Medium-haul Economy' },
      premium: { withRF: 0.18, withoutRF: 0.11, label: 'Medium-haul Premium' },
      business: { withRF: 0.24, withoutRF: 0.15, label: 'Medium-haul Business' },
      first: { withRF: 0.27, withoutRF: 0.16, label: 'Medium-haul First' }
    },
    long: {
      economy: { withRF: 0.17, withoutRF: 0.10, label: 'Long-haul Economy' },
      premium: { withRF: 0.21, withoutRF: 0.13, label: 'Long-haul Premium' },
      business: { withRF: 0.29, withoutRF: 0.18, label: 'Long-haul Business' },
      first: { withRF: 0.33, withoutRF: 0.20, label: 'Long-haul First' }
    }
  }
};

// Simple rounding function (like temperature converter formative)
function roundToTwo(num) {
  return Math.round(num * 100) / 100;
}

// Convert miles to kilometers
function milesToKm(miles) {
  return miles * 1.60934;
}

// Calculate land-based travel emissions
function calculateLandEmissions(distance, unit, landType, option, passengers) {
  // Convert to km if needed
  var distanceKm = distance;
  if (unit === 'miles') {
    distanceKm = milesToKm(distance);
  }

  // Get the emission factor
  var factorData = EMISSION_FACTORS.land[landType][option];
  if (!factorData) {
    return { error: 'Invalid land type or option selected' };
  }

  var factor = factorData.factor;
  var basis = factorData.basis;
  var label = factorData.label;

  var totalEmissions;
  var perPersonEmissions;

  // Calculate based on vehicle or passenger basis
  if (basis === 'vehicle') {
    // For cars/taxis: factor is per vehicle
    totalEmissions = factor * distanceKm;
    perPersonEmissions = totalEmissions / passengers;
  } else {
    // For bus/rail: factor is per passenger
    perPersonEmissions = factor * distanceKm;
    totalEmissions = perPersonEmissions * passengers;
  }

  return {
    success: true,
    label: label,
    distanceKm: roundToTwo(distanceKm),
    perPerson: roundToTwo(perPersonEmissions),
    total: roundToTwo(totalEmissions),
    basis: basis
  };
}

// Calculate air travel emissions
function calculateAirEmissions(distance, unit, haul, flightClass, passengers) {
  // Convert to km if needed
  var distanceKm = distance;
  if (unit === 'miles') {
    distanceKm = milesToKm(distance);
  }

  // Get the emission factor
  var factorData = EMISSION_FACTORS.air[haul][flightClass];
  if (!factorData) {
    return { error: 'Invalid flight type or class selected' };
  }

  var label = factorData.label;
  var factorWithRF = factorData.withRF;
  var factorWithoutRF = factorData.withoutRF;

  // Calculate per person
  var perPersonWithRF = factorWithRF * distanceKm;
  var perPersonWithoutRF = factorWithoutRF * distanceKm;

  // Calculate total
  var totalWithRF = perPersonWithRF * passengers;
  var totalWithoutRF = perPersonWithoutRF * passengers;

  return {
    success: true,
    label: label,
    distanceKm: roundToTwo(distanceKm),
    perPersonWithRF: roundToTwo(perPersonWithRF),
    perPersonWithoutRF: roundToTwo(perPersonWithoutRF),
    totalWithRF: roundToTwo(totalWithRF),
    totalWithoutRF: roundToTwo(totalWithoutRF)
  };
}

// Make available globally for browser
window.CarbonCalc = {
  EMISSION_FACTORS: EMISSION_FACTORS,
  calculateLandEmissions: calculateLandEmissions,
  calculateAirEmissions: calculateAirEmissions,
  roundToTwo: roundToTwo,
  milesToKm: milesToKm
};

// Export for testing (Node/Jest)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    EMISSION_FACTORS: EMISSION_FACTORS,
    calculateLandEmissions: calculateLandEmissions,
    calculateAirEmissions: calculateAirEmissions,
    roundToTwo: roundToTwo,
    milesToKm: milesToKm
  };
}
