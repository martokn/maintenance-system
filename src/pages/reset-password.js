import api from '../api.js';
import { navigate } from '../router.js';
import { authLayout } from '../components/shared.js';

const lockIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
const alertIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>';

export default function resetPasswordPage() {
  const params = new URLSearchParams(location.search);
  const resetToken = params.get('token');

  if (!resetToken) {
    return {
      html: authLayout(alertIcon, 'Invalid reset link', 'This password reset link is missing or invalid', `
        <p class="text-sm text-foreground text-center">The link you used appears to be incomplete. Please request a new password reset email.</p>
      `, `<a href="/forgot-password" class="text-primary font-medium hover:underline">Request a new link</a>`),
      init: () => {},
    };
  }

  return {
    html: authLayout(lockIcon, 'New password', 'Enter your new password below', `
      <div id="reset-error" class="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm" style="display:none"></div>
      <form id="reset-form" class="space-y-4">
        <div class="space-y-2">
          <label for="password" class="text-sm font-medium leading-none">New Password</label>
          <div class="relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <input id="password" type="password" autocomplete="new-password" autofocus placeholder="••••••••" required class="flex h-12 w-full rounded-lg border border-input bg-background px-3 py-2 pl-10 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          </div>
        </div>
        <div class="space-y-2">
          <label for="confirm" class="text-sm font-medium leading-none">Confirm Password</label>
          <div class="relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <input id="confirm" type="password" autocomplete="new-password" placeholder="••••••••" required class="flex h-12 w-full rounded-lg border border-input bg-background px-3 py-2 pl-10 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          </div>
        </div>
        <button type="submit" id="reset-btn" class="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none h-12 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 w-full font-medium">
          Reset password
        </button>
      </form>
    `),

    init() {
      const form = document.getElementById('reset-form');
      const errorDiv = document.getElementById('reset-error');
      const btn = document.getElementById('reset-btn');

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const password = document.getElementById('password').value;
        const confirm = document.getElementById('confirm').value;

        if (password !== confirm) {
          errorDiv.textContent = 'Passwords do not match';
          errorDiv.style.display = 'block';
          return;
        }

        errorDiv.style.display = 'none';
        btn.disabled = true;
        btn.innerHTML = '<svg class="animate-spin w-4 h-4 mr-2 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Resetting...';

        try {
          await api.auth.resetPassword({ resetToken, newPassword: password });
          navigate('/login');
        } catch (err) {
          errorDiv.textContent = err.message || 'Failed to reset password';
          errorDiv.style.display = 'block';
          btn.disabled = false;
          btn.textContent = 'Reset password';
        }
      });
    },
  };
}
