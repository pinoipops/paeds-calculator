// Pediatric Weight-Dose Calculator Logic
const medications = {
    paracetamol: {
        strengths: [
            { label: "120mg/5mL", value: "120" },
            { label: "250mg/5mL", value: "250" }
        ],
        dosing: [{ label: "10-15 mg/kg QID", min: 10, max: 15, frequency: "QID" }],
        defaultStrength: "250"
    },
    amoxClav: {
        strengths: [
            { label: "125mg+31.25mg/5mL (ES)", value: "125" },
            { label: "200mg+28.5mg/5mL (228)", value: "200" },
            { label: "250mg+62.5mg/5mL (312)", value: "250" },
            { label: "400mg+57mg/5mL (457)", value: "400" },
            { label: "600mg+42.9mg/5mL (XR)", value: "600" }
        ],
        dosing: [
            { label: "25-45 mg/kg/day BID", min: 12.5, max: 22.5, frequency: "BID" },
            { label: "80-90 mg/kg/day BID", min: 40, max: 45, frequency: "BID" }
        ]
    },
    azithromycin: {
        strengths: [{ label: "200mg/5mL", value: "200" }],
        dosing: [
            { label: "Day 1: 10mg/kg, then 5mg/kg/day", min: 10, max: 10, frequency: "OD" },
            { label: "12mg/kg/day for 5 days", min: 12, max: 12, frequency: "OD" }
        ]
    },
    erythromycin: {
        strengths: [
            { label: "200mg/5mL", value: "200" },
            { label: "400mg/5mL", value: "400" }
        ],
        dosing: [{ label: "30-50 mg/kg/day TDS", min: 10, max: 16.67, frequency: "TDS" }]
    },
    cephalexin: {
        strengths: [{ label: "250mg/5mL", value: "250" }],
        dosing: [{ label: "25-60 mg/kg/day QID", min: 6.25, max: 15, frequency: "QID" }]
    },
    prednisolone: {
        strengths: [{ label: "5mg/5mL", value: "5" }],
        dosing: [
            { label: "1-2 mg/kg/day OD", min: 1, max: 2, frequency: "OD" },
            { label: "1-2 mg/kg/day BID", min: 0.5, max: 1, frequency: "BID" }
        ]
    }
};

// Personalized Regimen Builder Logic
let customMeds = JSON.parse(localStorage.getItem('customMeds')) || {
    'tussidex': { name: "Tussidex (Dextromethorphan)", doses: { '2-5': '2.5mL TDS', '6-12': '5mL TDS', '12+': '10mL TDS' }},
    'cough-en': { name: "Cough-EN (Diphenhydramine)", doses: { '2-5': '2.5mL TDS', '6-12': '5mL TDS', '12+': '10mL TDS' }},
    'benadryl': { name: "Benadryl (Diphenhydramine)", doses: { '2-5': '2.5mL TDS', '6-12': '5mL TDS', '12+': '10mL TDS' }},
    'dexcophan': { name: "Dexcophan (Dextromethorphan)", doses: { '2-5': '2.5mL TDS', '6-12': '5mL TDS', '12+': '10mL TDS' }},
    'sedilix': { name: "Sedilix (Promethazine)", doses: { '2-5': '2.5mL TDS', '6-12': '5mL TDS', '12+': '10mL TDS' }},
    'bisolvon': { name: "Bisolvon (Bromhexine)", doses: { '2-5': '2.5mL QDS', '6-12': '5mL TDS', '12+': '10mL TDS' }},
    'piriton': { name: "Piriton (Chlorpheniramine)", doses: { '2-5': '2.5mL TDS', '6-12': '5mL TDS', '12+': '10mL TDS' }},
    'cetirizine': { name: "Cetirizine (Zyrtec)", doses: { '2-5': '2.5mL OD', '6-12': '5mL OD', '12+': '10mL OD' }},
    'actifed': { name: "Actifed (Triprolidine)", doses: { '2-5': '2.5mL TDS', '6-12': '5mL TDS', '12+': '10mL TDS' }},
    'salmodil': { name: "Salmodil (Salbutamol)", doses: { '2-5': '2.5mL TDS', '6-12': '5mL TDS', '12+': '10mL TDS' }}
};

// Shared Functions
function showError(elementId, message) {
    const errorDiv = document.getElementById(elementId);
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => errorDiv.style.display = 'none', 3000);
}

function handleKeyDown(e) {
    if (e.key === 'Enter') calculateDose();
}

// Weight-Dose Calculator Functions
function quickSelect(med) {
    document.getElementById('medication').value = med;
    updateStrengthOptions();
}

function updateStrengthOptions() {
    const med = document.getElementById('medication').value;
    const strengthSelect = document.getElementById('strength');
    const dosingSelect = document.getElementById('dosing');

    strengthSelect.innerHTML = '';
    dosingSelect.innerHTML = '';

    if (med && medications[med]) {
        medications[med].strengths.forEach(str => {
            const option = document.createElement('option');
            option.value = str.value;
            option.textContent = str.label;
            strengthSelect.appendChild(option);
        });

        medications[med].dosing.forEach((dose, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = dose.label;
            dosingSelect.appendChild(option);
        });

        if (medications[med].defaultStrength) {
            strengthSelect.value = medications[med].defaultStrength;
        }
        dosingSelect.selectedIndex = 0;

        document.getElementById('strengthContainer').classList.remove('hidden');
        document.getElementById('dosingContainer').classList.remove('hidden');
    } else {
        document.getElementById('strengthContainer').classList.add('hidden');
        document.getElementById('dosingContainer').classList.add('hidden');
    }
}

function calculateDose() {
    const weight = parseFloat(document.getElementById('weight').value);
    const med = document.getElementById('medication').value;
    const strength = parseFloat(document.getElementById('strength').value);
    const dosingIndex = document.getElementById('dosing').selectedIndex;

    if (!weight || !med || isNaN(strength) || dosingIndex === -1 || weight < 3 || weight > 100) {
        showError('error1', 'Please enter valid inputs (weight 3-100kg)');
        return;
    }

    const doseInfo = medications[med].dosing[dosingIndex];
    let resultHTML = '';

    if (med === 'azithromycin') {
        if (dosingIndex === 0) {
            const day1Dose = 10 * weight;
            const days2to5Dose = 5 * weight;
            const day1Volume = (day1Dose * 5) / strength;
            const days2to5Volume = (days2to5Dose * 5) / strength;

            resultHTML = `
                <strong>Recommended Dosing:</strong><br>
                Day 1: ${day1Dose.toFixed(1)} mg (${day1Volume.toFixed(1)} mL)<br>
                Days 2-5: ${days2to5Dose.toFixed(1)} mg (${days2to5Volume.toFixed(1)} mL)`;
        } else {
            const dailyDose = 12 * weight;
            const dailyVolume = (dailyDose * 5) / strength;

            resultHTML = `
                <strong>Recommended Dosing:</strong><br>
                ${dailyDose.toFixed(1)} mg (${dailyVolume.toFixed(1)} mL) daily for 5 days`;
        }
    } else {
        const minDose = doseInfo.min * weight;
        const maxDose = doseInfo.max * weight;
        const minVolume = (minDose * 5) / strength;
        const maxVolume = (maxDose * 5) / strength;

        resultHTML = `
            <strong>Dosing Range:</strong><br>
            ${minDose.toFixed(1)}-${maxDose.toFixed(1)} mg ${doseInfo.frequency}<br>
            (${minVolume.toFixed(1)}-${maxVolume.toFixed(1)} mL per dose)`;
    }

    document.getElementById('result1').innerHTML = resultHTML;
    document.getElementById('result1').style.display = 'block';
    document.getElementById('error1').style.display = 'none';
}

// Personalized Regimen Builder Functions
function populateCustomMeds() {
    const select = document.getElementById('medicationCustom');
    select.innerHTML = '<option value="">Choose medication...</option>';
    Object.entries(customMeds).forEach(([key, med]) => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = med.name;
        select.appendChild(option);
    });
}
populateCustomMeds();

function calculateCustomDose() {
    const medKey = document.getElementById('medicationCustom').value;
    const age = document.querySelector('input[name="age"]:checked')?.value;
    
    if (!medKey || !age) {
        showError('error2', 'Please select medication and age group');
        return;
    }

    const med = customMeds[medKey];
    document.getElementById('result2').innerHTML = `
        <strong>${med.name}</strong><br>
        Recommended dose: ${med.doses[age]}
    `;
    document.getElementById('result2').style.display = 'block';
}

function toggleMedicationBox() {
    document.getElementById('medicationBox').classList.toggle('hidden');
}

function saveCustomMedication() {
    const name = document.getElementById('newMedName').value.trim();
    const dose2_5 = document.getElementById('dose2-5').value.trim();
    const dose6_12 = document.getElementById('dose6-12').value.trim();
    const dose12Plus = document.getElementById('dose12+').value.trim();

    if (!name || !dose2_5 || !dose6_12 || !dose12Plus) {
        alert('Please fill all medication details');
        return;
    }

    const key = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    customMeds[key] = {
        name: name,
        doses: { '2-5': dose2_5, '6-12': dose6_12, '12+': dose12Plus }
    };
    
    localStorage.setItem('customMeds', JSON.stringify(customMeds));
    populateCustomMeds();
    toggleMedicationBox();
}

// Initialize default strength options
updateStrengthOptions();