// script.js
// UI wiring: read inputs, validate, call calc.js, render results + comparison table.

document.addEventListener("DOMContentLoaded", function () {
  const modeEl = document.getElementById("mode");
  const distanceEl = document.getElementById("distance");
  const unitEl = document.getElementById("unit");
  const passengersEl = document.getElementById("passengers");

  const landControls = document.getElementById("landControls");
  const airControls = document.getElementById("airControls");

  const landModeEl = document.getElementById("landMode");
  const carOptionEl = document.getElementById("carOption");
  const busOptionEl = document.getElementById("busOption");
  const railOptionEl = document.getElementById("railOption");
  const taxiOptionEl = document.getElementById("taxiOption");

  const carWrap = document.getElementById("carOptionsWrap");
  const busWrap = document.getElementById("busOptionsWrap");
  const railWrap = document.getElementById("railOptionsWrap");
  const taxiWrap = document.getElementById("taxiOptionsWrap");

  const haulEl = document.getElementById("haul");
  const flightClassEl = document.getElementById("flightClass");

  const form = document.getElementById("calcForm");
  const clearBtn = document.getElementById("clearBtn");

  const errorEl = document.getElementById("error");
  const resultsEl = document.getElementById("results");
  const comparisonBody = document.getElementById("comparisonBody");
  const factorNote = document.getElementById("factorNote");

  function setError(msg) {
    errorEl.textContent = msg || "";
  }

  function showLandModeOptions() {
    const landMode = landModeEl.value;

    carWrap.classList.add("hidden");
    busWrap.classList.add("hidden");
    railWrap.classList.add("hidden");
    taxiWrap.classList.add("hidden");

    if (landMode === "car") carWrap.classList.remove("hidden");
    if (landMode === "bus") busWrap.classList.remove("hidden");
    if (landMode === "rail") railWrap.classList.remove("hidden");
    if (landMode === "taxi") taxiWrap.classList.remove("hidden");
  }

  function showModeControls() {
    if (modeEl.value === "air") {
      landControls.classList.add("hidden");
      airControls.classList.remove("hidden");
    } else {
      airControls.classList.add("hidden");
      landControls.classList.remove("hidden");
    }
  }

  function currentLandOption() {
    const landMode = landModeEl.value;
    if (landMode === "car") return { landMode, option: carOptionEl.value };
    if (landMode === "bus") return { landMode, option: busOptionEl.value };
    if (landMode === "rail") return { landMode, option: railOptionEl.value };
    return { landMode, option: taxiOptionEl.value };
  }

  function buildInputs() {
    const dist = CarbonCalc.parsePositiveNumber(distanceEl.value.trim(), "distance");
    if (dist.error) return { ok: false, error: dist.error };

    const pax = CarbonCalc.parsePassengers(passengersEl.value.trim());
    if (pax.error) return { ok: false, error: pax.error };

    const base = {
      mode: modeEl.value,
      distance: dist.value,
      unit: unitEl.value,
      passengers: pax.value
    };

    if (base.mode === "air") {
      return {
        ok: true,
        inputs: {
          ...base,
          haul: haulEl.value,
          flightClass: flightClassEl.value
        }
      };
    }

    const land = currentLandOption();
    return {
      ok: true,
      inputs: {
        ...base,
        landMode: land.landMode,
        option: land.option
      }
    };
  }

  function renderLandResult(r) {
    resultsEl.innerHTML = `
      <p><strong>${r.label}</strong></p>
      <div class="kpi">
        <div class="kpiBox">
          <div class="label">Per passenger</div>
          <div class="value">${r.perPassengerKg} kg CO₂</div>
        </div>
        <div class="kpiBox">
          <div class="label">Total</div>
          <div class="value">${r.totalKg} kg CO₂</div>
        </div>
        <div class="kpiBox">
          <div class="label">Distance used</div>
          <div class="value">${r.km} km</div>
        </div>
      </div>
    `;
  }

  function renderAirResult(r) {
    resultsEl.innerHTML = `
      <p><strong>${r.label}</strong></p>
      <p class="muted tiny">RF = Radiative Forcing (shown with and without).</p>
      <div class="kpi">
        <div class="kpiBox">
          <div class="label">Per passenger (with RF)</div>
          <div class="value">${r.perPassengerWithRF} kg CO₂</div>
        </div>
        <div class="kpiBox">
          <div class="label">Per passenger (without RF)</div>
          <div class="value">${r.perPassengerWithoutRF} kg CO₂</div>
        </div>
        <div class="kpiBox">
          <div class="label">Total (with RF)</div>
          <div class="value">${r.totalWithRF} kg CO₂</div>
        </div>
        <div class="kpiBox">
          <div class="label">Total (without RF)</div>
          <div class="value">${r.totalWithoutRF} kg CO₂</div>
        </div>
      </div>
      <p class="tiny muted">Distance used: ${r.km} km</p>
    `;
  }

  function clearComparison() {
    comparisonBody.innerHTML = "";
  }

  function addRow(label, perPassengerKg, totalKg) {
    const tr = document.createElement("tr");

    const td1 = document.createElement("td");
    td1.textContent = label;

    const td2 = document.createElement("td");
    td2.textContent = perPassengerKg;

    const td3 = document.createElement("td");
    td3.textContent = totalKg;

    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    comparisonBody.appendChild(tr);
  }

  function renderLandComparison(baseInputs) {
    clearComparison();

    const km = CarbonCalc.toKm(baseInputs.distance, baseInputs.unit);

    // Pick a small set of common comparisons (simple + explainable)
    const options = [
      { landMode: "car", option: "petrol" },
      { landMode: "bus", option: "local_bus" },
      { landMode: "rail", option: "national_rail" },
      { landMode: "taxi", option: "average_taxi" }
    ];

    for (let i = 0; i < options.length; i++) {
      const opt = options[i];

      const out = CarbonCalc.calculateLand(
        {
          mode: "land",
          landMode: opt.landMode,
          option: opt.option,
          distance: baseInputs.distance,
          unit: baseInputs.unit,
          passengers: baseInputs.passengers
        },
        CarbonFactors
      );

      if (out.ok) {
        addRow(out.label, `${out.perPassengerKg} kg`, `${out.totalKg} kg`);
      }
    }

    factorNote.textContent = `Factors: ${CarbonFactors.meta.year} (${CarbonFactors.meta.note}) — Distance used: ${CarbonCalc.round2(km)} km`;
  }

  function renderAirComparison(baseInputs) {
    clearComparison();

    const haul = haulEl.value;
    const km = CarbonCalc.toKm(baseInputs.distance, baseInputs.unit);

    const classes = ["economy", "premium_economy", "business", "first"];

    for (let i = 0; i < classes.length; i++) {
      const flightClass = classes[i];

      const out = CarbonCalc.calculateAir(
        {
          mode: "air",
          haul: haul,
          flightClass: flightClass,
          distance: baseInputs.distance,
          unit: baseInputs.unit,
          passengers: baseInputs.passengers
        },
        CarbonFactors
      );

      if (out.ok) {
        // Show with RF in comparison table (and explain in README)
        addRow(out.label, `${out.perPassengerWithRF} kg (with RF)`, `${out.totalWithRF} kg (with RF)`);
      }
    }

    factorNote.textContent = `Factors: ${CarbonFactors.meta.year} (${CarbonFactors.meta.note}) — Distance used: ${CarbonCalc.round2(km)} km`;
  }

  // Events
  modeEl.addEventListener("change", function () {
    showModeControls();
    setError("");
    clearComparison();
  });

  landModeEl.addEventListener("change", function () {
    showLandModeOptions();
    setError("");
  });

  clearBtn.addEventListener("click", function () {
    distanceEl.value = "";
    passengersEl.value = "";
    setError("");
    resultsEl.innerHTML = `<p class="muted">Enter values and press Calculate.</p>`;
    clearComparison();
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    setError("");

    const built = buildInputs();
    if (!built.ok) {
      setError(built.error);
      return;
    }

    const out = CarbonCalc.calculate(built.inputs, CarbonFactors);
    if (!out.ok) {
      setError(out.error);
      return;
    }

    if (built.inputs.mode === "air") {
      renderAirResult(out);
      renderAirComparison(built.inputs);
    } else {
      renderLandResult(out);
      renderLandComparison(built.inputs);
    }
  });

  // init
  showModeControls();
  showLandModeOptions();
});
