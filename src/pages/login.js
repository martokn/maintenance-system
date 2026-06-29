import api from '../api.js';
import { isAuthenticated, setUser, clearAuth } from '../auth.js';
import { navigate } from '../router.js';
import { authLayout } from '../components/shared.js';

const DESTINATIONS = [
  { id: 'inspection', label: 'Inspection Department', role: 'inspector', path: '/inspection' },
  { id: 'approver', label: 'Department Approver', role: 'approver', path: '/approver' },
  { id: 'workshop', label: 'Maintenance Workshop', role: 'mechanic', path: '/workshop' },
  { id: 'stores', label: 'Inventory / Stores', role: 'stores', path: '/stores' },
];

function getSavedDestination(email) {
  if (!email) return '';
  try { return localStorage.getItem('login_dest_' + email) || '' } catch { return '' }
}

function saveDestination(email, dest) {
  try { localStorage.setItem('login_dest_' + email, dest) } catch {}
}

const loginIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>';

export default function loginPage() {
  if (isAuthenticated()) {
    navigate('/');
    return { html: '', init: () => {} };
  }

  return {
    html: authLayout(loginIcon, 'Welcome back', 'Log in to your account', `
      <div id="login-error" class="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm" style="display:none"></div>
      <form id="login-form" class="space-y-4">
        <div class="space-y-2">
          <label for="email" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email</label>
          <div class="relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            <input id="email" type="email" autocomplete="email" placeholder="you@example.com" required class="flex h-12 w-full rounded-lg border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
          </div>
        </div>
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label for="password" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Password</label>
            <a href="/forgot-password" class="text-xs text-primary hover:underline">Forgot password?</a>
          </div>
          <div class="relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <input id="password" type="password" autocomplete="current-password" placeholder="••••••••" required class="flex h-12 w-full rounded-lg border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
          </div>
        </div>
        <div class="space-y-2">
          <label for="destination" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">I'm here to work in</label>
          <div class="relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
            <select id="destination" required class="flex h-12 w-full rounded-lg border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none">
              <option value="">Select your department...</option>
              ${DESTINATIONS.map(d => `<option value="${d.id}">${d.label}</option>`).join('')}
            </select>
          </div>
        </div>
        <button type="submit" id="login-btn" class="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none h-12 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 w-full font-medium">
          Log in
        </button>
      </form>
    `, `Don't have an account? <a href="/register" class="text-primary font-medium hover:underline">Create one</a>`),

    init() {
      const emailInput = document.getElementById('email');
      const destSelect = document.getElementById('destination');
      const errorDiv = document.getElementById('login-error');
      const form = document.getElementById('login-form');
      const btn = document.getElementById('login-btn');

      emailInput.addEventListener('input', () => {
        const saved = getSavedDestination(emailInput.value);
        if (saved) destSelect.value = saved;
      });

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = emailInput.value;
        const password = document.getElementById('password').value;
        const destination = destSelect.value;

        if (!destination) {
          errorDiv.textContent = 'Please select your department';
          errorDiv.style.display = 'block';
          return;
        }

        errorDiv.style.display = 'none';
        btn.disabled = true;
        btn.innerHTML = '<svg class="animate-spin w-4 h-4 mr-2 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Logging in...';

        try {
          const result = await api.auth.login(email, password);
          const user = result.user;
          const dest = DESTINATIONS.find(d => d.id === destination);

          if (user.role !== 'admin' && user.role !== dest?.role) {
            throw new Error('This account does not have access to ' + dest?.label);
          }

          api.token = result.token;
          api.user = user;
          setUser(user);
          saveDestination(email, destination);
          navigate(dest.path);
        } catch (err) {
          clearAuth();
          errorDiv.textContent = err.message || 'Invalid email or password';
          errorDiv.style.display = 'block';
          btn.disabled = false;
          btn.textContent = 'Log in';
        }
      });
    },
  };
}
