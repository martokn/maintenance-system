import './index.css';
import { initRouter, register } from './router.js';
import { isAuthenticated, navigateToLogin } from './auth.js';
import loginPage from './pages/login.js';
import registerPage from './pages/register.js';
import forgotPasswordPage from './pages/forgot-password.js';
import resetPasswordPage from './pages/reset-password.js';
import dashboardPage from './pages/dashboard.js';
import inspectionPage from './pages/inspection.js';
import approverPage from './pages/approver.js';
import workshopPage from './pages/workshop.js';
import storesPage from './pages/stores.js';
import notFoundPage from './pages/not-found.js';

function requireAuth(path, pageFn) {
  register(path, () => {
    if (!isAuthenticated()) {
      navigateToLogin();
      return { html: '', init: () => {} };
    }
    return pageFn();
  });
}

register('/login', () => loginPage());
register('/register', () => registerPage());
register('/forgot-password', () => forgotPasswordPage());
register('/reset-password', () => resetPasswordPage());

requireAuth('/', () => dashboardPage());
requireAuth('/inspection', () => inspectionPage());
requireAuth('/approver', () => approverPage());
requireAuth('/workshop', () => workshopPage());
requireAuth('/stores', () => storesPage());

register('*', () => notFoundPage());

initRouter();
