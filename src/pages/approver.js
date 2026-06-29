import api from '../api.js';
import { appLayout } from '../components/layout.js';
import { statCard } from '../components/shared.js';

export default function approverPage() {
  let reports = [];
  let selectedReport = null;

  async function loadData() {
    reports = await api.inspectionReports.list('-created_date').catch(() => []);
  }

  function buildContent() {
    const pending = reports.filter(r => r.status === 'Awaiting Approval');
    const approved = reports.filter(r => r.status === 'Approved');
    const rejected = reports.filter(r => r.status === 'Rejected');

    return `<div class="space-y-6">
      <div class="bg-card rounded-xl border border-border overflow-hidden">
        <div class="bg-green-600 rounded-t-xl px-5 py-3 flex items-center gap-3">
          <span class="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold text-white">2</span>
          <h2 class="text-sm font-bold text-white uppercase tracking-wider">Department Approver Portal</h2>
        </div>
        <div class="p-5">
          <div class="grid grid-cols-3 gap-4 mb-5">
            ${statCard('Pending Requests', pending.length, 'bg-orange-500')}
            ${statCard('Approved Today', approved.length, 'bg-green-600')}
            ${statCard('Rejected', rejected.length, 'bg-red-500')}
          </div>
        </div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-card rounded-xl border border-border overflow-hidden">
          <div class="p-4 border-b border-border"><h3 class="text-sm font-bold uppercase tracking-wider">Pending Approval Requests</h3></div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead><tr class="bg-muted">
                <th class="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Plate No.</th>
                <th class="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Vehicle</th>
                <th class="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Dept</th>
                <th class="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Date</th>
              </tr></thead>
              <tbody>${pending.length === 0 ? '<tr><td colspan="4" class="py-8 text-center text-muted-foreground">No pending requests.</td></tr>' :
                pending.map(r => `<tr class="border-b border-border/50 cursor-pointer transition-colors hover:bg-muted/50 ${selectedReport?.id === r.id ? 'bg-primary/5' : ''}" data-report-id="${r.id}">
                  <td class="py-2.5 px-3 font-semibold">${r.plate_number}</td>
                  <td class="py-2.5 px-3">${r.vehicle_make_model}</td>
                  <td class="py-2.5 px-3 text-xs">${r.vehicle_department}</td>
                  <td class="py-2.5 px-3 text-xs">${r.inspection_date ? new Date(r.inspection_date).toLocaleDateString('en-GB') : '-'}</td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
        <div class="bg-card rounded-xl border border-border p-5" id="detail-panel">
          <div class="h-full flex items-center justify-center text-muted-foreground text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Select a request to review
          </div>
        </div>
      </div>
    </div>`;
  }

  function renderDetail(r) {
    const priorityColors = { Low: 'bg-gray-100 text-gray-600', Medium: 'bg-blue-100 text-blue-700', High: 'bg-orange-100 text-orange-700', Critical: 'bg-red-100 text-red-700' };
    return `<div class="space-y-4">
      <h3 class="text-sm font-bold uppercase tracking-wider">Request Details</h3>
      <div class="space-y-3">
        <p class="font-semibold">Vehicle: ${r.plate_number} — ${r.vehicle_make_model}</p>
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div><span class="text-muted-foreground text-xs">Department</span><p class="font-medium">${r.vehicle_department}</p></div>
          <div><span class="text-muted-foreground text-xs">Priority</span><p><span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[r.priority] || ''}">${r.priority}</span></p></div>
        </div>
        <div><span class="text-muted-foreground text-xs">Inspector Findings</span><p class="text-sm mt-1 p-3 bg-muted rounded-lg">${r.findings}</p></div>
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div><span class="text-muted-foreground text-xs">Recommended Parts</span><p class="font-medium">${r.recommended_parts || 'None specified'}</p></div>
          <div><span class="text-muted-foreground text-xs">Estimated Cost</span><p class="font-medium">KES ${(r.estimated_cost || 0).toLocaleString()}</p></div>
        </div>
        ${r.photos?.length > 0 ? `<div><span class="text-muted-foreground text-xs">Photos</span><div class="flex gap-2 mt-1">${r.photos.map(url => `<img src="${url}" class="w-16 h-16 rounded-lg object-cover border border-border">`).join('')}</div></div>` : ''}
        <div><span class="text-muted-foreground text-xs">Comments</span><textarea id="approver-comments" placeholder="Add comments..." rows="3" class="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm mt-1"></textarea></div>
        <div class="flex gap-3 pt-2">
          <button id="approve-btn" data-id="${r.id}" class="inline-flex items-center justify-center rounded-lg text-sm font-medium h-10 px-4 py-2 bg-green-600 text-white hover:bg-green-700 gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Approve
          </button>
          <button id="reject-btn" data-id="${r.id}" class="inline-flex items-center justify-center rounded-lg text-sm font-medium h-10 px-4 py-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg> Reject
          </button>
        </div>
      </div>
    </div>`;
  }

  const loadingContent = '<div class="space-y-6 animate-pulse"><div class="h-32 bg-muted rounded-xl"></div><div class="grid grid-cols-2 gap-6"><div class="h-64 bg-muted rounded-xl"></div><div class="h-64 bg-muted rounded-xl"></div></div></div>';
  const layout = appLayout(loadingContent);

  return {
    html: layout.html,
    async init() {
      layout.init();
      const main = document.querySelector('main');
      try {
        await loadData();
        main.innerHTML = buildContent();
        setupApprover();
      } catch { main.innerHTML = '<div class="p-6 text-muted-foreground">Failed to load.</div>' }
    },
  };

  function setupApprover() {
    document.querySelector('tbody')?.addEventListener('click', (e) => {
      const row = e.target.closest('[data-report-id]');
      if (!row) return;
      const id = row.dataset.reportId;
      selectedReport = reports.find(r => r.id == id);
      document.getElementById('detail-panel').innerHTML = renderDetail(selectedReport);
      document.getElementById('approve-btn')?.addEventListener('click', () => handleDecision('Approved'));
      document.getElementById('reject-btn')?.addEventListener('click', () => handleDecision('Rejected'));
    });

    async function handleDecision(decision) {
      if (!selectedReport) return;
      const btn = document.getElementById(decision === 'Approved' ? 'approve-btn' : 'reject-btn');
      btn.disabled = true;
      try {
        const user = await api.auth.me();
        const comments = document.getElementById('approver-comments')?.value || '';
        await api.inspectionReports.update(selectedReport.id, {
          status: decision, department_comments: comments,
          approved_by: user?.full_name || 'Approver',
          approval_date: new Date().toISOString().split('T')[0],
        });
        if (decision === 'Rejected') {
          await api.vehicles.update(selectedReport.vehicle_id, { status: 'Active' });
        }
        await api.notifications.create({
          message: `${decision === 'Approved' ? '✅' : '❌'} Inspection report for ${selectedReport.plate_number} has been ${decision.toLowerCase()} by ${user?.full_name || 'Approver'}`,
          type: 'approval', target_department: decision === 'Approved' ? 'Workshop' : 'Inspection',
        });
        selectedReport = null;
        await loadData();
        main.innerHTML = buildContent();
        setupApprover();
      } catch (err) {
        alert(err.message || 'Failed');
        btn.disabled = false;
      }
    }
  }
}
