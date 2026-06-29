export function statCard(label, value, color = 'bg-primary') {
  const colorMap = {
    'bg-primary': 'text-primary', 'bg-green-600': 'text-green-600',
    'bg-orange-500': 'text-orange-500', 'bg-red-500': 'text-red-500',
    'bg-purple-600': 'text-purple-600', 'bg-blue-600': 'text-blue-600',
  };
  return `<div class="bg-card rounded-xl border border-border p-5 flex flex-col items-center justify-center text-center">
    <span class="text-3xl font-extrabold ${colorMap[color] || 'text-primary'}">${value}</span>
    <span class="text-xs text-muted-foreground mt-1 font-medium">${label}</span>
  </div>`;
}

export function badge(text, className = 'bg-gray-100 text-gray-600') {
  return `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}">${text}</span>`;
}

export function authLayout(iconSvg, title, subtitle, children, footer) {
  return `<div class="min-h-screen flex items-center justify-center bg-background px-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-10">
        ${iconSvg ? `<div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary mb-4">${iconSvg}</div>` : ''}
        <h1 class="text-3xl font-bold tracking-tight text-foreground">${title}</h1>
        ${subtitle ? `<p class="text-muted-foreground mt-2">${subtitle}</p>` : ''}
      </div>
      <div class="bg-card rounded-2xl shadow-sm border border-border p-8">${children}</div>
      ${footer ? `<p class="text-center text-sm text-muted-foreground mt-6">${footer}</p>` : ''}
    </div>
  </div>`;
}
