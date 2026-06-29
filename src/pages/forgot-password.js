import { authLayout } from '../components/shared.js';

const mailIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>';

export default function forgotPasswordPage() {
  let sent = false;

  return {
    html: authLayout(mailIcon, 'Reset password', "We'll send you a link to reset it", `
      <div id="forgot-content">
        ${sent ? `<p class="text-sm text-foreground text-center">If an account exists with that email, you'll receive a password reset link shortly.</p>`
        : `<form id="forgot-form" class="space-y-4">
          <div class="space-y-2">
            <label for="email" class="text-sm font-medium leading-none">Email address</label>
            <div class="relative">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              <input id="email" type="email" autocomplete="email" autofocus placeholder="you@example.com" required class="flex h-12 w-full rounded-lg border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            </div>
          </div>
          <button type="submit" id="forgot-btn" class="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none h-12 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 w-full font-medium">
            Send reset link
          </button>
        </form>`}
      </div>
    `, `<a href="/login" class="text-primary font-medium hover:underline"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline mr-1"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>Back to log in</a>`),

    init() {
      const form = document.getElementById('forgot-form');
      if (!form) return;
      const btn = document.getElementById('forgot-btn');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        btn.disabled = true;
        btn.innerHTML = '<svg class="animate-spin w-4 h-4 mr-2 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Sending...';
        setTimeout(() => {
          document.getElementById('forgot-content').innerHTML = '<p class="text-sm text-foreground text-center">If an account exists with that email, you\'ll receive a password reset link shortly.</p>';
        }, 500);
      });
    },
  };
}
