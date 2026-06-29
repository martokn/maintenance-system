import api from '../api.js';
import { appLayout } from '../components/layout.js';
import { statCard, badge } from '../components/shared.js';

export default function storesPage() {
  let view = 'requests';
  let partsRequests = [];
  let inventory = [];

  async function loadData() {
    [partsRequests, inventory] = await Promise.all([
      api.partsRequests.list('-created_date').catch(() => []),
      api.inventory.list().catch(() => []),
    ]);
  }

  function buildContent() {
    const pending = partsRequests.filter(r => r.status === 'Pending').length;
    const issued = partsRequests.filter(r => r.status === 'Issued').length;
    const lowStock = inventory.filter(i => i.quantity_in_stock <= i.reorder_level).length;
    const isActive = (v) => v === view ? 'bg-primary text-primary-foreground' : 'border border-input bg-background hover:bg-muted';

    return `<div class="space-y-6">
      <div class="bg-card rounded-xl border border-border overflow-hidden">
        <div class="bg-purple-700 rounded-t-xl px-5 py-3 flex items-center gap-3">
          <span class="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold text-white">4</span>
          <h2 class="text-sm font-bold text-white uppercase tracking-wider">Inventory / Stores Portal</h2>
        </div>
        <div class="p-5">
          <div class="grid grid-cols-3 gap-4 mb-5">
            ${statCard('Pending Requests', pending, 'bg-orange-500')}
            ${statCard('Parts Issued Today', issued, 'bg-green-600')}
            ${statCard('Low Stock Items', lowStock, 'bg-red-500')}
          </div>
          <div class="flex gap-3" id="view-buttons">
            <button data-view="requests" class="inline-flex items-center justify-center rounded-lg text-sm font-medium h-10 px-4 py-2 ${isActive('requests')} gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg> Parts Requests
            </button>
            <button data-view="stock" class="inline-flex items-center justify-center rounded-lg text-sm font-medium h-10 px-4 py-2 ${isActive('stock')} gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5.08 8.7-5"/><path d="M12 22V12"/></svg> Stock Management
            </button>
          </div>
        </div>
      </div>
      <div id="view-content"></div>
    </div>`;
  }

  function renderRequests() {
    const pending = partsRequests.filter(r => r.status === 'Pending');
    return `<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-card rounded-xl border border-border overflow-hidden">
        <div class="p-4 border-b border-border"><h3 class="text-sm font-bold uppercase tracking-wider">Pending Parts Requests</h3></div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead><tr class="bg-muted">
              <th class="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Request No.</th>
              <th class="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">From</th>
              <th class="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Job No.</th>
              <th class="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Date</th>
              <th class="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Status</th>
            </tr></thead>
            <tbody>${pending.length === 0 ? '<tr><td colspan="5" class="py-8 text-center text-muted-foreground">No pending requests.</td></tr>' :
              pending.map(r => `<tr class="border-b border-border/50 cursor-pointer transition-colors hover:bg-muted/50" data-req-id="${r.id}">
                <td class="py-2.5 px-3 font-semibold">${r.request_number}</td>
                <td class="py-2.5 px-3">${r.requested_by}</td>
                <td class="py-2.5 px-3">${r.job_number}</td>
                <td class="py-2.5 px-3">${r.request_date ? new Date(r.request_date).toLocaleDateString('en-GB') : '-'}</td>
                <td class="py-2.5 px-3">${badge(r.status, 'bg-amber-100 text-amber-700')}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
      <div class="bg-card rounded-xl border border-border p-5" id="req-detail">
        <div class="h-full flex items-center justify-center text-muted-foreground text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5.08 8.7-5"/><path d="M12 22V12"/></svg>
          Select a request to review
        </div>
      </div>
    </div>`;
  }

  function renderReqDetail(r) {
    return `<div class="space-y-4">
      <h3 class="text-sm font-bold uppercase tracking-wider">Request Details: ${r.request_number}</h3>
      <div class="text-sm space-y-2">
        <p><span class="text-muted-foreground">Requested By:</span> ${r.requested_by}</p>
        <p><span class="text-muted-foreground">Job No.:</span> ${r.job_number}</p>
      </div>
      <div>
        <h4 class="text-xs font-semibold text-muted-foreground mb-2">Requested Parts:</h4>
        <table class="w-full text-sm">
          <thead><tr class="bg-muted">
            <th class="text-left py-1.5 px-3 text-xs">Part Name</th>
            <th class="text-left py-1.5 px-3 text-xs">Quantity</th>
            <th class="text-left py-1.5 px-3 text-xs">Available Stock</th>
          </tr></thead>
          <tbody>${(r.items || []).map(item => {
            const stock = inventory.find(s => s.part_name?.toLowerCase() === item.part_name?.toLowerCase());
            return `<tr class="border-b border-border/50">
              <td class="py-1.5 px-3">${item.part_name}</td>
              <td class="py-1.5 px-3">${item.quantity}</td>
              <td class="py-1.5 px-3 font-semibold">${stock?.quantity_in_stock ?? 'N/A'}${stock?.unit ? ` ${stock.unit}` : ''}</td>
            </tr>`;
          }).join('')}
          </tbody>
        </table>
      </div>
      <div class="flex gap-3 pt-2">
        <button id="issue-btn" data-id="${r.id}" class="inline-flex items-center justify-center rounded-lg text-sm font-medium h-10 px-4 py-2 bg-green-600 text-white hover:bg-green-700 gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Approve & Issue
        </button>
        <button id="reject-req-btn" data-id="${r.id}" class="inline-flex items-center justify-center rounded-lg text-sm font-medium h-10 px-4 py-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg> Reject
        </button>
      </div>
    </div>`;
  }

  function renderStock() {
    const categories = ['Brakes', 'Engine', 'Electrical', 'Body', 'Suspension', 'Fluids', 'Filters', 'Tyres', 'Other'];
    const units = ['Pieces', 'Litres', 'Sets', 'Metres', 'Kg'];
    return `<div class="bg-card rounded-xl border border-border overflow-hidden">
      <div class="p-4 border-b border-border flex items-center justify-between">
        <h3 class="text-sm font-bold uppercase tracking-wider">Stock Management</h3>
        <div class="flex gap-3">
          <div class="relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input id="stock-search" placeholder="Search parts..." class="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 pl-10 text-sm w-56">
          </div>
          <button id="add-stock-btn" class="inline-flex items-center justify-center rounded-lg text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg> Add Item
          </button>
        </div>
      </div>
      <div id="stock-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div class="bg-card rounded-xl border border-border w-full max-w-lg p-6">
          <h3 class="text-lg font-bold mb-4">Add New Stock Item</h3>
          <div class="space-y-4">
            <div><label class="text-sm font-medium leading-none mb-2 block">Part Name</label><input id="new-part-name" class="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
            <div><label class="text-sm font-medium leading-none mb-2 block">Part Number</label><input id="new-part-number" class="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
            <div class="grid grid-cols-2 gap-3">
              <div><label class="text-sm font-medium leading-none mb-2 block">Category</label>
                <select id="new-category" class="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm appearance-none">${categories.map(c => `<option value="${c}">${c}</option>`).join('')}</select>
              </div>
              <div><label class="text-sm font-medium leading-none mb-2 block">Unit</label>
                <select id="new-unit" class="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm appearance-none">${units.map(u => `<option value="${u}">${u}</option>`).join('')}</select>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-3">
              <div><label class="text-sm font-medium leading-none mb-2 block">Quantity</label><input id="new-qty" type="number" value="0" class="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
              <div><label class="text-sm font-medium leading-none mb-2 block">Reorder Level</label><input id="new-reorder" type="number" value="5" class="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
              <div><label class="text-sm font-medium leading-none mb-2 block">Unit Cost</label><input id="new-cost" type="number" value="0" class="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
            </div>
            <div><label class="text-sm font-medium leading-none mb-2 block">Location</label><input id="new-location" placeholder="e.g. Shelf A-3" class="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"></div>
            <div class="flex gap-3">
              <button id="save-stock-btn" class="inline-flex items-center justify-center rounded-lg text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 w-full">Add Stock Item</button>
              <button id="close-modal-btn" class="inline-flex items-center justify-center rounded-lg text-sm font-medium h-10 px-4 py-2 border border-input bg-background hover:bg-muted w-full">Cancel</button>
            </div>
          </div>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead><tr class="bg-muted">
            <th class="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Part Name</th>
            <th class="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Part No.</th>
            <th class="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Category</th>
            <th class="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">In Stock</th>
            <th class="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Reorder</th>
            <th class="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Status</th>
            <th class="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Action</th>
          </tr></thead>
          <tbody id="stock-body">${inventory.map(i => {
            const isLow = i.quantity_in_stock <= i.reorder_level;
            return `<tr class="border-b border-border/50 hover:bg-muted/30">
              <td class="py-2.5 px-3 font-semibold">${i.part_name}</td>
              <td class="py-2.5 px-3">${i.part_number || '-'}</td>
              <td class="py-2.5 px-3">${i.category}</td>
              <td class="py-2.5 px-3 font-semibold">${i.quantity_in_stock} ${i.unit}</td>
              <td class="py-2.5 px-3">${i.reorder_level}</td>
              <td class="py-2.5 px-3">${badge(isLow ? 'Low Stock' : 'In Stock', isLow ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700')}</td>
              <td class="py-2.5 px-3"><button data-receive-id="${i.id}" class="inline-flex items-center justify-center rounded-lg text-xs font-medium h-8 px-3 border border-input bg-background hover:bg-muted">Receive</button></td>
            </tr>`;
          }).join('')}
          ${inventory.length === 0 ? '<tr><td colspan="7" class="py-8 text-center text-muted-foreground">No inventory items found.</td></tr>' : ''}
          </tbody>
        </table>
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
        b.className = `inline-flex items-center justify-center rounded-lg text-sm font-medium h-10 px-4 py-2 ${b.dataset.view === view ? 'bg-primary text-primary-foreground' : 'border border-input bg-background hover:bg-muted'} gap-2`;
      });
      renderCurrentView();
    });
  }

  function renderCurrentView() {
    const container = document.getElementById('view-content');
    if (!container) return;
    if (view === 'requests') {
      container.innerHTML = renderRequests();
      setupRequests();
    } else {
      container.innerHTML = renderStock();
      setupStock();
    }
  }

  function setupRequests() {
    let selected = null;
    document.querySelector('tbody')?.addEventListener('click', (e) => {
      const row = e.target.closest('[data-req-id]');
      if (!row) return;
      selected = partsRequests.find(r => r.id == row.dataset.reqId);
      document.getElementById('req-detail').innerHTML = renderReqDetail(selected);
      document.getElementById('issue-btn')?.addEventListener('click', async () => {
        if (!selected) return;
        const btn = document.getElementById('issue-btn');
        btn.disabled = true;
        try {
          const user = await api.auth.me();
          const voucherNum = `IV-${Date.now().toString().slice(-6)}`;
          for (const item of selected.items || []) {
            const stockItem = inventory.find(s => s.part_name?.toLowerCase() === item.part_name?.toLowerCase());
            if (stockItem) {
              await api.inventory.update(stockItem.id, { quantity_in_stock: Math.max(0, (stockItem.quantity_in_stock || 0) - (item.quantity || 0)) });
            }
          }
          await api.partsRequests.update(selected.id, {
            status: 'Issued', approved_by: user?.full_name || 'Stores',
            issue_date: new Date().toISOString().split('T')[0], voucher_number: voucherNum,
            items: (selected.items || []).map(i => ({ ...i, status: 'Issued' })),
          });
          if (selected.job_card_id) await api.jobCards.update(selected.job_card_id, { status: 'In Progress' });
          await api.notifications.create({ message: `Parts issued (Voucher: ${voucherNum}) for Job ${selected.job_number}. Stock deducted.`, type: 'parts', target_department: 'Workshop' });
          selected = null;
          await loadData();
          document.querySelector('main').innerHTML = buildContent();
          setupViewButtons();
          renderCurrentView();
        } catch (err) { alert(err.message || 'Failed'); btn.disabled = false; }
      });
      document.getElementById('reject-req-btn')?.addEventListener('click', async () => {
        if (!selected) return;
        const btn = document.getElementById('reject-req-btn');
        btn.disabled = true;
        try {
          await api.partsRequests.update(selected.id, { status: 'Rejected' });
          selected = null;
          await loadData();
          document.querySelector('main').innerHTML = buildContent();
          setupViewButtons();
          renderCurrentView();
        } catch (err) { alert(err.message || 'Failed'); btn.disabled = false; }
      });
    });
  }

  function setupStock() {
    const searchInput = document.getElementById('stock-search');
    const tbody = document.getElementById('stock-body');
    if (searchInput && tbody) {
      filterStock('', tbody);
      searchInput.addEventListener('input', () => filterStock(searchInput.value.toLowerCase(), tbody));
    }

    document.querySelector('[data-receive-id]')?.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.receiveId;
      const item = inventory.find(i => i.id == id);
      const qty = prompt('Enter quantity to receive:');
      if (!qty || isNaN(qty)) return;
      api.inventory.update(id, { quantity_in_stock: (item.quantity_in_stock || 0) + parseInt(qty) }).then(() => loadData().then(() => {
        document.querySelector('main').innerHTML = buildContent();
        setupViewButtons();
        renderCurrentView();
      })).catch(err => alert(err.message));
    });

    document.getElementById('add-stock-btn')?.addEventListener('click', () => {
      document.getElementById('stock-modal').classList.remove('hidden');
    });
    document.getElementById('close-modal-btn')?.addEventListener('click', () => {
      document.getElementById('stock-modal').classList.add('hidden');
    });
    document.getElementById('save-stock-btn')?.addEventListener('click', async () => {
      const name = document.getElementById('new-part-name').value;
      if (!name) { alert('Part name is required.'); return; }
      const btn = document.getElementById('save-stock-btn');
      btn.disabled = true;
      try {
        await api.inventory.create({
          part_name: name, part_number: document.getElementById('new-part-number').value,
          category: document.getElementById('new-category').value,
          quantity_in_stock: parseInt(document.getElementById('new-qty').value) || 0,
          unit: document.getElementById('new-unit').value,
          reorder_level: parseInt(document.getElementById('new-reorder').value) || 5,
          unit_cost: parseFloat(document.getElementById('new-cost').value) || 0,
          location: document.getElementById('new-location').value,
        });
        document.getElementById('stock-modal').classList.add('hidden');
        await loadData();
        document.querySelector('main').innerHTML = buildContent();
        setupViewButtons();
        renderCurrentView();
      } catch (err) { alert(err.message || 'Failed'); btn.disabled = false; }
    });
  }

  function filterStock(q, tbody) {
    const filtered = inventory.filter(i =>
      i.part_name?.toLowerCase().includes(q) || i.part_number?.toLowerCase().includes(q)
    );
    tbody.innerHTML = filtered.map(i => {
      const isLow = i.quantity_in_stock <= i.reorder_level;
      return `<tr class="border-b border-border/50 hover:bg-muted/30">
        <td class="py-2.5 px-3 font-semibold">${i.part_name}</td>
        <td class="py-2.5 px-3">${i.part_number || '-'}</td>
        <td class="py-2.5 px-3">${i.category}</td>
        <td class="py-2.5 px-3 font-semibold">${i.quantity_in_stock} ${i.unit}</td>
        <td class="py-2.5 px-3">${i.reorder_level}</td>
        <td class="py-2.5 px-3">${badge(isLow ? 'Low Stock' : 'In Stock', isLow ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700')}</td>
        <td class="py-2.5 px-3"><button data-receive-id="${i.id}" class="inline-flex items-center justify-center rounded-lg text-xs font-medium h-8 px-3 border border-input bg-background hover:bg-muted">Receive</button></td>
      </tr>`;
    }).join('') || '<tr><td colspan="7" class="py-8 text-center text-muted-foreground">No inventory items found.</td></tr>';
  }
}
