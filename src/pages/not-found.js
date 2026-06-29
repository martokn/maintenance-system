import { isAuthenticated } from '../auth.js';
import { appLayout } from '../components/layout.js';

export default function notFoundPage() {
  const pageName = location.pathname.replace('/fuel/', '') || '/';

  if (isAuthenticated()) {
    const layout = appLayout(`<div class="min-h-[60vh] flex items-center justify-center">
      <div class="text-center space-y-6 max-w-md">
        <div class="space-y-2">
          <h1 class="text-7xl font-light text-slate-300">404</h1>
          <div class="h-0.5 w-16 bg-slate-200 mx-auto"></div>
        </div>
        <div class="space-y-3">
          <h2 class="text-2xl font-medium text-slate-800">Page Not Found</h2>
          <p class="text-slate-600 leading-relaxed">The page <span class="font-medium text-slate-700">"${pageName}"</span> could not be found in this application.</p>
        </div>
        <div class="pt-6">
          <a href="/" class="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Go Home
          </a>
        </div>
      </div>
    </div>`);
    return layout;
  }

  return {
    html: `<div class="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div class="text-center space-y-6 max-w-md">
        <div class="space-y-2">
          <h1 class="text-7xl font-light text-slate-300">404</h1>
          <div class="h-0.5 w-16 bg-slate-200 mx-auto"></div>
        </div>
        <div class="space-y-3">
          <h2 class="text-2xl font-medium text-slate-800">Page Not Found</h2>
          <p class="text-slate-600 leading-relaxed">The page <span class="font-medium text-slate-700">"${pageName}"</span> could not be found in this application.</p>
        </div>
        <div class="pt-6">
          <a href="/login" class="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors">Go to Login</a>
        </div>
      </div>
    </div>`,
    init: () => {},
  };
}
