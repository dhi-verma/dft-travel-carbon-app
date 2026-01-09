// script.js - Handle user interactions and display results

document.addEventListener('DOMContentLoaded', function() {
  
  // Get all form elements
  var modeSelect = document.getElementById('mode');
  var distanceInput = document.getElementById('distance');
  var unitSelect = document.getElementById('unit');
  var passengersInput = document.getElementById('passengers');
  
  var landOptions = document.getElementById('landOptions');
  var airOptions = document.getElementById('airOptions');
  
  var landTypeSelect = document.getElementById('landType');
  var carOptionGroup = document.getElementById('carOptionGroup');
  var busOptionGroup = document.getElementById('busOptionGroup');
  var railOptionGroup = document.getElementById('railOptionGroup');
  var taxiOptionGroup = document.getElementById('taxiOptionGroup');
  
  var carOptionSelect = document.getElementById('carOption');
  var busOptionSelect = document.getElementById('busOption');
  var railOptionSelect = document.getElementById('railOption');
  var taxiOptionSelect = document.getElementById('taxiOption');
  
  var haulSelect = document.getElementById('haul');
  var flightClassSelect = document.getElementById('flightClass');
  
  var form = document.getElementById('calcForm');
  var clearBtn = document.getElementById('clearBtn');
  
  var errorDiv = document.getElementById('error');
  var resultsDiv = document.getElementById('results');
  var comparisonBody = document.getElementById('comparisonBody');

  // Show/hide mode options
  function updateModeDisplay() {
    if (modeSelect.value === 'air') {
      landOptions.classList.add('hidden');
      airOptions.classList.remove('hidden');
    } else {
      landOptions.classList.remove('hidden');
      airOptions.classList.add('hidden');
    }
  }

  // Show/hide land type options
  function updateLandTypeDisplay() {
    var landType = landTypeSelect.value;
    
    carOptionGroup.classList.add('hidden');
    busOptionGroup.classList.add('hidden');
    railOptionGroup.classList.add('hidden');
    taxiOptionGroup.classList.add('hidden');
    
    if (landType === 'car') {
      carOptionGroup.classList.remove('hidden');
    } else if (landType === 'bus') {
      busOptionGroup.classList.remove('hidden');
    } else if (landType === 'rail') {
      railOptionGroup.classList.remove('hidden');
    } else if (landType === 'taxi') {
      taxiOptionGroup.classList.remove('hidden');
    }
  }

  // Display error message
  function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  }

  // Clear error message
  function clearError() {
    errorDiv.textContent = '';
    errorDiv.style.display = 'none';
  }

  // Validate inputs
  function validateInputs() {
    var distance = parseFloat(distanceInput.value);
    var passengers = parseInt(passengersInput.value);

    if (isNaN(distance) || distance <= 0) {
      return { valid: false, error: 'Please enter a valid distance greater than 0' };
    }

    if (isNaN(passengers) || passengers < 1) {
      return { valid: false, error: 'Please enter at least 1 passenger' };
    }

    if (passengers > 10) {
      return { valid: false, error: 'Maximum 10 passengers for this demo' };
    }

    return { valid: true };
  }

  // Get current land option
  function getLandOption() {
    var landType = landTypeSelect.value;
    
    if (landType === 'car') return carOptionSelect.value;
    if (landType === 'bus') return busOptionSelect.value;
    if (landType === 'rail') return railOptionSelect.value;
    if (landType === 'taxi') return taxiOptionSelect.value;
    
    return 'petrol'; // default
  }

  // Display land travel results
  function displayLandResults(result) {
    var html = '<div class="result-box">';
    html += '<h3>' + result.label + '</h3>';
    html += '<div class="result-row">';
    html += '<div class="result-item">';
    html += '<span class="result-label">Distance:</span>';
    html += '<span class="result-value">' + result.distanceKm + ' km</span>';
    html += '</div>';
    html += '<div class="result-item">';
    html += '<span class="result-label">Per Person:</span>';
    html += '<span class="result-value">' + result.perPerson + ' kg CO₂</span>';
    html += '</div>';
    html += '<div class="result-item">';
    html += '<span class="result-label">Total:</span>';
    html += '<span class="result-value">' + result.total + ' kg CO₂</span>';
    html += '</div>';
    html += '</div>';
    html += '<p class="info-text">Basis: ' + result.basis + '</p>';
    html += '</div>';
    
    resultsDiv.innerHTML = html;
  }

  // Display air travel results
  function displayAirResults(result) {
    var html = '<div class="result-box">';
    html += '<h3>' + result.label + '</h3>';
    html += '<p class="info-text">RF = Radiative Forcing (atmospheric effects)</p>';
    html += '<div class="result-row">';
    html += '<div class="result-item">';
    html += '<span class="result-label">Distance:</span>';
    html += '<span class="result-value">' + result.distanceKm + ' km</span>';
    html += '</div>';
    html += '<div class="result-item">';
    html += '<span class="result-label">Per Person (with RF):</span>';
    html += '<span class="result-value">' + result.perPersonWithRF + ' kg CO₂</span>';
    html += '</div>';
    html += '<div class="result-item">';
    html += '<span class="result-label">Per Person (without RF):</span>';
    html += '<span class="result-value">' + result.perPersonWithoutRF + ' kg CO₂</span>';
    html += '</div>';
    html += '</div>';
    html += '<div class="result-row">';
    html += '<div class="result-item">';
    html += '<span class="result-label">Total (with RF):</span>';
    html += '<span class="result-value">' + result.totalWithRF + ' kg CO₂</span>';
    html += '</div>';
    html += '<div class="result-item">';
    html += '<span class="result-label">Total (without RF):</span>';
    html += '<span class="result-value">' + result.totalWithoutRF + ' kg CO₂</span>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    
    resultsDiv.innerHTML = html;
  }

  // Generate comparison for land travel
  function generateLandComparison() {
    var distance = parseFloat(distanceInput.value);
    var unit = unitSelect.value;
    var passengers = parseInt(passengersInput.value);

    comparisonBody.innerHTML = '';

    // Compare common options
    var comparisons = [
      { type: 'car', option: 'petrol' },
      { type: 'bus', option: 'local' },
      { type: 'rail', option: 'national' },
      { type: 'taxi', option: 'regular' }
    ];

    for (var i = 0; i < comparisons.length; i++) {
      var comp = comparisons[i];
      var result = CarbonCalc.calculateLandEmissions(distance, unit, comp.type, comp.option, passengers);
      
      if (result.success) {
        var row = document.createElement('tr');
        row.innerHTML = '<td>' + result.label + '</td>' +
                       '<td>' + result.perPerson + ' kg</td>' +
                       '<td>' + result.total + ' kg</td>';
        comparisonBody.appendChild(row);
      }
    }
  }

  // Generate comparison for air travel
  function generateAirComparison() {
    var distance = parseFloat(distanceInput.value);
    var unit = unitSelect.value;
    var passengers = parseInt(passengersInput.value);
    var haul = haulSelect.value;

    comparisonBody.innerHTML = '';

    // Compare all classes for selected haul
    var classes = ['economy', 'premium', 'business', 'first'];

    for (var i = 0; i < classes.length; i++) {
      var flightClass = classes[i];
      var result = CarbonCalc.calculateAirEmissions(distance, unit, haul, flightClass, passengers);
      
      if (result.success) {
        var row = document.createElement('tr');
        row.innerHTML = '<td>' + result.label + '</td>' +
                       '<td>' + result.perPersonWithRF + ' kg (with RF)</td>' +
                       '<td>' + result.totalWithRF + ' kg (with RF)</td>';
        comparisonBody.appendChild(row);
      }
    }
  }

  // Handle form submission
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    clearError();

    // Validate inputs
    var validation = validateInputs();
    if (!validation.valid) {
      showError(validation.error);
      return;
    }

    var distance = parseFloat(distanceInput.value);
    var unit = unitSelect.value;
    var passengers = parseInt(passengersInput.value);
    var mode = modeSelect.value;

    var result;

    if (mode === 'land') {
      var landType = landTypeSelect.value;
      var option = getLandOption();
      
      result = CarbonCalc.calculateLandEmissions(distance, unit, landType, option, passengers);
      
      if (result.success) {
        displayLandResults(result);
        generateLandComparison();
      } else {
        showError(result.error);
      }
    } else {
      // Air mode
      var haul = haulSelect.value;
      var flightClass = flightClassSelect.value;
      
      result = CarbonCalc.calculateAirEmissions(distance, unit, haul, flightClass, passengers);
      
      if (result.success) {
        displayAirResults(result);
        generateAirComparison();
      } else {
        showError(result.error);
      }
    }
  });

  // Clear button
  clearBtn.addEventListener('click', function() {
    distanceInput.value = '';
    passengersInput.value = '1';
    clearError();
    resultsDiv.innerHTML = '<p class="placeholder">Enter values above and click Calculate</p>';
    comparisonBody.innerHTML = '<tr><td colspan="3" class="placeholder">Results will appear here</td></tr>';
  });

  // Update display when mode changes
  modeSelect.addEventListener('change', function() {
    updateModeDisplay();
    clearError();
  });

  // Update display when land type changes
  landTypeSelect.addEventListener('change', function() {
    updateLandTypeDisplay();
    clearError();
  });

  // Initialize displays
  updateModeDisplay();
  updateLandTypeDisplay();
  
  console.log('Carbon calculator loaded successfully');
});
