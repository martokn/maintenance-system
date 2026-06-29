import api from '../api.js';
import { appLayout } from '../components/layout.js';
import { statCard, badge } from '../components/shared.js';

function newInspectionFormHtml(reports, onSuccess) {
  return `<div class="bg-card rounded-xl border border-border p-6">
    <h3 class="text-sm font-bold uppercase tracking-wider mb-5">New Inspection Report</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div>
        <label class="text-sm font-medium leading-none mb-2 block">Select Vehicle</label>
        <div id="new-vehicle-select" class="relative">
          <select id="vehicle-select" class="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm appearance-none">
            <option value="">Choose vehicle...</option>
          </select>
        </div>
        <p id="selected-vehicle-dept" class="text-xs text-muted-foreground mt-1"></p>
      </div>
      <div>
        <label class="text-sm font-medium leading-none mb-2 block">Priority</label>
        <select id="priority-select" class="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm appearance-none">
          <option value="Low">Low</option>
          <option value="Medium" selected>Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
        </select>
      </div>
      <div class="md:col-span-2">
        <label class="text-sm font-medium leading-none mb-2 block">Findings</label>
        <textarea id="findings-input" placeholder="Describe inspection findings..." rows="4" class="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></textarea>
      </div>
      <div>
        <label class="text-sm font-medium leading-none mb-2 block">Recommended Parts</label>
        <input id="parts-input" placeholder="e.g. Brake Pads, Brake Fluid (2L)" class="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
      </div>
      <div>
        <label class="text-sm font-medium leading-none mb-2 block">Estimated Cost (KES)</label>
        <input id="cost-input" type="number" placeholder="0" class="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
      </div>
      <div class="md:col-span-2">
        <label class="text-sm font-medium leading-none mb-2 block">Photos</label>
        <div id="photo-preview" class="flex flex-wrap gap-3 mt-2"></div>
        <label class="w-20 h-20 mt-2 rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-muted transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
          <input id="photo-upload" type="file" accept="image/*" multiple class="hidden">
        </label>
      </div>
    </div>
    <div class="flex gap-3 mt-6">
      <button id="submit-report-btn" class="inline-flex items-center justify-center rounded-lg text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90">Submit Report</button>
      <button id="cancel-report-btn" class="inline-flex items-center justify-center rounded-lg text-sm font-medium h-10 px-4 py-2 border border-input bg-background hover:bg-muted">Cancel</button>
    </div>
  </div>`;
}

function tableHtml(reports) {
  const statusColors = { 'Awaiting Approval': 'bg-amber-100 text-amber-700', Approved: 'bg-green-100 text-green-700', Rejected: 'bg-red-100 text-red-700', Completed: 'bg-blue-100 text-blue-700', Verified: 'bg-purple-100 text-purple-700' };
  const priorityColors = { Low: 'bg-gray-100 text-gray-600', Medium: 'bg-blue-100 text-blue-700', High: 'bg-orange-100 text-orange-700', Critical: 'bg-red-100 text-red-700' };
  return `<div class="bg-card rounded-xl border border-border overflow-hidden">
    <div class="p-5 border-b border-border"><h3 class="text-sm font-bold uppercase tracking-wider">Recent Inspections</h3></div>
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead><tr class="bg-muted">
          <th class="text-left py-2.5 px-4 text-xs font-semibold text-muted-foreground uppercase">Plate No.</th>
          <th class="text-left py-2.5 px-4 text-xs font-semibold text-muted-foreground uppercase">Vehicle</th>
          <th class="text-left py-2.5 px-4 text-xs font-semibold text-muted-foreground uppercase">Inspector</th>
          <th class="text-left py-2.5 px-4 text-xs font-semibold text-muted-foreground uppercase">Date</th>
          <th class="text-left py-2.5 px-4 text-xs font-semibold text-muted-foreground uppercase">Priority</th>
          <th class="text-left py-2.5 px-4 text-xs font-semibold text-muted-foreground uppercase">Status</th>
        </tr></thead>
        <tbody>${reports.length === 0 ? '<tr><td colspan="6" class="py-8 text-center text-muted-foreground">No inspection reports yet.</td></tr>' :
          reports.map(r => `<tr class="border-b border-border/50 hover:bg-muted/30">
            <td class="py-2.5 px-4 font-semibold">${r.plate_number}</td>
            <td class="py-2.5 px-4">${r.vehicle_make_model}</td>
            <td class="py-2.5 px-4">${r.inspector_name}</td>
            <td class="py-2.5 px-4">${r.inspection_date ? new Date(r.inspection_date).toLocaleDateString('en-GB') : '-'}</td>
            <td class="py-2.5 px-4">${badge(r.priority, priorityColors[r.priority] || '')}</td>
            <td class="py-2.5 px-4">${badge(r.status, statusColors[r.status] || '')}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
}

function vehicleSearchHtml(vehicles) {
  const statusColors = { Active: 'bg-green-100 text-green-700', 'In Maintenance': 'bg-orange-100 text-orange-700', Grounded: 'bg-red-100 text-red-700' };
  return `<div class="bg-card rounded-xl border border-border p-5">
    <h3 class="text-sm font-bold uppercase tracking-wider mb-4">Vehicle Search</h3>
    <div class="relative mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      <input id="vehicle-search-input" placeholder="Search by plate number, make, or model..." class="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 pl-10 text-sm">
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead><tr class="border-b border-border">
          <th class="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Plate No.</th>
          <th class="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Make</th>
          <th class="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Model</th>
          <th class="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Department</th>
          <th class="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
        </tr></thead>
        <tbody id="vehicle-search-body">${vehicles.map(v => `<tr class="border-b border-border/50 hover:bg-muted/50">
          <td class="py-2.5 px-3 font-semibold">${v.plate_number}</td>
          <td class="py-2.5 px-3">${v.make}</td><td class="py-2.5 px-3">${v.model}</td>
          <td class="py-2.5 px-3">${v.department}</td>
          <td class="py-2.5 px-3">${badge(v.status, statusColors[v.status] || '')}</td>
        </tr>`).join('')}</tbody>
      </table>
    </div>
  </div>`;
}

function finalInspectionHtml(jobs) {
  return `<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div class="bg-card rounded-xl border border-border overflow-hidden">
      <div class="p-4 border-b border-border"><h3 class="text-sm font-bold uppercase tracking-wider">Jobs Awaiting Final Inspection</h3></div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead><tr class="bg-muted">
            <th class="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Job No.</th>
            <th class="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Plate No.</th>
            <th class="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Vehicle</th>
            <th class="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Completed</th>
          </tr></thead>
          <tbody id="final-inspect-body">${jobs.length === 0 ? '<tr><td colspan="4" class="py-8 text-center text-muted-foreground">No jobs awaiting final inspection.</td></tr>' :
            jobs.map(j => `<tr class="border-b border-border/50 cursor-pointer transition-colors hover:bg-muted/50" data-job-id="${j.id}">
              <td class="py-2.5 px-3 font-semibold">${j.job_number}</td>
              <td class="py-2.5 px-3 font-semibold">${j.plate_number}</td>
              <td class="py-2.5 px-3">${j.vehicle_make_model}</td>
              <td class="py-2.5 px-3 text-xs">${j.completion_date ? new Date(j.completion_date).toLocaleDateString('en-GB') : '-'}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
    <div class="bg-card rounded-xl border border-border p-5" id="final-inspect-detail">
      <div class="h-full flex items-center justify-center text-muted-foreground text-sm">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>
        Select a completed job to inspect
      </div>
    </div>
  </div>`;
}

function renderFinalDetail(job) {
  return `<div class="space-y-4">
    <h3 class="text-sm font-bold uppercase tracking-wider">Job Details: ${job.job_number}</h3>
    <div class="space-y-3 text-sm">
      <div class="grid grid-cols-2 gap-3">
        <div><span class="text-muted-foreground text-xs">Plate Number</span><p class="font-semibold">${job.plate_number}</p></div>
        <div><span class="text-muted-foreground text-xs">Vehicle</span><p class="font-semibold">${job.vehicle_make_model}</p></div>
      </div>
      <div><span class="text-muted-foreground text-xs">Approved Repair</span><p class="mt-1 p-3 bg-muted rounded-lg">${job.approved_repair}</p></div>
      ${job.work_done ? `<div><span class="text-muted-foreground text-xs">Work Done</span><p class="mt-1 p-3 bg-muted rounded-lg">${job.work_done}</p></div>` : ''}
      ${job.notes ? `<div><span class="text-muted-foreground text-xs">Workshop Notes</span><p class="mt-1 p-3 bg-muted rounded-lg text-sm">${job.notes}</p></div>` : ''}
      <div><span class="text-muted-foreground text-xs">Assigned Mechanic</span><p class="font-medium">${job.assigned_mechanic || 'Not assigned'}</p></div>
    </div>
    <div class="pt-4 border-t border-border space-y-3">
      <div>
        <span class="text-muted-foreground text-xs">Fail Reason (required if failing)</span>
        <textarea id="fail-reason" placeholder="Describe why the job failed inspection..." rows="2" class="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm mt-1"></textarea>
      </div>
      <div class="flex gap-3">
        <button id="pass-job-btn" data-job-id="${job.id}" class="inline-flex items-center justify-center rounded-lg text-sm font-medium h-10 px-4 py-2 bg-green-600 text-white hover:bg-green-700 gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          Pass & Release
        </button>
        <button id="fail-job-btn" data-job-id="${job.id}" class="inline-flex items-center justify-center rounded-lg text-sm font-medium h-10 px-4 py-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg>
          Fail
        </button>
      </div>
    </div>
  </div>`;
}

export default function inspectionPage() {
  let view = 'list';
  let reports = [];
  let vehicles = [];
  let completedJobs = [];
  let selectedJob = null;

  async function loadData() {
    [reports, vehicles, completedJobs] = await Promise.all([
      api.inspectionReports.list('-created_date').catch(() => []),
      api.vehicles.list().catch(() => []),
      api.jobCards.getByStatus('Completed').catch(() => []),
    ]);
  }

  function buildContent() {
    const pending = reports.filter(r => r.status === 'Awaiting Approval').length;
    const approved = reports.filter(r => r.status === 'Approved').length;
    const completed = reports.filter(r => ['Completed', 'Verified'].includes(r.status)).length;

    return `<div class="space-y-6">
      <div class="bg-card rounded-xl border border-border overflow-hidden">
        <div class="bg-primary rounded-t-xl px-5 py-3 flex items-center gap-3">
          <span class="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold text-white">1</span>
          <h2 class="text-sm font-bold text-white uppercase tracking-wider">Inspection Department Portal</h2>
        </div>
        <div class="p-5">
          <div class="grid grid-cols-4 gap-4 mb-5">
            ${statCard('Pending Inspections', pending, 'bg-primary')}
            ${statCard('Awaiting Approval', approved, 'bg-orange-500')}
            ${statCard('Completed', completed, 'bg-green-600')}
            ${statCard('Active Vehicles', reports.filter(r => r.status === 'Verified').length, 'bg-blue-600')}
          </div>
          <div class="flex gap-3" id="view-buttons">
            <button data-view="new" class="inline-flex items-center justify-center rounded-lg text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg> New Inspection</button>
            <button data-view="list" class="inline-flex items-center justify-center rounded-lg text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg> View Reports</button>
            <button data-view="verify" class="inline-flex items-center justify-center rounded-lg text-sm font-medium h-10 px-4 py-2 border border-input bg-background hover:bg-muted gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Final Inspection</button>
            <button data-view="search" class="inline-flex items-center justify-center rounded-lg text-sm font-medium h-10 px-4 py-2 border border-input bg-background hover:bg-muted gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg> Vehicle Search</button>
          </div>
        </div>
      </div>
      <div id="view-content">${tableHtml(reports)}</div>
    </div>`;
  }

  async function setupViewButtons() {
    document.getElementById('view-buttons')?.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-view]');
      if (!btn) return;
      view = btn.dataset.view;
      document.querySelectorAll('#view-buttons button').forEach(b => {
        if (b.dataset.view === view) {
          b.className = 'inline-flex items-center justify-center rounded-lg text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 gap-2';
        } else if (['new', 'list', 'verify'].includes(b.dataset.view)) {
          b.className = 'inline-flex items-center justify-center rounded-lg text-sm font-medium h-10 px-4 py-2 border border-input bg-background hover:bg-muted gap-2';
        }
      });
      await renderView();
    });
  }

  async function renderView() {
    const container = document.getElementById('view-content');
    if (!container) return;

    switch (view) {
      case 'new':
        container.innerHTML = newInspectionFormHtml();
        setupNewForm();
        break;
      case 'search':
        container.innerHTML = vehicleSearchHtml(vehicles);
        setupVehicleSearch();
        break;
      case 'verify':
        container.innerHTML = finalInspectionHtml(completedJobs);
        setupFinalInspection();
        break;
      default:
        container.innerHTML = tableHtml(reports);
    }
  }

  function setupNewForm() {
    const select = document.getElementById('vehicle-select');
    if (!select) return;
    vehicles.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.id;
      opt.textContent = `${v.plate_number} - ${v.make} ${v.model}`;
      select.appendChild(opt);
    });
    select.addEventListener('change', () => {
      const v = vehicles.find(x => x.id == select.value);
      document.getElementById('selected-vehicle-dept').textContent = v ? `Department: ${v.department}` : '';
    });

    let photos = [];
    document.getElementById('photo-upload')?.addEventListener('change', (e) => {
      Array.from(e.target.files).forEach(file => photos.push(URL.createObjectURL(file)));
      document.getElementById('photo-preview').innerHTML = photos.map((url, i) =>
        `<div class="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
          <img src="${url}" class="w-full h-full object-cover">
          <button type="button" data-photo-idx="${i}" class="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-destructive text-white flex items-center justify-center text-xs">x</button>
        </div>`
      ).join('');
      document.querySelectorAll('[data-photo-idx]').forEach(el => {
        el.addEventListener('click', () => {
          const idx = parseInt(el.dataset.photoIdx);
          photos = photos.filter((_, j) => j !== idx);
          document.getElementById('photo-preview').innerHTML = photos.map((u, i) =>
            `<div class="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
              <img src="${u}" class="w-full h-full object-cover">
              <button type="button" data-photo-idx="${i}" class="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-destructive text-white flex items-center justify-center text-xs">x</button>
            </div>`
          ).join('');
        });
      });
    });

    document.getElementById('submit-report-btn')?.addEventListener('click', async () => {
      const vehicleId = document.getElementById('vehicle-select').value;
      const findings = document.getElementById('findings-input').value;
      if (!vehicleId || !findings) { alert('Please select a vehicle and add findings.'); return; }
      const btn = document.getElementById('submit-report-btn');
      btn.disabled = true; btn.textContent = 'Submitting...';
      try {
        const user = await api.auth.me();
        const reportNum = `IR-${Date.now().toString().slice(-6)}`;
        const v = vehicles.find(x => x.id == vehicleId);
        await api.inspectionReports.create({
          report_number: reportNum, vehicle_id: vehicleId, plate_number: v?.plate_number,
          vehicle_make_model: `${v?.make} ${v?.model}`, vehicle_department: v?.department,
          inspector_name: user?.full_name || 'Inspector', inspection_date: new Date().toISOString().split('T')[0],
          findings, recommended_parts: document.getElementById('parts-input').value,
          estimated_cost: parseFloat(document.getElementById('cost-input').value) || 0,
          priority: document.getElementById('priority-select').value, photos,
          status: 'Awaiting Approval',
        });
        await api.vehicles.update(vehicleId, { status: 'In Maintenance' });
        await api.notifications.create({
          message: `New inspection report ${reportNum} submitted for ${v?.plate_number} - ${v?.make} ${v?.model}`,
          type: 'inspection', target_department: 'Department Approver',
        });
        view = 'list';
        await loadData();
        const main = document.querySelector('main');
        main.innerHTML = buildContent();
        setupViewButtons();
      } catch (err) {
        alert(err.message || 'Failed to submit report');
        btn.disabled = false; btn.textContent = 'Submit Report';
      }
    });

    document.getElementById('cancel-report-btn')?.addEventListener('click', () => {
      view = 'list';
      const main = document.querySelector('main');
      main.innerHTML = buildContent();
      setupViewButtons();
    });
  }

  function setupVehicleSearch() {
    const input = document.getElementById('vehicle-search-input');
    const tbody = document.getElementById('vehicle-search-body');
    if (!input || !tbody) return;
    input.addEventListener('input', () => {
      const q = input.value.toLowerCase();
      tbody.innerHTML = vehicles.filter(v =>
        v.plate_number?.toLowerCase().includes(q) || v.make?.toLowerCase().includes(q) || v.model?.toLowerCase().includes(q)
      ).map(v => `<tr class="border-b border-border/50 hover:bg-muted/50">
        <td class="py-2.5 px-3 font-semibold">${v.plate_number}</td>
        <td class="py-2.5 px-3">${v.make}</td><td class="py-2.5 px-3">${v.model}</td>
        <td class="py-2.5 px-3">${v.department}</td>
        <td class="py-2.5 px-3">${badge(v.status, { Active: 'bg-green-100 text-green-700', 'In Maintenance': 'bg-orange-100 text-orange-700', Grounded: 'bg-red-100 text-red-700' }[v.status] || '')}</td>
      </tr>`).join('') || '<tr><td colspan="5" class="py-8 text-center text-muted-foreground">No vehicles found.</td></tr>';
    });
  }

  function setupFinalInspection() {
    document.getElementById('final-inspect-body')?.addEventListener('click', (e) => {
      const row = e.target.closest('[data-job-id]');
      if (!row) return;
      const job = completedJobs.find(j => j.id == row.dataset.jobId);
      if (!job) return;
      selectedJob = job;
      document.getElementById('final-inspect-detail').innerHTML = renderFinalDetail(job);

      document.getElementById('pass-job-btn')?.addEventListener('click', handlePass);
      document.getElementById('fail-job-btn')?.addEventListener('click', handleFail);
    });
  }

  async function handlePass() {
    if (!selectedJob) return;
    const btn = document.getElementById('pass-job-btn');
    btn.disabled = true;
    try {
      await api.jobCards.update(selectedJob.id, {
        status: 'Verified', work_done: selectedJob.work_done || selectedJob.approved_repair,
        completion_date: new Date().toISOString().split('T')[0],
      });
      await api.vehicles.update(selectedJob.vehicle_id, { status: 'Active' });
      await api.notifications.create({
        message: `Vehicle ${selectedJob.plate_number} passed final inspection. Job ${selectedJob.job_number} verified and vehicle released.`,
        type: 'completion', target_department: 'Workshop',
      });
      selectedJob = null;
      await loadData();
      const main = document.querySelector('main');
      main.innerHTML = buildContent();
      setupViewButtons();
    } catch (err) {
      alert(err.message || 'Failed');
      btn.disabled = false;
    }
  }

  async function handleFail() {
    if (!selectedJob) return;
    const reason = document.getElementById('fail-reason').value;
    if (!reason.trim()) { alert('Please provide a reason for failure.'); return; }
    const btn = document.getElementById('fail-job-btn');
    btn.disabled = true;
    try {
      await api.jobCards.update(selectedJob.id, {
        status: 'In Progress',
        notes: selectedJob.notes ? selectedJob.notes + '\n---\nRejected: ' + reason : 'Rejected: ' + reason,
      });
      await api.notifications.create({
        message: `Vehicle ${selectedJob.plate_number} failed final inspection: ${reason}. Job ${selectedJob.job_number} returned to workshop.`,
        type: 'completion', target_department: 'Workshop',
      });
      selectedJob = null;
      await loadData();
      const main = document.querySelector('main');
      main.innerHTML = buildContent();
      setupViewButtons();
    } catch (err) {
      alert(err.message || 'Failed');
      btn.disabled = false;
    }
  }

  const loadingContent = '<div class="space-y-6"><div class="bg-card rounded-xl border border-border p-6 animate-pulse"><div class="grid grid-cols-4 gap-4">'.concat('<div class="h-24 bg-muted rounded-lg"></div>'.repeat(4), '</div><div class="h-10 bg-muted rounded-lg mt-5"></div></div><div class="h-64 bg-muted rounded-xl"></div></div>');
  const layout = appLayout(loadingContent);

  return {
    html: layout.html,
    async init() {
      layout.init();
      const main = document.querySelector('main');
      try {
        await loadData();
        main.innerHTML = buildContent();
        setupViewButtons();
      } catch { main.innerHTML = '<div class="p-6 text-muted-foreground">Failed to load.</div>' }
    },
  };
}
