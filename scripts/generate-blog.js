#!/usr/bin/env node

const fs = require('node:fs/promises');
const path = require('node:path');
const {toHTML} = require('@portabletext/to-html');

const projectId = process.env.SANITY_PROJECT_ID || '509u1k2c';
const dataset = process.env.SANITY_DATASET || 'production';
const apiVersion = process.env.SANITY_API_VERSION || '2023-01-01';
const sanityToken = process.env.SANITY_READ_TOKEN || '';
const siteUrl = (process.env.SITE_URL || 'https://swayup-studio.com').replace(/\/+$/, '');
const outputRoot = path.resolve(process.cwd(), process.env.BLOG_OUTPUT_DIR || 'PUBLIC');
const blogRoot = path.join(outputRoot, 'blog');
const sitemapPath = path.join(outputRoot, 'sitemap.xml');

const today = new Date().toISOString().slice(0, 10);

const postsQuery = `
*[_type == "post" && defined(slug.current)] | order(publishedAt desc){
  _id,
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  readTime,
  _updatedAt,
  mainImage{
    alt,
    asset
  },
  body
}
`;

async function main() {
  assertRequired(projectId, 'SANITY_PROJECT_ID');
  assertRequired(dataset, 'SANITY_DATASET');

  const posts = await sanityFetch(postsQuery);
  const normalizedPosts = normalizePosts(posts);

  await fs.rm(blogRoot, {recursive: true, force: true});
  await fs.mkdir(blogRoot, {recursive: true});

  for (const post of normalizedPosts) {
    const articleDir = path.join(blogRoot, post.slug);
    await fs.mkdir(articleDir, {recursive: true});
    await fs.writeFile(path.join(articleDir, 'index.html'), renderArticleHtml(post), 'utf8');
  }

  await fs.writeFile(path.join(blogRoot, 'index.html'), renderBlogIndexHtml(normalizedPosts), 'utf8');
  await fs.writeFile(path.join(outputRoot, 'blog.html'), renderBlogRedirectHtml(), 'utf8');

  const sitemapEntries = await buildSitemapEntries(normalizedPosts);
  await fs.writeFile(sitemapPath, renderSitemapXml(sitemapEntries), 'utf8');

  console.log(`Generated ${normalizedPosts.length} static blog page(s) in ${blogRoot}`);
  console.log(`Updated ${sitemapPath}`);
}

function assertRequired(value, envName) {
  if (!value || !String(value).trim()) {
    throw new Error(`Missing required env var: ${envName}`);
  }
}

async function sanityFetch(query) {
  const endpoint = `https://${projectId}.apicdn.sanity.io/${normalizeApiVersion(apiVersion)}/data/query/${dataset}?query=${encodeURIComponent(query)}`;
  const headers = sanityToken ? {Authorization: `Bearer ${sanityToken}`} : {};

  const response = await fetch(endpoint, {headers});
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Sanity request failed (${response.status}): ${body}`);
  }

  const payload = await response.json();
  if (!payload || !Array.isArray(payload.result)) {
    throw new Error('Invalid Sanity response format.');
  }

  return payload.result;
}

function normalizeApiVersion(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return 'v2023-01-01';
  return trimmed.startsWith('v') ? trimmed : `v${trimmed}`;
}

function normalizePosts(posts) {
  return posts
    .map((post) => ({
      id: post._id,
      title: post.title || 'Article',
      slug: normalizeSlug(post.slug),
      excerpt: post.excerpt || '',
      publishedAt: post.publishedAt || null,
      updatedAt: post._updatedAt || post.publishedAt || null,
      readTime: Number.isFinite(post.readTime) ? post.readTime : null,
      mainImageRef: post.mainImage?.asset?._ref || '',
      mainImageAlt: post.mainImage?.alt || post.title || 'Image article',
      body: Array.isArray(post.body) ? post.body : [],
    }))
    .filter((post) => post.slug);
}

function normalizeSlug(slug) {
  if (typeof slug !== 'string') return '';
  const cleaned = slug.trim().replace(/^\/+|\/+$/g, '');
  if (!cleaned || cleaned.includes('..')) return '';

  return cleaned
    .split('/')
    .filter(Boolean)
    .map((segment) => segment.replace(/[^a-zA-Z0-9_-]/g, '-'))
    .join('/');
}

function formatDate(isoDate) {
  if (!isoDate) return '';

  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString('fr-BE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function parseImageRef(ref) {
  if (!ref || typeof ref !== 'string' || !ref.startsWith('image-')) return null;

  const parts = ref.split('-');
  if (parts.length < 4) return null;

  const format = parts.pop();
  const dimensions = parts.pop();
  parts.shift();
  const id = parts.join('-');

  if (!id || !dimensions || !format) return null;
  return {id, dimensions, format};
}

function getImageUrl(ref, width = 1200) {
  const parsed = parseImageRef(ref);
  if (!parsed) return '';
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${parsed.id}-${parsed.dimensions}.${parsed.format}?w=${width}&auto=format`;
}

function renderPortableText(body) {
  return toHTML(body, {
    components: {
      types: {
        image: ({value}) => {
          const imageRef = value?.asset?._ref;
          const src = getImageUrl(imageRef, 1400);
          if (!src) return '';

          const alt = escapeHtml(value?.alt || '');
          const caption = value?.caption
            ? `<figcaption>${escapeHtml(value.caption)}</figcaption>`
            : '';

          return `<figure class="article-body__figure"><img src="${src}" alt="${alt}" loading="lazy" />${caption}</figure>`;
        },
      },
      marks: {
        link: ({children, value}) => {
          const href = value?.href || '#';
          const openBlank = Boolean(value?.blank);
          const target = openBlank ? ' target="_blank" rel="noopener noreferrer"' : '';
          return `<a href="${escapeHtml(href)}"${target}>${children}</a>`;
        },
      },
      block: {
        h2: ({children}) => `<h2>${children}</h2>`,
        h3: ({children}) => `<h3>${children}</h3>`,
        h4: ({children}) => `<h4>${children}</h4>`,
        blockquote: ({children}) => `<blockquote>${children}</blockquote>`,
        normal: ({children}) => `<p>${children}</p>`,
      },
    },
  });
}

function renderArticleHtml(post) {
  const articleUrl = `${siteUrl}/blog/${encodeURIComponent(post.slug)}/`;
  const title = escapeHtml(post.title);
  const excerpt = escapeHtml(post.excerpt || '');
  const dateLabel = formatDate(post.publishedAt);
  const readTimeLabel = post.readTime ? `${post.readTime} min de lecture` : '';
  const heroImage = getImageUrl(post.mainImageRef, 1600);
  const bodyHtml = renderPortableText(post.body);

  const metaLine = [dateLabel, readTimeLabel].filter(Boolean).join(' · ');
  const ogImageTag = heroImage ? `<meta property="og:image" content="${heroImage}" />` : '';
  const imageBlock = heroImage
    ? `
  <div class="article-hero">
    <img src="${heroImage}" alt="${escapeHtml(post.mainImageAlt)}" class="article-hero__img" />
    <div class="article-hero__overlay"></div>
  </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — Swayup studio</title>
  <meta name="description" content="${excerpt || 'Article de blog Swayup studio'}" />
  <link rel="canonical" href="${articleUrl}" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${excerpt || 'Article de blog Swayup studio'}" />
  <meta property="og:url" content="${articleUrl}" />
  ${ogImageTag}
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="stylesheet" href="../../css/style.css" />
  <link rel="icon" href="../../favicon.ico" />
  <link rel="shortcut icon" href="../../favicon.ico" />
</head>
<body class="page-wrapper">
  <nav class="navbar">
    <div class="navbar__inner">
      <a href="../../index.html" class="navbar__logo"><img src="../../assets/logo-navbar-noir-complet.svg" alt="Swayup studio" /></a>
      <div class="navbar__nav">
        <a href="../../index.html">Accueil</a>
        <a href="../../site-web.html">Site web</a>
        <a href="../../identite-visuelle.html">Identité visuelle</a>
        <a href="../../Réalisations.html">Réalisations</a>
        <a href="../" class="active">Blog</a>
      </div>
      <div class="navbar__right"><a href="../../contact.html" class="btn btn-cta3 btn-sm">Nous contacter</a></div>
    </div>
  </nav>

  <main>
    ${imageBlock}
    <section class="section">
      <div class="container" style="max-width:780px;">
        <a href="../" class="article-back">← Retour au blog</a>
        <div class="article-meta">${escapeHtml(metaLine)}</div>
        <h1 class="article-title">${title}</h1>
        <div class="article-body">
          ${bodyHtml}
        </div>
      </div>
    </section>
  </main>

  <script src="../../js/main.js"></script>
</body>
</html>`;
}

function renderBlogIndexHtml(posts) {
  const cards = posts
    .map((post) => {
      const href = `./${encodeURIComponent(post.slug)}/`;
      const dateLabel = formatDate(post.publishedAt);
      const readTime = post.readTime ? `${post.readTime} min` : '';
      const imageSrc = getImageUrl(post.mainImageRef, 720);
      const imageBlock = imageSrc
        ? `<img src="${imageSrc}" alt="${escapeHtml(post.mainImageAlt)}" class="blog-card__img" loading="lazy" />`
        : '<div class="blog-card__img-placeholder"></div>';

      return `
      <article class="blog-card">
        <a href="${href}" class="blog-card__img-link">
          <div class="blog-card__img-wrap">${imageBlock}</div>
        </a>
        <div class="blog-card__body">
          <div class="blog-card__meta">
            ${dateLabel ? `<time datetime="${post.publishedAt}">${escapeHtml(dateLabel)}</time>` : ''}
            ${readTime ? `<span class="blog-card__read-time">${escapeHtml(readTime)} de lecture</span>` : ''}
          </div>
          <h2 class="blog-card__title">${escapeHtml(post.title)}</h2>
          ${post.excerpt ? `<p class="blog-card__excerpt">${escapeHtml(post.excerpt)}</p>` : ''}
          <a href="${href}" class="btn btn-cta4 btn-sm" style="margin-top:16px;">Lire l'article</a>
        </div>
      </article>`;
    })
    .join('\n');

  const content = cards
    ? `<div class="blog-grid">${cards}</div>`
    : '<p style="text-align:center;color:var(--gris-moyen);padding:70px 0;">Les premiers articles arrivent bientôt.</p>';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>L'Observatoire — Blog Swayup studio</title>
  <meta name="description" content="Conseils concrets sur le web, le design et les supports de communication par Swayup studio." />
  <link rel="canonical" href="${siteUrl}/blog/" />
  <link rel="stylesheet" href="../css/style.css" />
  <link rel="icon" href="../favicon.ico" />
  <link rel="shortcut icon" href="../favicon.ico" />
</head>
<body class="page-wrapper">
  <nav class="navbar">
    <div class="navbar__inner">
      <a href="../index.html" class="navbar__logo"><img src="../assets/logo-navbar-noir-complet.svg" alt="Swayup studio" /></a>
      <div class="navbar__nav">
        <a href="../index.html">Accueil</a>
        <a href="../site-web.html">Site web</a>
        <a href="../identite-visuelle.html">Identité visuelle</a>
        <a href="../Réalisations.html">Réalisations</a>
        <a href="./" class="active">Blog</a>
      </div>
      <div class="navbar__right"><a href="../contact.html" class="btn btn-cta3 btn-sm">Nous contacter</a></div>
    </div>
  </nav>

  <main>
    <div class="page-hero">
      <div class="container">
        <p class="label" style="margin-bottom:16px;">L'Observatoire</p>
        <h1>Insights sur le web,<br/>le design et le print</h1>
        <p class="lead" style="color:rgba(251,251,251,0.7);margin-top:20px;max-width:600px;">
          Des conseils concrets, sans jargon, pour que votre présence en ligne travaille vraiment pour vous.
        </p>
      </div>
    </div>

    <section class="section">
      <div class="container">
        ${content}
      </div>
    </section>
  </main>

  <script src="../js/main.js"></script>
</body>
</html>`;
}

function renderBlogRedirectHtml() {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="refresh" content="0; url=./blog/" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Redirection — Blog Swayup studio</title>
  <link rel="canonical" href="${siteUrl}/blog/" />
  <script>window.location.replace('./blog/');</script>
</head>
<body>
  <p>Redirection vers le blog : <a href="./blog/">./blog/</a></p>
</body>
</html>`;
}

async function buildSitemapEntries(posts) {
  const staticEntries = await getStaticHtmlEntries();
  const blogEntries = posts.map((post) => ({
    path: `/blog/${encodeURIComponent(post.slug)}/`,
    lastmod: normalizeLastmod(post.updatedAt || post.publishedAt),
  }));

  const merged = new Map();
  for (const entry of [...staticEntries, {path: '/blog/', lastmod: today}, ...blogEntries]) {
    const loc = new URL(entry.path, `${siteUrl}/`).toString();
    merged.set(loc, normalizeLastmod(entry.lastmod));
  }

  return [...merged.entries()].map(([loc, lastmod]) => ({loc, lastmod}));
}

async function getStaticHtmlEntries() {
  const entries = await fs.readdir(outputRoot, {withFileTypes: true});
  const htmlFiles = entries.filter((entry) => entry.isFile() && entry.name.endsWith('.html'));

  const output = [];
  for (const file of htmlFiles) {
    if (file.name === 'article.html' || file.name === 'blog.html') continue;

    const fullPath = path.join(outputRoot, file.name);
    const stat = await fs.stat(fullPath);
    output.push({
      path: file.name === 'index.html' ? '/' : `/${encodeURIComponent(file.name)}`,
      lastmod: stat.mtime.toISOString().slice(0, 10),
    });
  }

  return output;
}

function normalizeLastmod(value) {
  if (!value) return today;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return today;
  return date.toISOString().slice(0, 10);
}

function renderSitemapXml(entries) {
  const sorted = [...entries].sort((a, b) => a.loc.localeCompare(b.loc));
  const urls = sorted
    .map(
      (entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <lastmod>${entry.lastmod}</lastmod>
  </url>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
