/* global CarbonCalc, CarbonFactors */
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);

  const form = $("trip-form");
  const errorBox = $("error");
  const result = $("result");
  const resultInner = $("resultInner");

  const mode = $("mode");
  const passengers = $("passengers");
  const distance = $("distance");
  const unit = $("unit");

  const landOptions = $("land-options");
  const airOptions = $("air-options");

  const landMode = $("landMode");
  const carType = $("carType");
  const taxiType = $("taxiType");
  const busType = $("busType");
  const railType = $("railType");

  const haul = $("haul");
  const flightClass = $("flightClass");

  const addToCompareBtn = $("addToCompare");
  const clearCompareBtn = $("clearCompare");
  const compareTableBody = $("compareTableBody");

  const factors = window.CarbonFactors;

  const state = {
    lastCalc: null,
    compare: [],
  };

  const LABELS = {
    car: {
      petrol: "Petrol",
      diesel: "Diesel",
      hybrid: "Hybrid",
      plug_in_hybrid: "Plug-in hybrid",
      electric: "Electric",
    },
    taxi: {
      regular_taxi: "Regular taxi",
      black_cab: "Black cab",
    },
    bus: {
      average_local: "Average local bus",
      london: "Local London bus",
      coach: "Coach",
    },
    rail: {
      national_rail: "National Rail",
      underground: "London Underground",
      light_rail_tram: "Light rail / tram",
      international_rail: "International rail",
    },
    haul: {
      domestic_to_from_uk: "Domestic (to/from UK)",
      short_haul_to_from_uk: "Short-haul (to/from UK)",
      long_haul_to_from_uk: "Long-haul (to/from UK)",
      international_non_uk: "International (to/from non-UK)",
    },
    flightClass: {
      average: "Average passenger",
      economy: "Economy",
      premium_economy: "Premium economy",
      business: "Business",
      first: "First",
    },
  };

  const UNIT_LABELS = {
    "vehicle.km": "vehicle-km",
    "passenger.km": "passenger-km",
  };

  function setError(msg) {
    errorBox.textContent = msg || "";
    errorBox.hidden = !msg;
  }

  function showResult(html) {
    resultInner.innerHTML = html;
    result.hidden = false;
  }

  function hideResult() {
    result.hidden = true;
    resultInner.innerHTML = "";
  }

  function toggleModePanels() {
    const isLand = mode.value === "land";
    landOptions.hidden = !isLand;
    airOptions.hidden = isLand;
  }

  function fillSelect(selectEl, optionsObj, labelsObj) {
    selectEl.innerHTML = "";
    Object.keys(optionsObj).forEach((k) => {
      const opt = document.createElement("option");
      opt.value = k;
      opt.textContent = labelsObj[k] || k;
      selectEl.appendChild(opt);
    });
  }

  function populateLandSelects() {
    fillSelect(carType, factors.land.car, LABELS.car);
    fillSelect(taxiType, factors.land.taxis, LABELS.taxi);
    fillSelect(busType, factors.land.bus, LABELS.bus);
    fillSelect(railType, factors.land.rail, LABELS.rail);
  }

  function populateFlightClasses() {
    const rec = factors.air[haul.value];
    const keys = Object.keys(rec);

    flightClass.innerHTML = "";
    keys.forEach((k) => {
      const opt = document.createElement("option");
      opt.value = k;
      opt.textContent = LABELS.flightClass[k] || k;
      flightClass.appendChild(opt);
    });

    if (keys.includes("economy")) flightClass.value = "economy";
    else flightClass.value = keys[0];
  }

  function currentSelection() {
    if (mode.value === "land") {
      const lm = landMode.value;
      if (lm === "car") return { mode: "land", landMode: "car", option: carType.value };
      if (lm === "taxi") return { mode: "land", landMode: "taxi", option: taxiType.value };
      if (lm === "bus") return { mode: "land", landMode: "bus", option: busType.value };
      if (lm === "rail") return { mode: "land", landMode: "rail", option: railType.value };
    }

    return { mode: "air", haul: haul.value, flightClass: flightClass.value };
  }

  function getInputs() {
    const dist = Number(distance.value);
    const pax = Number(passengers.value);

    const distCheck = CarbonCalc.validateDistance(dist);
    if (!distCheck.ok) return { ok: false, message: distCheck.message };

    const paxCheck = CarbonCalc.validatePassengers(pax);
    if (!paxCheck.ok) return { ok: false, message: paxCheck.message };

    const sel = currentSelection();

    if (sel.mode === "land") {
      return {
        ok: true,
        input: {
          mode: "land",
          unit: unit.value,
          distance: dist,
          passengers: pax,
          landMode: sel.landMode,
          option: sel.option,
        },
      };
    }

    return {
      ok: true,
      input: {
        mode: "air",
        unit: unit.value,
        distance: dist,
        passengers: pax,
        haul: sel.haul,
        flightClass: sel.flightClass,
      },
    };
  }

  function makeTripLabel(input, out) {
    const p = Number(input.passengers);
    const distLabel = `${CarbonCalc.format(out.distanceKm)} km`;

    if (input.mode === "land") {
      const lm = input.landMode;
      if (lm === "car") return `Land • Car (${LABELS.car[input.option]}) • ${distLabel} • ${p} passenger(s)`;
      if (lm === "taxi") return `Land • Taxi (${LABELS.taxi[input.option]}) • ${distLabel} • ${p} passenger(s)`;
      if (lm === "bus") return `Land • Bus (${LABELS.bus[input.option]}) • ${distLabel} • ${p} passenger(s)`;
      if (lm === "rail") return `Land • Rail (${LABELS.rail[input.option]}) • ${distLabel} • ${p} passenger(s)`;
      return `Land • ${distLabel}`;
    }

    return `Air • ${LABELS.haul[input.haul]} • ${LABELS.flightClass[input.flightClass]} • ${distLabel} • ${p} passenger(s)`;
  }

  function renderOutput(input, out) {
    if (input.mode === "land") {
      const unitLabel = UNIT_LABELS[out.factorUnit] || out.factorUnit;
      const factorLine = `Factor used: <strong>${out.factor}</strong> kgCO₂e per <strong>${unitLabel}</strong>`;

      const notes = out.isCar
        ? `<li>Car factors are per <strong>vehicle-km</strong>. Per-passenger is estimated by dividing by passenger count.</li>
           <li>This assumes one shared car for the group.</li>`
        : `<li>${input.landMode} factors are per <strong>passenger-km</strong>. Group totals multiply by passenger count.</li>`;

      showResult(`
        <p><strong>Distance:</strong> ${CarbonCalc.format(out.distanceKm)} km</p>
        <p>${factorLine}</p>
        <p><strong>Total emissions:</strong> ${CarbonCalc.format(out.totalKg)} kgCO₂e</p>
        <p><strong>Per passenger:</strong> ${CarbonCalc.format(out.perPassengerKg)} kgCO₂e</p>
        <ul class="muted small">${notes}</ul>
      `);
      return;
    }

    showResult(`
      <p><strong>Distance:</strong> ${CarbonCalc.format(out.distanceKm)} km</p>
      <p><strong>Factors used (kgCO₂e per passenger-km):</strong></p>
      <ul class="muted">
        <li>With RF: <strong>${out.factorWithRF}</strong></li>
        <li>Without RF: <strong>${out.factorWithoutRF}</strong></li>
      </ul>
      <p><strong>Total emissions (group):</strong></p>
      <ul>
        <li>With RF: <strong>${CarbonCalc.format(out.totalWithRFKg)} kgCO₂e</strong></li>
        <li>Without RF: <strong>${CarbonCalc.format(out.totalWithoutRFKg)} kgCO₂e</strong></li>
      </ul>
      <p class="muted small">
        RF (radiative forcing) reflects non-CO₂ impacts. This MVP shows both totals.
        The comparison table uses the <strong>With RF</strong> total.
      </p>
    `);
  }

  function rebuildCompareTable() {
    compareTableBody.innerHTML = "";

    if (state.compare.length === 0) {
      compareTableBody.innerHTML = `<tr><td colspan="4" class="muted">No trips added yet.</td></tr>`;
      return;
    }

    state.compare.forEach((row, idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${row.label}</td>
        <td><strong>${CarbonCalc.format(row.totalKg)} kgCO₂e</strong></td>
        <td><button class="btn btn-ghost" type="button" data-remove="${idx}">Remove</button></td>
      `;
      compareTableBody.appendChild(tr);
    });

    compareTableBody.querySelectorAll("[data-remove]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = Number(btn.getAttribute("data-remove"));
        state.compare.splice(i, 1);
        rebuildCompareTable();
      });
    });
  }

  function calculateAndRender() {
    setError("");
    hideResult();
    addToCompareBtn.disabled = true;

    const inputs = getInputs();
    if (!inputs.ok) {
      setError(inputs.message);
      return;
    }

    try {
      const out = CarbonCalc.calculate(inputs.input, factors);
      state.lastCalc = { input: inputs.input, out };
      renderOutput(inputs.input, out);
      addToCompareBtn.disabled = false;
    } catch (e) {
      console.error(e);
      setError("Something went wrong while calculating. Please try again.");
    }
  }

  // Event wiring
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    calculateAndRender();
  });

  mode.addEventListener("change", () => {
    toggleModePanels();
    setError("");
    hideResult();
    addToCompareBtn.disabled = true;
  });

  haul.addEventListener("change", () => {
    populateFlightClasses();
    setError("");
    hideResult();
    addToCompareBtn.disabled = true;
  });

  [passengers, distance, unit, landMode, carType, taxiType, busType, railType, flightClass].forEach((el) => {
    el.addEventListener("change", () => {
      setError("");
      hideResult();
      addToCompareBtn.disabled = true;
    });
  });

  addToCompareBtn.addEventListener("click", () => {
    if (!state.lastCalc) return;

    const label = makeTripLabel(state.lastCalc.input, state.lastCalc.out);
    const totalKg =
      state.lastCalc.input.mode === "air" ? state.lastCalc.out.totalWithRFKg : state.lastCalc.out.totalKg;

    state.compare.push({ label, totalKg });
    rebuildCompareTable();
  });

  clearCompareBtn.addEventListener("click", () => {
    state.compare = [];
    rebuildCompareTable();
  });

  // Init
  populateLandSelects();
  populateFlightClasses();
  toggleModePanels();
  rebuildCompareTable();
})();
