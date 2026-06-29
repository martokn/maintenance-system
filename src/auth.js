export function getUser() {
  const s = localStorage.getItem('auth_user');
  return s ? JSON.parse(s) : null;
}

export function isAuthenticated() {
  return !!localStorage.getItem('auth_token') && !!localStorage.getItem('auth_user');
}

export function setUser(u) {
  localStorage.setItem('auth_user', JSON.stringify(u));
}

export function clearAuth() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
}

export function navigateToLogin() {
  clearAuth();
  window.location.href = '/fuel/login';
}
