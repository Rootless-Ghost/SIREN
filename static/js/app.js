/**
 * SIREN — Frontend Application Logic
 * ====================================
 * Handles dynamic form sections, keyboard shortcuts,
 * API communication, and report export/download.
 */

// ── State ────────────────────────────────────────────────────────
const state = {
    timelineEvents: [],
    iocs: [],
    affectedSystems: [],
    recommendations: [],
    currentTab: 'markdown',
    markdownContent: '',
    jsonContent: '',
    incidentId: '',
};

// ── DOM Ready ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    initKeyboardShortcuts();
});

// ── Event Listeners ──────────────────────────────────────────────
function initEventListeners() {
    // Add-item buttons
    document.getElementById('addTimelineBtn').addEventListener('click', addTimelineEvent);
    document.getElementById('addIocBtn').addEventListener('click', addIOC);
    document.getElementById('addSystemBtn').addEventListener('click', addSystem);
    document.getElementById('addRecBtn').addEventListener('click', addRecommendation);

    // Header actions
    document.getElementById('loadSampleBtn').addEventListener('click', loadSample);
    document.getElementById('clearFormBtn').addEventListener('click', clearForm);

    // Generate
    document.getElementById('generateBtn').addEventListener('click', generateReport);

    // Output actions
    document.getElementById('copyBtn').addEventListener('click', copyToClipboard);
    document.getElementById('downloadMdBtn').addEventListener('click', () => downloadFile('markdown'));
    document.getElementById('downloadJsonBtn').addEventListener('click', () => downloadFile('json'));
    document.getElementById('backToFormBtn').addEventListener('click', showForm);

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
}

// ── Keyboard Shortcuts ───────────────────────────────────────────
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter to add items from focused field
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            const active = document.activeElement;
            if (!active) return;

            const id = active.id;
            if (id === 'tl_description' || id === 'tl_timestamp' || id === 'tl_source') {
                e.preventDefault();
                addTimelineEvent();
            } else if (id === 'ioc_value' || id === 'ioc_context') {
                e.preventDefault();
                addIOC();
            } else if (id === 'sys_hostname' || id === 'sys_ip' || id === 'sys_impact') {
                e.preventDefault();
                addSystem();
            } else if (id === 'rec_text') {
                e.preventDefault();
                addRecommendation();
            }
        }
    });
}

// ── Timeline Events ──────────────────────────────────────────────
function addTimelineEvent() {
    const timestamp = document.getElementById('tl_timestamp').value;
    const description = document.getElementById('tl_description').value.trim();
    const source = document.getElementById('tl_source').value.trim();

    if (!description) {
        showToast('Please enter an event description', 'error');
        return;
    }

    const event = { timestamp, description, source };
    state.timelineEvents.push(event);

    // Sort chronologically
    state.timelineEvents.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    renderTimelineList();
    clearFields(['tl_timestamp', 'tl_description', 'tl_source']);
    document.getElementById('tl_description').focus();
    showToast('Timeline event added');
}

function renderTimelineList() {
    const list = document.getElementById('timelineList');
    const count = document.getElementById('timelineCount');
    count.textContent = `${state.timelineEvents.length} event${state.timelineEvents.length !== 1 ? 's' : ''}`;

    list.innerHTML = state.timelineEvents.map((event, idx) => `
        <div class="item-card">
            <div class="item-content">
                <span class="item-label">${formatTimestamp(event.timestamp)}${event.source ? ' · ' + escapeHtml(event.source) : ''}</span>
                <span class="item-value">${escapeHtml(event.description)}</span>
            </div>
            <button class="item-remove" onclick="removeTimeline(${idx})" title="Remove">&times;</button>
        </div>
    `).join('');
}

function removeTimeline(idx) {
    state.timelineEvents.splice(idx, 1);
    renderTimelineList();
}

// ── IOCs ─────────────────────────────────────────────────────────
function addIOC() {
    const type = document.getElementById('ioc_type').value;
    const value = document.getElementById('ioc_value').value.trim();
    const context = document.getElementById('ioc_context').value.trim();

    if (!value) {
        showToast('Please enter an IOC value', 'error');
        return;
    }

    state.iocs.push({ type, value, context });
    renderIOCList();
    clearFields(['ioc_value', 'ioc_context']);
    document.getElementById('ioc_value').focus();
    showToast('IOC added');
}

function renderIOCList() {
    const list = document.getElementById('iocList');
    const count = document.getElementById('iocCount');
    count.textContent = `${state.iocs.length} IOC${state.iocs.length !== 1 ? 's' : ''}`;

    list.innerHTML = state.iocs.map((ioc, idx) => `
        <div class="item-card">
            <div class="item-content">
                <span class="item-label">${escapeHtml(ioc.type)}</span>
                <span class="item-value">${escapeHtml(ioc.value)}</span>
                ${ioc.context ? `<span class="item-context">${escapeHtml(ioc.context)}</span>` : ''}
            </div>
            <button class="item-remove" onclick="removeIOC(${idx})" title="Remove">&times;</button>
        </div>
    `).join('');
}

function removeIOC(idx) {
    state.iocs.splice(idx, 1);
    renderIOCList();
}

// ── Affected Systems ─────────────────────────────────────────────
function addSystem() {
    const hostname = document.getElementById('sys_hostname').value.trim();
    const ip = document.getElementById('sys_ip').value.trim();
    const impact = document.getElementById('sys_impact').value.trim();

    if (!hostname && !ip) {
        showToast('Please enter a hostname or IP address', 'error');
        return;
    }

    state.affectedSystems.push({ hostname, ip_address: ip, impact });
    renderSystemList();
    clearFields(['sys_hostname', 'sys_ip', 'sys_impact']);
    document.getElementById('sys_hostname').focus();
    showToast('System added');
}

function renderSystemList() {
    const list = document.getElementById('systemList');
    const count = document.getElementById('systemCount');
    count.textContent = `${state.affectedSystems.length} system${state.affectedSystems.length !== 1 ? 's' : ''}`;

    list.innerHTML = state.affectedSystems.map((sys, idx) => `
        <div class="item-card">
            <div class="item-content">
                <span class="item-label">${escapeHtml(sys.hostname)} · ${escapeHtml(sys.ip_address)}</span>
                ${sys.impact ? `<span class="item-context">${escapeHtml(sys.impact)}</span>` : ''}
            </div>
            <button class="item-remove" onclick="removeSystem(${idx})" title="Remove">&times;</button>
        </div>
    `).join('');
}

function removeSystem(idx) {
    state.affectedSystems.splice(idx, 1);
    renderSystemList();
}

// ── Recommendations ──────────────────────────────────────────────
function addRecommendation() {
    const text = document.getElementById('rec_text').value.trim();
    if (!text) {
        showToast('Please enter a recommendation', 'error');
        return;
    }

    state.recommendations.push(text);
    renderRecList();
    clearFields(['rec_text']);
    document.getElementById('rec_text').focus();
    showToast('Recommendation added');
}

function renderRecList() {
    const list = document.getElementById('recList');
    const count = document.getElementById('recCount');
    count.textContent = `${state.recommendations.length} item${state.recommendations.length !== 1 ? 's' : ''}`;

    list.innerHTML = state.recommendations.map((rec, idx) => `
        <div class="item-card">
            <div class="item-content">
                <span class="item-label">#${idx + 1}</span>
                <span class="item-value">${escapeHtml(rec)}</span>
            </div>
            <button class="item-remove" onclick="removeRec(${idx})" title="Remove">&times;</button>
        </div>
    `).join('');
}

function removeRec(idx) {
    state.recommendations.splice(idx, 1);
    renderRecList();
}

// ── Generate Report ──────────────────────────────────────────────
async function generateReport() {
    const title = document.getElementById('title').value.trim();
    const analyst = document.getElementById('analyst').value.trim();

    if (!title) {
        showToast('Please enter an incident title', 'error');
        document.getElementById('title').focus();
        return;
    }
    if (!analyst) {
        showToast('Please enter the analyst name', 'error');
        document.getElementById('analyst').focus();
        return;
    }

    const payload = {
        title: title,
        severity: document.getElementById('severity').value,
        category: document.getElementById('category').value,
        analyst: analyst,
        description: document.getElementById('description').value.trim(),
        detection_date: formatDateValue(document.getElementById('detection_date').value),
        containment_date: formatDateValue(document.getElementById('containment_date').value),
        eradication_date: formatDateValue(document.getElementById('eradication_date').value),
        recovery_date: formatDateValue(document.getElementById('recovery_date').value),
        executive_summary: document.getElementById('executive_summary').value.trim(),
        timeline_events: state.timelineEvents.map(e => ({
            timestamp: formatDateValue(e.timestamp),
            description: e.description,
            source: e.source,
        })),
        iocs: state.iocs,
        affected_systems: state.affectedSystems,
        recommendations: state.recommendations,
    };

    const btn = document.getElementById('generateBtn');
    btn.disabled = true;
    btn.textContent = 'Generating...';

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (data.success) {
            state.markdownContent = data.markdown;
            state.jsonContent = data.json;
            state.incidentId = data.incident_id;
            showOutput();
            showToast(`Report ${data.incident_id} generated`, 'success');
        } else {
            showToast(`Error: ${data.error}`, 'error');
        }
    } catch (err) {
        showToast(`Network error: ${err.message}`, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> Generate Incident Report`;
    }
}

// ── Load Sample ──────────────────────────────────────────────────
async function loadSample() {
    try {
        const response = await fetch('/api/sample');
        const data = await response.json();

        if (data.error) {
            showToast('Could not load sample', 'error');
            return;
        }

        // Populate metadata fields
        document.getElementById('title').value = data.title || '';
        document.getElementById('severity').value = data.severity || 'Medium';
        document.getElementById('category').value = data.category || 'Other';
        document.getElementById('analyst').value = data.analyst || '';
        document.getElementById('description').value = data.description || '';
        document.getElementById('executive_summary').value = data.executive_summary || '';

        // Dates
        if (data.detection_date) document.getElementById('detection_date').value = toDatetimeLocal(data.detection_date);
        if (data.containment_date) document.getElementById('containment_date').value = toDatetimeLocal(data.containment_date);
        if (data.eradication_date) document.getElementById('eradication_date').value = toDatetimeLocal(data.eradication_date);
        if (data.recovery_date) document.getElementById('recovery_date').value = toDatetimeLocal(data.recovery_date);

        // Dynamic lists
        state.timelineEvents = (data.timeline_events || []).map(e => ({
            timestamp: toDatetimeLocal(e.timestamp),
            description: e.description,
            source: e.source || '',
        }));
        state.iocs = data.iocs || [];
        state.affectedSystems = (data.affected_systems || []).map(s => ({
            hostname: s.hostname,
            ip_address: s.ip_address,
            impact: s.impact || '',
        }));
        state.recommendations = data.recommendations || [];

        renderTimelineList();
        renderIOCList();
        renderSystemList();
        renderRecList();

        showToast('Sample Qakbot incident loaded', 'success');
    } catch (err) {
        showToast('Failed to load sample', 'error');
    }
}

// ── Clear Form ───────────────────────────────────────────────────
function clearForm() {
    // Reset all inputs
    document.querySelectorAll('input, textarea, select').forEach(el => {
        if (el.tagName === 'SELECT') {
            el.selectedIndex = 0;
        } else {
            el.value = '';
        }
    });

    // Reset state
    state.timelineEvents = [];
    state.iocs = [];
    state.affectedSystems = [];
    state.recommendations = [];

    renderTimelineList();
    renderIOCList();
    renderSystemList();
    renderRecList();

    showForm();
    showToast('Form cleared');
}

// ── Output Display ───────────────────────────────────────────────
function showOutput() {
    document.getElementById('formContainer').style.display = 'none';
    document.getElementById('outputContainer').style.display = 'block';
    document.getElementById('markdownOutput').textContent = state.markdownContent;
    document.getElementById('jsonOutput').textContent = state.jsonContent;
    switchTab('markdown');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showForm() {
    document.getElementById('outputContainer').style.display = 'none';
    document.getElementById('formContainer').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function switchTab(tab) {
    state.currentTab = tab;
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    document.getElementById('markdownOutput').style.display = tab === 'markdown' ? 'block' : 'none';
    document.getElementById('jsonOutput').style.display = tab === 'json' ? 'block' : 'none';
}

// ── Clipboard & Download ─────────────────────────────────────────
async function copyToClipboard() {
    const content = state.currentTab === 'markdown' ? state.markdownContent : state.jsonContent;
    try {
        await navigator.clipboard.writeText(content);
        showToast('Copied to clipboard', 'success');
    } catch {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = content;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Copied to clipboard', 'success');
    }
}

function downloadFile(format) {
    let content, filename, mimeType;

    if (format === 'markdown') {
        content = state.markdownContent;
        filename = `${state.incidentId || 'incident-report'}.md`;
        mimeType = 'text/markdown';
    } else {
        content = state.jsonContent;
        filename = `${state.incidentId || 'incident-report'}.json`;
        mimeType = 'application/json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Downloaded ${filename}`, 'success');
}

// ── Utilities ────────────────────────────────────────────────────
function clearFields(ids) {
    ids.forEach(id => { document.getElementById(id).value = ''; });
}

function formatTimestamp(ts) {
    if (!ts) return 'No timestamp';
    try {
        const d = new Date(ts);
        return d.toLocaleString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: false,
        });
    } catch {
        return ts;
    }
}

function formatDateValue(val) {
    if (!val) return '';
    try {
        const d = new Date(val);
        return d.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
    } catch {
        return val;
    }
}

function toDatetimeLocal(dateStr) {
    if (!dateStr) return '';
    try {
        const d = new Date(dateStr.replace(' UTC', 'Z'));
        // Format for datetime-local input: YYYY-MM-DDTHH:MM
        const pad = n => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
        return '';
    }
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function showToast(message, type = '') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast show ' + type;
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
        toast.className = 'toast';
    }, 2500);
}

// Expose remove functions to global scope for inline onclick handlers
window.removeTimeline = removeTimeline;
window.removeIOC = removeIOC;
window.removeSystem = removeSystem;
window.removeRec = removeRec;
