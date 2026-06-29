import api from '../api.js';
import { appLayout } from '../components/layout.js';
import { statCard } from '../components/shared.js';

const workflowSteps = [
  { num: 1, title: 'Inspection Department', color: 'bg-primary', items: ['Inspect Vehicle', 'Create Inspection Report', 'Attach Photos & Findings', 'Submit to Department'], doc: 'Inspection Report' },
  { num: 2, title: 'Department Approver', color: 'bg-green-600', items: ['Receive Inspection Report', 'Verify Vehicle Ownership', 'Approve or Reject', 'Send Decision Back'], doc: 'Approval / Rejection Document' },
  { num: 3, title: 'Maintenance Workshop', color: 'bg-orange-500', items: ['Receive Approved Report', 'Create Job Card', 'Request Parts from Stores', 'Perform Repair'], doc: 'Parts Request Document' },
  { num: 4, title: 'Inventory / Stores', color: 'bg-purple-700', items: ['Receive Parts Request', 'Check Stock Availability', 'Issue Parts', 'Deduct Stock'], doc: 'Completion Report' },
];

function workflowHtml() {
  return `<div class="bg-card rounded-xl border border-border p-6">
    <h3 class="text-sm font-bold text-primary uppercase tracking-wider mb-5">Workflow Overview</h3>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      ${workflowSteps.map((step, i) => `<div class="relative">
        <div class="${step.color} rounded-lg p-4 text-white">
          <div class="flex items-center gap-2 mb-3">
            <span class="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">${step.num}</span>
            <span class="text-xs font-bold uppercase tracking-wide">${step.title}</span>
          </div>
          <ul class="space-y-1">${step.items.map(item => `<li class="text-[11px] text-white/80 flex items-start gap-1.5"><span class="mt-1 w-1 h-1 rounded-full bg-white/50 flex-shrink-0"></span>${item}</li>`).join('')}</ul>
          <p class="text-[10px] text-white/50 mt-3 pt-2 border-t border-white/20">${step.doc}</p>
        </div>
        ${i < 3 ? `<div class="hidden md:flex absolute top-1/2 -right-3 z-10 w-6 h-6 rounded-full bg-muted border border-border items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </div>` : ''}
      </div>`).join('')}
    </div>
  </div>`;
}

function fullContent(data) {
  const { vehicles, reports, jobs, inventory, notifications } = data;
  const inMaintenance = vehicles.filter(v => v.status === 'In Maintenance').length;
  const lowStock = inventory.filter(i => i.quantity_in_stock <= i.reorder_level).length;

  return `<div class="space-y-6">
    ${workflowHtml()}
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <a href="/inspection" class="group"><div class="bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow">
        <div class="bg-primary rounded-t-xl px-5 py-3 flex items-center gap-3"><span class="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold text-white">1</span><h2 class="text-sm font-bold text-white uppercase tracking-wider">Inspection Department</h2></div>
        <div class="p-4 grid grid-cols-3 gap-3">
          ${statCard('Pending', reports.filter(r => r.status === 'Awaiting Approval').length, 'bg-primary')}
          ${statCard('Approved', reports.filter(r => r.status === 'Approved').length, 'bg-green-600')}
          ${statCard('Completed', reports.filter(r => ['Completed', 'Verified'].includes(r.status)).length, 'bg-blue-600')}
        </div>
      </div></a>
      <a href="/approver" class="group"><div class="bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow">
        <div class="bg-green-600 rounded-t-xl px-5 py-3 flex items-center gap-3"><span class="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold text-white">2</span><h2 class="text-sm font-bold text-white uppercase tracking-wider">Department Approver</h2></div>
        <div class="p-4 grid grid-cols-3 gap-3">
          ${statCard('Pending', reports.filter(r => r.status === 'Awaiting Approval').length, 'bg-orange-500')}
          ${statCard('Approved', reports.filter(r => r.status === 'Approved').length, 'bg-green-600')}
          ${statCard('Rejected', reports.filter(r => r.status === 'Rejected').length, 'bg-red-500')}
        </div>
      </div></a>
      <a href="/workshop" class="group"><div class="bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow">
        <div class="bg-orange-500 rounded-t-xl px-5 py-3 flex items-center gap-3"><span class="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold text-white">3</span><h2 class="text-sm font-bold text-white uppercase tracking-wider">Maintenance Workshop</h2></div>
        <div class="p-4 grid grid-cols-3 gap-3">
          ${statCard('In Progress', jobs.filter(j => j.status === 'In Progress').length, 'bg-orange-500')}
          ${statCard('Awaiting Parts', jobs.filter(j => j.status === 'Awaiting Parts').length, 'bg-purple-600')}
          ${statCard('Completed', jobs.filter(j => ['Completed', 'Verified'].includes(j.status)).length, 'bg-green-600')}
        </div>
      </div></a>
      <a href="/stores" class="group"><div class="bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow">
        <div class="bg-purple-700 rounded-t-xl px-5 py-3 flex items-center gap-3"><span class="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold text-white">4</span><h2 class="text-sm font-bold text-white uppercase tracking-wider">Inventory / Stores</h2></div>
        <div class="p-4 grid grid-cols-3 gap-3">
          ${statCard('Parts In Stock', inventory.reduce((s, i) => s + (i.quantity_in_stock || 0), 0), 'bg-purple-600')}
          ${statCard('Items', inventory.length, 'bg-blue-600')}
          ${statCard('Low Stock', lowStock, 'bg-red-500')}
        </div>
      </div></a>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="bg-card rounded-xl border border-border p-5">
        <h4 class="text-sm font-bold uppercase tracking-wider mb-4">Notifications</h4>
        <div class="space-y-3">
          ${notifications.length === 0 ? '<p class="text-sm text-muted-foreground">No notifications yet.</p>' :
            notifications.map(n => `<div class="flex items-start gap-3 text-sm">
              <div class="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
              <div><p class="text-foreground">${n.message}</p><p class="text-xs text-muted-foreground">${n.created_date ? new Date(n.created_date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : ''}</p></div>
            </div>`).join('')}
        </div>
      </div>
      <div class="bg-card rounded-xl border border-border p-5">
        <h4 class="text-sm font-bold uppercase tracking-wider mb-4">System Summary</h4>
        <div class="grid grid-cols-4 gap-4">
          ${statCard('Total Vehicles', vehicles.length, 'bg-primary')}
          ${statCard('In Maintenance', inMaintenance, 'bg-orange-500')}
          ${statCard('Parts In Stock', inventory.reduce((s, i) => s + (i.quantity_in_stock || 0), 0), 'bg-green-600')}
          ${statCard('Low Stock', lowStock, 'bg-red-500')}
        </div>
        <div class="mt-4 pt-4 border-t border-border">
          <p class="text-xs font-semibold text-muted-foreground mb-2">Quick Links</p>
          <div class="flex flex-wrap gap-2">
            <a href="/inspection" class="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors font-medium"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg> Vehicle Search</a>
            <a href="/inspection" class="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors font-medium"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg> Inspection Reports</a>
            <a href="/workshop" class="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors font-medium"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="10" x2="21" y1="6" y2="6"/><line x1="10" x2="21" y1="12" y2="12"/><line x1="10" x2="21" y1="18" y2="18"/><polyline points="3 6 4 7 6 5"/><polyline points="3 12 4 13 6 11"/><polyline points="3 18 4 19 6 17"/></svg> Work Orders</a>
            <a href="/stores" class="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors font-medium"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg> Stock Report</a>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

export default function dashboardPage() {
  const loadingContent = '<div class="space-y-6"><div class="bg-card rounded-xl border border-border p-6 animate-pulse"><div class="h-4 bg-muted rounded w-1/4 mb-5"></div><div class="grid grid-cols-4 gap-4">'.concat('<div class="h-32 bg-muted rounded-lg"></div>'.repeat(4), '</div></div><div class="grid grid-cols-4 gap-4">', '<div class="h-40 bg-muted rounded-xl"></div>'.repeat(4), '</div></div>');
  const layout = appLayout(loadingContent);

  return {
    html: layout.html,
    async init() {
      layout.init();
      const main = document.querySelector('main');
      try {
        const [vehicles, reports, jobs, inventory, notifications] = await Promise.all([
          api.vehicles.list().catch(() => []),
          api.inspectionReports.list().catch(() => []),
          api.jobCards.list().catch(() => []),
          api.inventory.list().catch(() => []),
          api.notifications.list('-created_date', 5).catch(() => []),
        ]);
        main.innerHTML = fullContent({ vehicles, reports, jobs, inventory, notifications });
      } catch {
        main.innerHTML = '<div class="p-6 text-center text-muted-foreground">Failed to load dashboard data.</div>';
      }
    },
  };
}
