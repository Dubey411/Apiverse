try {
  var storedTheme = localStorage.getItem('apiverse-theme') || localStorage.getItem('apishop-theme');
  var theme = storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : 'dark';
  document.documentElement.classList.toggle('dark', theme === 'dark');
} catch {
  document.documentElement.classList.add('dark');
}
