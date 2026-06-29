import { getUser, clearAuth } from '../auth.js';
import { navigate } from '../router.js';

const roleLabels = {
  admin: 'System Administrator', inspector: 'Inspection Department',
  department_approver: 'Department Approver', workshop: 'Maintenance Workshop', stores: 'Inventory / Stores',
};

const navItems = [
  { label: 'Dashboard', path: '/', icon: 'layout-dashboard' },
  { label: 'Inspection Department', path: '/inspection', icon: 'clipboard-check' },
  { label: 'Department Approver', path: '/approver', icon: 'building-2' },
  { label: 'Maintenance Workshop', path: '/workshop', icon: 'wrench' },
  { label: 'Inventory / Stores', path: '/stores', icon: 'package' },
];

const icons = {
  'layout-dashboard': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
  'clipboard-check': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>',
  'building-2': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>',
  wrench: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
  package: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5.08 8.7-5"/><path d="M12 22V12"/></svg>',
  bell: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>',
  user: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  'chevron-left': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
  'chevron-right': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
  'log-out': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>',
  shield: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>',
};

export function appLayout(contentFn) {
  const user = getUser();
  const path = location.pathname.replace('/fuel', '') || '/';
  let collapsed = false;

  function contentHtml() {
    if (typeof contentFn === 'function') return contentFn();
    if (typeof contentFn === 'string') return contentFn;
    return '';
  }

  function sidebarHtml() {
    const c = collapsed;
    let items = navItems.map(item => `<a href="${item.path}" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${path === item.path ? 'bg-sidebar-accent text-sidebar-primary' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'}">
      ${icons[item.icon]}${c ? '' : `<span class="truncate">${item.label}</span>`}
    </a>`).join('\n');
    return `<aside class="fixed left-0 top-0 h-full bg-sidebar text-sidebar-foreground z-40 flex flex-col transition-all duration-300 ${c ? 'w-16' : 'w-60'}">
      <div class="p-4 border-b border-sidebar-border">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center flex-shrink-0">${icons.shield}</div>
          ${c ? '' : '<div class="min-w-0"><h1 class="text-xs font-bold uppercase tracking-wider text-sidebar-primary">County</h1><p class="text-[10px] text-sidebar-foreground/60 uppercase tracking-wide">Government</p></div>'}
        </div>
      </div>
      <nav class="flex-1 py-4 space-y-1 px-2 overflow-y-auto">${items}</nav>
      <div class="p-2 border-t border-sidebar-border space-y-1">
        <button id="sidebar-toggle" class="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent/50 transition-colors">
          ${c ? icons['chevron-right'] : icons['chevron-left']}${c ? '' : '<span>Collapse</span>'}
        </button>
        <button id="sidebar-logout" class="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-sidebar-foreground/60 hover:bg-destructive/20 hover:text-destructive transition-colors">
          ${icons['log-out']}${c ? '' : '<span>Logout</span>'}
        </button>
      </div>
    </aside>`;
  }

  function topbarHtml() {
    const u = user || {};
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    return `<header class="h-14 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-30">
      <div>
        <h2 class="text-lg font-bold text-foreground tracking-tight">COUNTY VEHICLE MAINTENANCE MANAGEMENT SYSTEM</h2>
        <p class="text-xs text-muted-foreground -mt-0.5">Four Department Workflow — Inspection → Approval → Maintenance → Inventory → Completion</p>
      </div>
      <div class="flex items-center gap-4">
        <span class="text-xs text-muted-foreground">${dateStr} | ${timeStr}</span>
        <button class="relative p-2 rounded-lg hover:bg-muted transition-colors">${icons.bell}</button>
        <div class="flex items-center gap-2 pl-3 border-l border-border">
          <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center">${icons.user}</div>
          <div class="text-right">
            <p class="text-xs font-semibold">${u.full_name || 'User'}</p>
            <p class="text-[10px] text-muted-foreground">${roleLabels[u.role] || 'Inspector'}</p>
          </div>
        </div>
      </div>
    </header>`;
  }

  return {
    html: `<div class="min-h-screen bg-background">${sidebarHtml()}<div class="transition-all duration-300 ml-60">${topbarHtml()}<main class="p-6">${contentHtml()}</main></div></div>`,
    init() {
      document.getElementById('sidebar-toggle')?.addEventListener('click', () => {
        collapsed = !collapsed;
        const sidebar = document.querySelector('aside');
        const content = document.querySelector('aside + div');
        if (sidebar) sidebar.className = `fixed left-0 top-0 h-full bg-sidebar text-sidebar-foreground z-40 flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`;
        if (content) content.className = `transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-60'}`;
      });
      document.getElementById('sidebar-logout')?.addEventListener('click', () => {
        fetch('/api/auth/logout').catch(() => {});
        clearAuth();
        window.location.href = '/fuel/login';
      });
    },
  };
}
