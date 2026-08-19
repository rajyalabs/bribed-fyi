export function ThemeScript() {
  const js = `(function(){try{var t=localStorage.getItem('theme');document.documentElement.setAttribute('data-theme',t||'light');}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: js }} />;
}
