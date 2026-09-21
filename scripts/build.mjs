import { readFile, writeFile, mkdir, cp, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'dist');
const locales = ['en', 'de', 'ru', 'ro'];
const routeKeys = ['home', 'services', 'pj', 'about', 'media', 'contact', 'privacy', 'imprint'];
const slugs = { home: '', services: 'services/', pj: 'pj-collection/', about: 'about/', media: 'media/', contact: 'contact/', privacy: 'privacy/', imprint: 'imprint/' };
const siteUrl = new URL(process.env.SITE_URL || 'https://kongor-co.github.io/doina-stylist-test/');
const base = siteUrl.pathname.endsWith('/') ? siteUrl.pathname : `${siteUrl.pathname}/`;
siteUrl.pathname = base;
const readJson = async (relative) => JSON.parse(await readFile(path.join(root, relative), 'utf8'));
const messages = Object.fromEntries(await Promise.all(locales.map(async (lang) => [lang, await readJson(`locales/${lang}.json`)])));
const services = (await readJson('content/services.json')).filter((item) => item.active).sort((a, b) => a.order - b.order);
const products = await readJson('content/pj.json');
const media = await readJson('content/media.json');
const contact = await readJson('content/contact.json');
const allUrls = [];

function esc(value) {
  return String(value).replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function asset(relative) { return `${base}${relative.replace(/^\//, '')}`; }
function localPath(lang, route = 'home', detail = '') { return `${base}${lang}/${slugs[route]}${detail ? `${detail}/` : ''}`; }
function absolute(relative) { return new URL(relative, siteUrl).href; }
function pageTitle(m, key, detail) { return `${detail || m.nav[key] || m.legal[key]} | ${m.site.name}`; }
function selectedPage(route) { return route === 'privacy' || route === 'imprint' ? '' : route; }

function logo(extra = '') {
  return `<span class="brand-mark ${extra}" aria-hidden="true"></span>`;
}

function socialLinks(m, className = '') {
  return `<div class="social-links ${className}"><a href="${esc(contact.instagram)}" target="_blank" rel="noopener noreferrer">${esc(m.cta.instagram)}</a><a href="${esc(contact.tiktok)}" target="_blank" rel="noopener noreferrer">${esc(m.cta.tiktok)}</a></div>`;
}

function languageLinks(lang, route, detail, className = '') {
  return `<div class="language-links ${className}" aria-label="${esc(messages[lang].ui.language)}">${locales.map((code) => `<a href="${localPath(code, route, detail)}" lang="${code}" hreflang="${code}" ${lang === code ? 'aria-current="true"' : ''}>${code.toUpperCase()}</a>`).join('')}</div>`;
}

function header(m, lang, route, detail) {
  const active = selectedPage(route);
  const links = ['home', 'services', 'pj', 'about', 'media', 'contact'];
  const nav = links.map((key) => `<a href="${localPath(lang, key)}" ${active === key ? 'aria-current="page"' : ''}>${esc(m.nav[key])}</a>`).join('');
  return `<a class="skip-link" href="#main">${esc(m.ui.skip)}</a>
  <header class="site-header">
    <div class="header-inner">
      <a class="brand" href="${localPath(lang)}" aria-label="${esc(m.site.name)}">${logo()}</a>
      <nav class="desktop-nav" aria-label="${esc(m.ui.menu)}">${nav}</nav>
      <div class="header-tools">
        ${languageLinks(lang, route, detail, 'desktop-languages')}
        <button class="theme-toggle" type="button" data-theme-toggle data-label-light="${esc(m.ui.light)}" data-label-dark="${esc(m.ui.dark)}" aria-label="${esc(m.ui.theme)}" title="${esc(m.ui.theme)}"><span class="theme-icon" aria-hidden="true">◐</span><span class="theme-label">${esc(m.ui.dark)}</span></button>
        <button class="menu-toggle" type="button" data-menu-toggle data-label-open="${esc(m.ui.menu)}" data-label-close="${esc(m.ui.closeMenu)}" aria-label="${esc(m.ui.menu)}" aria-expanded="false" aria-controls="mobile-nav"><span></span><span></span><span></span></button>
      </div>
    </div>
    <nav id="mobile-nav" class="mobile-nav" aria-label="${esc(m.ui.menu)}" hidden>
      <div class="mobile-nav-links">${nav}</div>
      <div class="mobile-nav-tools"><span>${esc(m.ui.language)}</span>${languageLinks(lang, route, detail)}</div>
      ${socialLinks(m)}
    </nav>
  </header>`;
}

function footer(m, lang) {
  return `<footer class="site-footer"><div class="footer-main">
    <div class="footer-brand">${logo()}<div><strong>${esc(m.site.name)}</strong><span>${esc(m.site.descriptor)}</span></div></div>
    <div class="footer-right">${socialLinks(m)}<a href="mailto:${esc(contact.email)}">${esc(contact.email)}</a></div>
  </div><div class="footer-bottom"><span>© ${new Date().getFullYear()} ${esc(m.site.name)}</span><div><a href="${localPath(lang, 'privacy')}">${esc(m.legal.privacy)}</a><a href="${localPath(lang, 'imprint')}">${esc(m.legal.imprint)}</a></div></div>
  <p class="preview-note">${esc(m.site.preview)}</p></footer>`;
}

function layout(lang, route, body, options = {}) {
  const m = messages[lang];
  const detail = options.detail || '';
  const title = options.title || pageTitle(m, route);
  const description = options.description || m.meta[route];
  const url = absolute(localPath(lang, route, detail).slice(base.length));
  const alternates = locales.map((code) => `<link rel="alternate" hreflang="${code}" href="${absolute(localPath(code, route, detail).slice(base.length))}">`).join('');
  const ogImage = absolute(asset('assets/images/doina/doina-portrait.jpg').slice(base.length));
  return `<!doctype html><html lang="${lang}"><head>
    <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(title)}</title><meta name="description" content="${esc(description)}">
    <link rel="canonical" href="${url}">${alternates}
    <meta property="og:type" content="website"><meta property="og:site_name" content="${esc(m.site.name)}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${ogImage}">
    <meta name="twitter:card" content="summary_large_image">
    <link rel="icon" type="image/png" href="${asset('logo.png')}">
    <link rel="stylesheet" href="${asset('styles.css')}">
    <script>try{var savedTheme=localStorage.getItem('doina-theme');document.documentElement.dataset.theme=savedTheme||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}catch(error){document.documentElement.dataset.theme='light'}</script>
    <script defer src="${asset('app.js')}"></script>
  </head><body>${header(m, lang, route, detail)}<main id="main">${body}</main>${footer(m, lang)}</body></html>`;
}

function image(relative, alt, className = '', eager = false) {
  return `<img class="${className}" src="${asset(relative)}" alt="${esc(alt)}" width="900" height="1350" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
}

function sectionHeading(eyebrow, title, text = '') {
  return `<div class="section-heading">${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ''}<h2>${esc(title)}</h2>${text ? `<p>${esc(text)}</p>` : ''}</div>`;
}

function home(lang) {
  const m = messages[lang];
  const featured = services.slice(0, 3).map((service, index) => {
    const copy = m.services.items[service.id];
    return `<a class="featured-card" href="${localPath(lang, 'services')}#${service.id}"><span class="card-index">0${index + 1}</span><h3>${esc(copy.title)}</h3><p>${esc(copy.short)}</p><span class="card-bottom"><strong>${esc(service.price)}</strong><span>${esc(m.cta.viewService)} <span aria-hidden="true">↗</span></span></span></a>`;
  }).join('');
  const firstProduct = products[0];
  return `<section class="hero"><div class="hero-copy"><p class="eyebrow">${esc(m.home.eyebrow)}</p><p class="hero-descriptor">${esc(m.site.descriptor)}</p><h1>Doina<br>Stratulescu<span class="hero-dot">.</span></h1><p class="hero-slogan">${esc(m.site.slogan)}</p><div class="button-row"><a class="button button-primary" href="${localPath(lang, 'services')}">${esc(m.cta.services)} <span aria-hidden="true">↗</span></a><a class="button button-outline" href="${localPath(lang, 'contact')}">${esc(m.cta.contact)}</a></div></div><div class="hero-image-wrap">${image('assets/images/doina/doina-portrait.jpg', m.site.name, 'hero-image', true)}</div><div class="hero-side-note" aria-hidden="true">01 / 05</div></section>
  <section class="intro-section section-shell"><div class="intro-mark">✳</div><div><p class="eyebrow">${esc(m.site.slogan)}</p><h2>${esc(m.home.introTitle)}</h2><p>${esc(m.home.introText)}</p></div></section>
  <section class="section-shell services-preview">${sectionHeading('', m.home.featuredTitle, m.home.featuredText)}<div class="featured-grid">${featured}</div><a class="text-link" href="${localPath(lang, 'services')}">${esc(m.cta.allServices)} <span aria-hidden="true">↗</span></a></section>
  <section class="approach-section"><div class="section-shell approach-inner"><div>${sectionHeading(m.home.approachLabel, m.home.approachTitle, m.home.approachText)}<a class="text-link" href="${localPath(lang, 'about')}">${esc(m.nav.about)} <span aria-hidden="true">↗</span></a></div><ol class="approach-steps">${m.home.steps.map((step, i) => `<li><span>0${i + 1}</span>${esc(step)}</li>`).join('')}</ol></div></section>
  <section class="section-shell pj-preview"><div class="pj-preview-image">${image(firstProduct.images[0], m.pj.products[firstProduct.id].alt)}</div><div class="pj-preview-copy"><p class="eyebrow">${esc(m.home.pjLabel)}</p><h2>${esc(m.home.pjTitle)}</h2><p>${esc(m.home.pjText)}</p><a class="button button-outline" href="${localPath(lang, 'pj')}">${esc(m.cta.collection)} <span aria-hidden="true">↗</span></a></div></section>
  <section class="social-section section-shell">${sectionHeading('', m.home.socialTitle, m.home.socialText)}${socialLinks(m)}</section>`;
}

function serviceCard(lang, service) {
  const m = messages[lang];
  const copy = m.services.items[service.id];
  return `<details class="service-card" id="${service.id}" data-category="${service.category}"><summary><span class="service-card-category">${esc(m.services.categories[service.category])}</span><span class="service-card-title">${esc(copy.title)}</span><span class="service-card-short">${esc(copy.short)}</span><span class="service-card-price">${esc(service.price)}</span><span class="service-card-expand" aria-hidden="true">+</span></summary><div class="service-card-detail"><p class="detail-lead">${esc(copy.full)}</p><div class="detail-grid"><div><h3>${esc(m.services.for)}</h3><p>${esc(copy.for)}</p></div><div><h3>${esc(m.services.includes)}</h3><ul>${copy.includes.map((line) => `<li>${esc(line)}</li>`).join('')}</ul></div><div><h3>${esc(m.services.process)}</h3><p>${esc(copy.process)}</p></div><div class="fact-list"><div><span>${esc(m.services.duration)}</span><strong>${esc(m.services.durations[service.duration])}</strong></div><div><span>${esc(m.services.location)}</span><strong>${esc(m.services.locations[service.location])}</strong></div><div><span>${esc(m.services.price)}</span><strong>${esc(service.price)}</strong></div></div></div><a class="button button-primary" href="${localPath(lang, 'contact')}">${esc(m.cta.contact)} <span aria-hidden="true">↗</span></a></div></details>`;
}

function servicesPage(lang) {
  const m = messages[lang];
  const categories = ['all', 'personal', 'wardrobe', 'colour', 'shopping'];
  return `<section class="page-intro section-shell"><p class="eyebrow">${esc(m.site.descriptor)}</p><h1>${esc(m.services.title)}</h1><p>${esc(m.services.intro)}</p></section><section class="section-shell catalog-section"><div class="tabs" role="tablist" aria-label="${esc(m.services.title)}" data-tabs="services">${categories.map((category, i) => `<button type="button" role="tab" id="service-tab-${category}" aria-selected="${i === 0}" aria-controls="services-panel" data-filter="${category}" tabindex="${i === 0 ? '0' : '-1'}">${esc(m.services.categories[category])}</button>`).join('')}</div><div id="services-panel" role="tabpanel" aria-labelledby="service-tab-all" class="service-list">${services.map((service) => serviceCard(lang, service)).join('')}</div><p class="content-note">${esc(m.services.priceNote)}</p></section>`;
}

function productCard(lang, product, i) {
  const m = messages[lang];
  const copy = m.pj.products[product.id];
  return `<a class="product-card product-${i + 1}" href="${localPath(lang, 'pj', product.id)}"><span class="product-image">${image(product.images[0], copy.alt)}<span class="product-status">${esc(m.pj[product.status])}</span></span><span class="product-meta"><span><small>${esc(m.pj.collection)}</small><strong>${esc(copy.name)}</strong></span><span class="product-price">${esc(product.price)}</span></span><span class="product-description">${esc(copy.short)}</span><span class="product-link">${esc(m.ui.viewDetails)} <span aria-hidden="true">↗</span></span></a>`;
}

function pjPage(lang) {
  const m = messages[lang];
  return `<section class="page-intro section-shell"><p class="eyebrow">${esc(m.home.pjLabel)}</p><h1>${esc(m.pj.title)}</h1><p>${esc(m.pj.intro)}</p></section><section class="section-shell catalog-section"><div class="product-grid">${products.map((product, i) => productCard(lang, product, i)).join('')}</div><p class="content-note">${esc(m.pj.priceNote)}</p></section>`;
}

function productPage(lang, product) {
  const m = messages[lang];
  const copy = m.pj.products[product.id];
  return `<section class="section-shell product-detail"><a class="back-link" href="${localPath(lang, 'pj')}">← ${esc(m.cta.allPj)}</a><div class="product-detail-grid"><div class="product-gallery">${product.images.map((src, index) => `<div class="${index === 0 ? 'product-main-image' : 'product-secondary-image'}">${image(src, copy.alt, '', index === 0)}</div>`).join('')}</div><div class="product-detail-copy"><p class="eyebrow">${esc(m.pj.collection)}</p><h1>${esc(copy.name)}</h1><p class="large-copy">${esc(copy.description)}</p><div class="product-facts"><div><span>${esc(m.pj.material)}</span><strong>${esc(m.pj.materials[product.material])}</strong></div><div><span>${esc(m.pj.sizes)}</span><strong>${esc(product.sizes.join(', '))}</strong></div><div><span>${esc(m.pj.colours)}</span><strong>${esc(product.colors.map((color) => m.pj.colourNames[color]).join(', '))}</strong></div><div><span>${esc(m.pj.status)}</span><strong>${esc(m.pj[product.status])}</strong></div><div><span>${esc(m.pj.price)}</span><strong>${esc(product.price)}</strong></div></div><a class="button button-primary" href="${localPath(lang, 'contact')}">${esc(m.cta.askPiece)} <span aria-hidden="true">↗</span></a><p class="content-note">${esc(m.pj.priceNote)}</p></div></div></section>`;
}

function aboutPage(lang) {
  const m = messages[lang];
  return `<section class="page-intro section-shell"><p class="eyebrow">${esc(m.site.descriptor)}</p><h1>${esc(m.about.title)}</h1><p>${esc(m.about.intro)}</p></section><section class="section-shell about-grid"><div class="about-image">${image('assets/images/doina/doina-portrait.jpg', m.site.name)}</div><div class="about-content"><article><span class="article-number">01</span><h2>${esc(m.about.storyTitle)}</h2><p>${esc(m.about.story)}</p></article><article><span class="article-number">02</span><h2>${esc(m.about.philosophyTitle)}</h2><p>${esc(m.about.philosophy)}</p></article><article><span class="article-number">03</span><h2>${esc(m.about.workTitle)}</h2><p>${esc(m.about.work)}</p></article><article><span class="article-number">04</span><h2>${esc(m.about.designTitle)}</h2><p>${esc(m.about.design)}</p></article><a class="button button-primary" href="${localPath(lang, 'contact')}">${esc(m.cta.contact)} <span aria-hidden="true">↗</span></a></div></section>`;
}

function mediaPage(lang) {
  const m = messages[lang];
  const photos = media.photos.map((photo, i) => `<button type="button" class="gallery-item gallery-${i + 1}" data-gallery-open="${i}" aria-label="${esc(m.media.photosData[photo.id].caption)}">${image(photo.image, m.media.photosData[photo.id].alt)}<span>${esc(m.media.photosData[photo.id].caption)}</span></button>`).join('');
  const videos = media.videos.map((video, i) => `<a class="video-card" href="${esc(video.url)}" target="_blank" rel="noopener noreferrer"><span class="video-poster video-poster-${i + 1}">${image(i === 0 ? media.photos[0].image : media.photos[1].image, m.ui.placeholderPhoto)}<span class="play-icon" aria-hidden="true">▶</span></span><span class="video-text"><strong>${esc(m.media.videosData[video.id].title)}</strong><span>${esc(m.media.videosData[video.id].description)}</span></span></a>`).join('');
  const galleryData = media.photos.map((photo) => ({ src: asset(photo.image), alt: m.media.photosData[photo.id].alt, caption: m.media.photosData[photo.id].caption }));
  return `<section class="page-intro section-shell"><p class="eyebrow">${esc(m.site.name)}</p><h1>${esc(m.media.title)}</h1><p>${esc(m.media.intro)}</p></section><section class="section-shell catalog-section"><div class="tabs" role="tablist" aria-label="${esc(m.media.title)}" data-tabs="media"><button type="button" role="tab" id="media-tab-photos" aria-selected="true" aria-controls="media-photos" tabindex="0">${esc(m.media.photos)}</button><button type="button" role="tab" id="media-tab-videos" aria-selected="false" aria-controls="media-videos" tabindex="-1">${esc(m.media.videos)}</button></div><div id="media-photos" role="tabpanel" aria-labelledby="media-tab-photos" class="media-panel"><div class="gallery-grid">${photos}</div></div><div id="media-videos" role="tabpanel" aria-labelledby="media-tab-videos" class="media-panel" hidden><div class="video-grid">${videos}</div><p class="content-note">${esc(m.media.videoNote)}</p></div></section><dialog class="lightbox" data-lightbox aria-label="${esc(m.media.photos)}"><div class="lightbox-frame"><button type="button" class="lightbox-close" data-lightbox-close aria-label="${esc(m.ui.close)}">×</button><button type="button" class="lightbox-prev" data-lightbox-prev aria-label="${esc(m.ui.previous)}">‹</button><figure><img src="" alt=""><figcaption></figcaption></figure><button type="button" class="lightbox-next" data-lightbox-next aria-label="${esc(m.ui.next)}">›</button></div></dialog><script type="application/json" id="gallery-data">${JSON.stringify(galleryData).replaceAll('<', '\\u003c')}</script>`;
}

function contactPage(lang) {
  const m = messages[lang];
  return `<section class="contact-page section-shell"><div class="contact-intro"><p class="eyebrow">${esc(m.nav.contact)}</p><h1>${esc(m.contact.title)}</h1><p>${esc(m.contact.intro)}</p></div><div class="contact-options"><a href="mailto:${esc(contact.email)}"><span>01</span><strong>${esc(m.contact.email)}</strong><em>${esc(contact.email)}</em><b aria-hidden="true">↗</b></a><a href="${esc(contact.instagram)}" target="_blank" rel="noopener noreferrer"><span>02</span><strong>${esc(m.contact.instagram)}</strong><em>Instagram</em><b aria-hidden="true">↗</b></a><a href="${esc(contact.tiktok)}" target="_blank" rel="noopener noreferrer"><span>03</span><strong>${esc(m.contact.tiktok)}</strong><em>TikTok</em><b aria-hidden="true">↗</b></a></div><p class="content-note">${esc(m.contact.placeholder)}</p></section>`;
}

function legalPage(lang, route) {
  const m = messages[lang];
  return `<section class="page-intro section-shell legal-page"><p class="eyebrow">${esc(m.site.name)}</p><h1>${esc(m.legal[route])}</h1><p>${esc(m.legal.pending)}</p></section>`;
}

async function write(relative, value) {
  const destination = path.join(out, relative);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, value, 'utf8');
}

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
await cp(path.join(root, 'public'), out, { recursive: true });
await cp(path.join(root, 'assets'), path.join(out, 'assets'), { recursive: true });

for (const lang of locales) {
  const m = messages[lang];
  const content = { home: home(lang), services: servicesPage(lang), pj: pjPage(lang), about: aboutPage(lang), media: mediaPage(lang), contact: contactPage(lang), privacy: legalPage(lang, 'privacy'), imprint: legalPage(lang, 'imprint') };
  for (const route of routeKeys) {
    const relative = `${lang}/${slugs[route]}index.html`;
    await write(relative, layout(lang, route, content[route], { title: route === 'home' ? `${m.site.name} | ${m.site.descriptor}` : undefined }));
    allUrls.push(absolute(localPath(lang, route).slice(base.length)));
  }
  for (const product of products) {
    const relative = `${lang}/${slugs.pj}${product.id}/index.html`;
    await write(relative, layout(lang, 'pj', productPage(lang, product), { detail: product.id, title: `${m.pj.products[product.id].name} | ${m.site.name}`, description: m.pj.products[product.id].description }));
    allUrls.push(absolute(localPath(lang, 'pj', product.id).slice(base.length)));
  }
}

await write('index.html', `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="canonical" href="${absolute(localPath('en').slice(base.length))}"><title>Doina Stratulescu</title><script>try{var lang=localStorage.getItem('doina-lang');if(!['en','de','ru','ro'].includes(lang))lang='en';location.replace('${base}'+lang+'/')}catch(error){location.replace('${localPath('en')}')}</script></head><body><a href="${localPath('en')}">Doina Stratulescu</a></body></html>`);
await write('404.html', layout('en', 'home', `<section class="page-intro section-shell legal-page"><p class="eyebrow">404</p><h1>${esc(messages.en.notFound.title)}</h1><p>${esc(messages.en.notFound.text)}</p><a class="button button-primary" href="${localPath('en')}">${esc(messages.en.cta.home)}</a></section>`, { title: `404 | ${messages.en.site.name}`, description: messages.en.notFound.text }));
await write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${absolute('sitemap.xml')}\n`);
await write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${allUrls.map((url) => `<url><loc>${url}</loc></url>`).join('')}</urlset>`);
await write('.nojekyll', '');
console.log(`Built ${allUrls.length} localized pages at ${siteUrl.href}`);
