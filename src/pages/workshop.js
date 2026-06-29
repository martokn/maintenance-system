import api from '../api.js';
import { appLayout } from '../components/layout.js';
import { statCard, badge } from '../components/shared.js';

export default function workshopPage() {
  let view = 'jobs';
  let jobs = [];
  let approvedReports = [];
  let partsRequests = [];

  async function loadData() {
    [jobs, approvedReports, partsRequests] = await Promise.all([
      api.jobCards.list('-created_date').catch(() => []),
      api.inspectionReports.filter({ status: 'Approved' }).catch(() => []),
      api.partsRequests.list('-created_date').catch(() => []),
    ]);
  }

  function buildContent() {
    const inProgress = jobs.filter(j => j.status === 'In Progress').length;
    const awaiting = jobs.filter(j => j.status === 'Awaiting Parts').length;
    const completed = jobs.filter(j => ['Completed', 'Verified'].includes(j.status)).length;
    const isActive = (v) => v === view ? 'bg-primary text-primary-foreground' : 'border border-input bg-background hover:bg-muted';

    return `<div class="space-y-6">
      <div class="bg-card rounded-xl border border-border overflow-hidden">
        <div class="bg-orange-500 rounded-t-xl px-5 py-3 flex items-center gap-3">
          <span class="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold text-white">3</span>
          <h2 class="text-sm font-bold text-white uppercase tracking-wider">Maintenance Workshop Portal</h2>
        </div>
        <div class="p-5">
          <div class="grid grid-cols-4 gap-4 mb-5">
            ${statCard('Approved Jobs', approvedReports.length, 'bg-green-600')}
            ${statCard('In Progress', inProgress, 'bg-orange-500')}
            ${statCard('Awaiting Parts', awaiting, 'bg-purple-600')}
            ${statCard('Completed', completed, 'bg-blue-600')}
          </div>
          <div class="flex gap-3" id="view-buttons">
            <button data-view="jobs" class="inline-flex items-center justify-center rounded-lg text-sm font-medium h-10 px-4 py-2 ${isActive('jobs')} gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg> Job Cards
            </button>
            <button data-view="create" class="inline-flex items-center justify-center rounded-lg text-sm font-medium h-10 px-4 py-2 ${isActive('create')} gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><line x1="12" x2="12" y1="18" y2="12"/><line x1="9" x2="15" y1="15" y2="15"/></svg> Create Job Card
            </button>
            <button data-view="parts" class="inline-flex items-center justify-center rounded-lg text-sm font-medium h-10 px-4 py-2 ${isActive('parts')} gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5.08 8.7-5"/><path d="M12 22V12"/></svg> Request Parts
            </button>
          </div>
        </div>
      </div>
      <div id="view-content"></div>
    </div>`;
  }

  function renderJobCards() {
    const statusColors = { 'In Progress': 'bg-orange-100 text-orange-700', 'Awaiting Parts': 'bg-purple-100 text-purple-700', Completed: 'bg-green-100 text-green-700', Verified: 'bg-blue-100 text-blue-700' };
    return `<div class="bg-card rounded-xl border border-border overflow-hidden">
      <div class="p-4 border-b border-border"><h3 class="text-sm font-bold uppercase tracking-wider">My Jobs</h3></div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead><tr class="bg-muted">
            <th class="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Job No.</th>
            <th class="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Plate No.</th>
            <th class="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Vehicle</th>
            <th class="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Start Date</th>
            <th class="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Status</th>
            <th class="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Action</th>
          </tr></thead>
          <tbody>${jobs.length === 0 ? '<tr><td colspan="6" class="py-8 text-center text-muted-foreground">No job cards yet.</td></tr>' :
            jobs.map(j => `<tr class="border-b border-border/50 hover:bg-muted/30">
              <td class="py-2.5 px-3 font-semibold">${j.job_number}</td>
              <td class="py-2.5 px-3 font-semibold">${j.plate_number}</td>
              <td class="py-2.5 px-3">${j.vehicle_make_model}</td>
              <td class="py-2.5 px-3">${j.start_date ? new Date(j.start_date).toLocaleDateString('en-GB') : '-'}</td>
              <td class="py-2.5 px-3">${badge(j.status, statusColors[j.status] || '')}</td>
              <td class="py-2.5 px-3">${j.status === 'In Progress' ? `<button data-complete-job="${j.id}" class="inline-flex items-center justify-center rounded-lg text-xs font-medium h-8 px-3 border border-input bg-background hover:bg-muted gap-1"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Complete</button>` : ''}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  }

  function renderCreateCard() {
    return `<div class="bg-card rounded-xl border border-border p-6">
      <h3 class="text-sm font-bold uppercase tracking-wider mb-5">Create Job Card</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label class="text-sm font-medium leading-none mb-2 block">Approved Report</label>
          <select id="report-select" class="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm appearance-none">
            <option value="">Select approved report...</option>
            ${approvedReports.map(r => `<option value="${r.id}">${r.plate_number} - ${r.vehicle_make_model}</option>`).join('')}
          </select>
          ${approvedReports.length === 0 ? '<p class="text-xs text-muted-foreground mt-1">No approved reports available.</p>' : ''}
        </div>
        <div>
          <label class="text-sm font-medium leading-none mb-2 block">Assigned Mechanic</label>
          <input id="mechanic-input" placeholder="Mechanic name" class="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
        </div>
        <div class="md:col-span-2">
          <label class="text-sm font-medium leading-none mb-2 block">Approved Repair Description</label>
          <textarea id="repair-desc" rows="4" placeholder="Describe the repair work..." class="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></textarea>
        </div>
      </div>
      <div class="flex gap-3 mt-6">
        <button id="create-job-btn" class="inline-flex items-center justify-center rounded-lg text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90">Create Job Card</button>
        <button id="cancel-job-btn" class="inline-flex items-center justify-center rounded-lg text-sm font-medium h-10 px-4 py-2 border border-input bg-background hover:bg-muted">Cancel</button>
      </div>
    </div>`;
  }

  function renderPartsForm() {
    const activeJobs = jobs.filter(j => j.status === 'In Progress' || j.status === 'Awaiting Parts');
    return `<div class="bg-card rounded-xl border border-border p-6">
      <h3 class="text-sm font-bold uppercase tracking-wider mb-5">Request Parts</h3>
      <div class="space-y-5">
        <div>
          <label class="text-sm font-medium leading-none mb-2 block">Job Card</label>
          <select id="parts-job-select" class="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm appearance-none">
            <option value="">Select job card...</option>
            ${activeJobs.map(j => `<option value="${j.id}">${j.job_number} - ${j.plate_number}</option>`).join('')}
          </select>
        </div>
        <div>
          <div class="flex items-center justify-between mb-3">
            <label class="text-sm font-medium leading-none">Parts List</label>
            <button id="add-part-btn" class="inline-flex items-center justify-center rounded-lg text-xs font-medium h-8 px-3 border border-input bg-background hover:bg-muted gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg> Add Part
            </button>
          </div>
          <div id="parts-list" class="space-y-2"></div>
        </div>
        <button id="submit-parts-btn" class="inline-flex items-center justify-center rounded-lg text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90">Submit Parts Request</button>
      </div>
    </div>`;
  }

  const loadingContent = '<div class="space-y-6 animate-pulse"><div class="h-32 bg-muted rounded-xl"></div><div class="h-64 bg-muted rounded-xl"></div></div>';
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
        renderCurrentView();
      } catch { main.innerHTML = '<div class="p-6 text-muted-foreground">Failed to load.</div>' }
    },
  };

  function setupViewButtons() {
    document.getElementById('view-buttons')?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-view]');
      if (!btn) return;
      view = btn.dataset.view;
      document.querySelectorAll('#view-buttons button').forEach(b => {
        const v = b.dataset.view;
        b.className = `inline-flex items-center justify-center rounded-lg text-sm font-medium h-10 px-4 py-2 ${v === view ? 'bg-primary text-primary-foreground' : 'border border-input bg-background hover:bg-muted'} gap-2`;
      });
      renderCurrentView();
    });
  }

  function renderCurrentView() {
    const container = document.getElementById('view-content');
    if (!container) return;
    if (view === 'jobs') {
      container.innerHTML = renderJobCards();
      document.querySelector('[data-complete-job]')?.addEventListener('click', handleComplete);
    } else if (view === 'create') {
      container.innerHTML = renderCreateCard();
      document.getElementById('create-job-btn')?.addEventListener('click', handleCreate);
      document.getElementById('cancel-job-btn')?.addEventListener('click', () => { view = 'jobs'; renderCurrentView(); });
    } else if (view === 'parts') {
      container.innerHTML = renderPartsForm();
      setupPartsForm();
    }
  }

  async function handleComplete(e) {
    const jobId = e.currentTarget.dataset.completeJob;
    const job = jobs.find(j => j.id == jobId);
    if (!job) return;
    e.currentTarget.disabled = true;
    try {
      await api.jobCards.update(jobId, { status: 'Completed', completion_date: new Date().toISOString().split('T')[0] });
      await api.notifications.create({
        message: `Job ${job.job_number} for ${job.plate_number} has been completed. Ready for final verification.`,
        type: 'completion', target_department: 'Inspection',
      });
      await loadData();
      document.querySelector('main').innerHTML = buildContent();
      setupViewButtons();
      renderCurrentView();
    } catch (err) { alert(err.message || 'Failed'); e.currentTarget.disabled = false; }
  }

  async function handleCreate() {
    const reportId = document.getElementById('report-select').value;
    const mechanic = document.getElementById('mechanic-input').value;
    const repairDesc = document.getElementById('repair-desc').value;
    if (!reportId || !repairDesc) { alert('Select a report and describe the repair.'); return; }
    const btn = document.getElementById('create-job-btn');
    btn.disabled = true;
    try {
      const selected = approvedReports.find(r => r.id == reportId);
      const jobNum = `WO-${new Date().getFullYear()}-${Date.now().toString().slice(-3)}`;
      await api.jobCards.create({
        job_number: jobNum, inspection_report_id: reportId, vehicle_id: selected.vehicle_id,
        plate_number: selected.plate_number, vehicle_make_model: selected.vehicle_make_model,
        approved_repair: repairDesc, assigned_mechanic: mechanic,
        start_date: new Date().toISOString().split('T')[0], status: 'In Progress',
      });
      await api.notifications.create({ message: `New job card ${jobNum} created for ${selected.plate_number}`, type: 'info', target_department: 'Workshop' });
      view = 'jobs';
      await loadData();
      document.querySelector('main').innerHTML = buildContent();
      setupViewButtons();
      renderCurrentView();
    } catch (err) { alert(err.message || 'Failed'); btn.disabled = false; }
  }

  function setupPartsForm() {
    let items = [{ part_name: '', quantity: 1 }];
    function renderItems() {
      document.getElementById('parts-list').innerHTML = items.map((item, i) =>
        `<div class="flex gap-3 items-end">
          <div class="flex-1"><input placeholder="Part name" value="${item.part_name}" data-idx="${i}" data-field="part_name" class="part-input flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
          <div class="w-24"><input type="number" min="1" value="${item.quantity}" data-idx="${i}" data-field="quantity" class="part-input flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
          ${items.length > 1 ? `<button data-remove-idx="${i}" class="inline-flex items-center justify-center rounded-lg h-10 w-10 border border-input bg-background hover:bg-muted">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-destructive"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>` : ''}
        </div>`
      ).join('');
      document.querySelectorAll('.part-input').forEach(el => {
        el.addEventListener('input', () => {
          const idx = parseInt(el.dataset.idx);
          const field = el.dataset.field;
          items[idx][field] = field === 'quantity' ? parseInt(el.value) || 1 : el.value;
        });
      });
      document.querySelectorAll('[data-remove-idx]').forEach(el => {
        el.addEventListener('click', () => {
          items = items.filter((_, j) => j !== parseInt(el.dataset.removeIdx));
          renderItems();
        });
      });
    }
    renderItems();

    document.getElementById('add-part-btn')?.addEventListener('click', () => {
      items.push({ part_name: '', quantity: 1 });
      renderItems();
    });

    document.getElementById('submit-parts-btn')?.addEventListener('click', async () => {
      const jobId = document.getElementById('parts-job-select').value;
      if (!jobId || items.some(i => !i.part_name)) { alert('Select a job and add part names.'); return; }
      const btn = document.getElementById('submit-parts-btn');
      btn.disabled = true;
      try {
        const user = await api.auth.me();
        const job = jobs.find(j => j.id == jobId);
        const reqNum = `PR-${new Date().getFullYear()}-${Date.now().toString().slice(-3)}`;
        await api.partsRequests.create({
          request_number: reqNum, job_card_id: jobId, job_number: job?.job_number || '',
          requested_by: user?.full_name || 'Workshop', request_date: new Date().toISOString().split('T')[0],
          items: items.map(i => ({ ...i, status: 'Requested' })), status: 'Pending',
        });
        await api.jobCards.update(jobId, { status: 'Awaiting Parts' });
        await api.notifications.create({
          message: `Parts request ${reqNum} from Workshop for Job ${job?.job_number}`,
          type: 'parts', target_department: 'Stores',
        });
        view = 'jobs';
        await loadData();
        document.querySelector('main').innerHTML = buildContent();
        setupViewButtons();
        renderCurrentView();
      } catch (err) { alert(err.message || 'Failed'); btn.disabled = false; }
    });
  }
}
