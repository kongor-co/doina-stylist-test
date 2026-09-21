const html = document.documentElement;
const lang = html.lang;
try { localStorage.setItem('doina-lang', lang); } catch (error) { /* Storage is optional. */ }

const themeToggle = document.querySelector('[data-theme-toggle]');
function updateThemeLabel() {
  if (!themeToggle) return;
  const isDark = html.dataset.theme === 'dark';
  const label = themeToggle.querySelector('.theme-label');
  if (label) label.textContent = isDark ? themeToggle.dataset.labelLight : themeToggle.dataset.labelDark;
  themeToggle.setAttribute('aria-pressed', String(isDark));
}
updateThemeLabel();
themeToggle?.addEventListener('click', () => {
  const next = html.dataset.theme === 'dark' ? 'light' : 'dark';
  html.dataset.theme = next;
  try { localStorage.setItem('doina-theme', next); } catch (error) { /* Storage is optional. */ }
  updateThemeLabel();
});

const menuToggle = document.querySelector('[data-menu-toggle]');
const mobileNav = document.querySelector('#mobile-nav');
menuToggle?.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? menuToggle.dataset.labelClose : menuToggle.dataset.labelOpen);
  mobileNav.hidden = !open;
});
mobileNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  mobileNav.hidden = true;
  menuToggle?.setAttribute('aria-expanded', 'false');
}));

function setupTabs(container) {
  const tabs = [...container.querySelectorAll('[role="tab"]')];
  const type = container.dataset.tabs;
  function activate(tab) {
    tabs.forEach((item) => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
    });
    if (type === 'services') {
      const filter = tab.dataset.filter;
      const panel = document.querySelector('#services-panel');
      panel.setAttribute('aria-labelledby', tab.id);
      panel.querySelectorAll('[data-category]').forEach((card) => {
        card.hidden = filter !== 'all' && card.dataset.category !== filter;
      });
    }
    if (type === 'media') {
      document.querySelector('#media-photos').hidden = tab.id !== 'media-tab-photos';
      document.querySelector('#media-videos').hidden = tab.id !== 'media-tab-videos';
    }
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab));
    tab.addEventListener('keydown', (event) => {
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      activate(tabs[next]);
      tabs[next].focus();
    });
  });
}
document.querySelectorAll('[data-tabs]').forEach(setupTabs);

const serviceFromHash = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
if (serviceFromHash?.matches('.service-card')) {
  serviceFromHash.open = true;
  requestAnimationFrame(() => serviceFromHash.scrollIntoView({ block: 'start' }));
}

const lightbox = document.querySelector('[data-lightbox]');
const galleryData = document.querySelector('#gallery-data');
if (lightbox && galleryData) {
  const items = JSON.parse(galleryData.textContent);
  const photo = lightbox.querySelector('img');
  const caption = lightbox.querySelector('figcaption');
  let index = 0;
  function show(next) {
    index = (next + items.length) % items.length;
    photo.src = items[index].src;
    photo.alt = items[index].alt;
    caption.textContent = items[index].caption;
  }
  document.querySelectorAll('[data-gallery-open]').forEach((button) => button.addEventListener('click', () => {
    show(Number(button.dataset.galleryOpen));
    lightbox.showModal();
  }));
  lightbox.querySelector('[data-lightbox-close]').addEventListener('click', () => lightbox.close());
  lightbox.querySelector('[data-lightbox-prev]').addEventListener('click', () => show(index - 1));
  lightbox.querySelector('[data-lightbox-next]').addEventListener('click', () => show(index + 1));
  lightbox.addEventListener('click', (event) => { if (event.target === lightbox) lightbox.close(); });
  lightbox.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') show(index - 1);
    if (event.key === 'ArrowRight') show(index + 1);
  });
}
