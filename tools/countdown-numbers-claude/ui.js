import { VALID, solve, displayStr, countNums, sortSolutions } from './solver.js';

let selected = [];

// --- Pure validation/parsing functions (exported for testing) ---

export function validateInputs(selected, targetVal) {
    if (isNaN(targetVal) || targetVal < 1 || targetVal > 999) {
        return { valid: false, error: 'Enter a target number between 1 and 999.' };
    }
    if (selected.length !== 6) {
        return { valid: false, error: `Select exactly 6 numbers (currently ${selected.length}).` };
    }
    for (const n of selected) {
        if (!VALID.includes(n)) {
            return { valid: false, error: `Invalid number: ${n}. Must be from {1\u201310, 25, 50, 75, 100}.` };
        }
    }
    return { valid: true };
}

export function parseManualInputText(text) {
    if (!text || !text.trim()) return [];
    const nums = text.split(/[\s,]+/).map(s => parseInt(s, 10)).filter(n => !isNaN(n));
    const result = [];
    for (const n of nums) {
        if (result.length >= 6) break;
        if (VALID.includes(n)) {
            result.push(n);
        }
    }
    return result;
}

// --- UI Setup (browser only) ---

if (typeof document === 'undefined') {
    // Stop here when imported in Node for testing
} else {
    initUI();
}

function initUI() {

function buildButtons() {
    const sg = document.getElementById('smallGrid');
    const lg = document.getElementById('largeGrid');
    for (let n = 1; n <= 10; n++) {
        const b = document.createElement('button');
        b.className = 'num-btn';
        b.textContent = n;
        b.addEventListener('click', () => addNumber(n));
        sg.appendChild(b);
    }
    for (const n of [25, 50, 75, 100]) {
        const b = document.createElement('button');
        b.className = 'num-btn large-num';
        b.textContent = n;
        b.addEventListener('click', () => addNumber(n));
        lg.appendChild(b);
    }
}

function addNumber(n) {
    if (selected.length >= 6) return;
    selected.push(n);
    renderSelected();
}

// Expose removeNumber globally for onclick handlers in rendered HTML
window.removeNumber = function removeNumber(idx) {
    selected.splice(idx, 1);
    renderSelected();
};

function renderSelected() {
    const area = document.getElementById('selectedArea');
    if (selected.length === 0) {
        area.innerHTML = '<span class="placeholder-text">Tap numbers above or type below\u2026</span>';
    } else {
        area.innerHTML = selected.map((n, i) =>
            `<span class="chip" onclick="removeNumber(${i})">${n} <span class="x">\u2715</span></span>`
        ).join('');
    }
    document.querySelectorAll('.num-btn').forEach(b => {
        b.disabled = selected.length >= 6;
    });
    document.getElementById('errorMsg').textContent = '';
}

function parseManualInput() {
    const input = document.getElementById('manualInput');
    const text = input.value.trim();
    if (!text) return;
    const nums = parseManualInputText(text);
    for (const n of nums) {
        if (selected.length >= 6) break;
        selected.push(n);
    }
    input.value = '';
    renderSelected();
}

// --- Event Handlers ---

document.getElementById('manualInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); parseManualInput(); }
});

document.getElementById('clearBtn').addEventListener('click', () => {
    selected = [];
    document.getElementById('target').value = '';
    document.getElementById('manualInput').value = '';
    document.getElementById('results').innerHTML = '';
    document.getElementById('errorMsg').textContent = '';
    renderSelected();
});

document.getElementById('solveBtn').addEventListener('click', () => {
    parseManualInput();

    const targetEl = document.getElementById('target');
    const errorEl = document.getElementById('errorMsg');
    const resultsEl = document.getElementById('results');

    const targetVal = parseInt(targetEl.value, 10);
    const validation = validateInputs(selected, targetVal);
    if (!validation.valid) {
        errorEl.textContent = validation.error;
        return;
    }
    errorEl.textContent = '';

    resultsEl.innerHTML = '<div class="loading">Solving\u2026</div>';
    document.getElementById('solveBtn').disabled = true;

    requestAnimationFrame(() => requestAnimationFrame(() => {
        const t0 = performance.now();
        const results = solve(selected.slice(), targetVal);
        const elapsed = ((performance.now() - t0) / 1000).toFixed(2);

        const sorted = sortSolutions(results);

        if (sorted.length === 0) {
            resultsEl.innerHTML = '<div class="no-results">No exact solutions found.</div>';
        } else {
            const count = sorted.length;
            const plural = count > 1 ? 's' : '';
            let html = '<div class="results-header">'
                + `Found ${count} solution${plural} in ${elapsed}s`
                + '</div>';
            html += '<div class="results-list">';
            for (const r of sorted) {
                html += `<div class="expr-item">${displayStr(r)} = ${targetVal}</div>`;
            }
            html += '</div>';
            resultsEl.innerHTML = html;
        }
        document.getElementById('solveBtn').disabled = false;
    }));
});

buildButtons();

} // end initUI
