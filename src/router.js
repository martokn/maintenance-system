const routes = {};
let currentCleanup = null;

export function register(path, renderFn) {
  routes[path] = renderFn;
}

export function navigate(path) {
  const base = '/fuel';
  const fullPath = base + path;
  history.pushState(null, '', fullPath);
  renderRoute();
}

export function renderRoute() {
  if (currentCleanup) currentCleanup();

  const base = '/fuel';
  let path = location.pathname;
  if (path.startsWith(base)) path = path.slice(base.length) || '/';

  const app = document.getElementById('app');

  const route = routes[path] || routes['*'] || (() => '<h1>404</h1>');
  const result = route();

  if (typeof result === 'string') {
    app.innerHTML = result;
    currentCleanup = null;
  } else if (typeof result === 'object') {
    app.innerHTML = result.html;
    if (result.init) { result.init(); currentCleanup = result.init }
  }
}

export function initRouter() {
  renderRoute();
  window.addEventListener('popstate', renderRoute);
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:')) {
      e.preventDefault();
      navigate(href);
    }
  });
}
