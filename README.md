# Doina Stratulescu website

A static portfolio and PJ collection website for Doina Stratulescu, available in English, German, Russian and Romanian. The site includes seven styling services, a three-piece PJ catalogue, photo galleries, videos and contact links. It uses plain HTML, CSS and JavaScript, with no external package dependencies or backend.

[View the website on GitHub Pages](https://kongor-co.github.io/doina-stylist-test/)

## Local development

Use Node.js 24 or later. No package installation is required.

```text
npm run build
npm run check
npm run serve
```

Open `http://127.0.0.1:4173/doina-stylist-test/`. The build writes to the ignored `dist/` directory, and the local server serves that build. Rebuild after changing source files.

## Repository structure

| Path | Purpose |
| --- | --- |
| `scripts/build.mjs` | Builds all four language versions, PJ detail pages, the sitemap and the root redirect. |
| `locales/` | Interface text, biography, PJ descriptions and metadata for `en`, `de`, `ru` and `ro`. |
| `content/services.json` | The seven services, including descriptions, inclusions and prices in all four languages. |
| `content/pj.json` | The three PJ products, image references and illustrative product details. |
| `content/media.json` | Paths to the two local MP4 videos. The photo galleries are populated from the professional and work image folders during the build. |
| `content/contact.json` | Doina's email, Instagram URL and TikTok URL. |
| `assets/images/doina/` | The homepage portrait, nine professional photos and 26 photos of Doina at work. |
| `assets/images/pj/` | PJ collection photos. |
| `assets/videos/` | Browser compatible MP4 videos. Original MOV files are kept locally and ignored by Git. |
| `public/` | Source stylesheet, JavaScript and signature logo used as the site logo and favicon. |
| `en/`, `de/`, `ru/`, `ro/` and root site files | Generated pages and assets used by GitHub Pages. Edit the source files above, then regenerate these files. |

Each language has Home, Services, PJ Collection, About, Media, Contact, Privacy and Imprint pages, plus a page for each PJ product. The Media page has Photoshootings, At work and Videos categories.

## Content still to finalize

The service descriptions and prices come from the supplied services catalogue. The contact details are Doina's supplied details. PJ product names, materials, sizes, availability and prices are illustrative. The biography is placeholder copy. Privacy and Imprint contain holding text until approved legal information is available. The site has no booking, account or checkout functions.

## Publishing to GitHub Pages

The repository uses generated pages at its root. GitHub Pages should use **Deploy from a branch**, with `main` and `/(root)` selected. After editing source content, run:

```text
npm run publish:root
npm run check:published
```

`publish:root` builds the site, checks localized pages and links, then copies generated pages to the repository root. Commit and push those changes when they are ready to publish. The workflow in `.github/workflows/pages.yml` runs on pushes to `main` and checks that the committed pages match a fresh build. GitHub Pages performs the deployment from the branch.

The default site address is `https://kongor-co.github.io/doina-stylist-test/`. Set `SITE_URL` to a full replacement address before building for a custom domain. The build uses it for internal paths, canonical links, social metadata and the sitemap.
