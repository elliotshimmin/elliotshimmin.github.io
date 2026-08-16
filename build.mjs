#!/usr/bin/env node
/* Zero-dependency static site generator for Bridewell Place Notes.
   Reads data/posts.json + content/<name>.html fragments and writes
   plain static HTML into the repo root (served as-is by Cloudflare Pages).
   Add a post: drop content/<name>.html, add an entry to data/posts.json, run `node build.mjs`. */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = __dirname;
const OUT = 'public';
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const write = (p, s) => { const fp = path.join(root, OUT, p); fs.mkdirSync(path.dirname(fp), { recursive: true }); fs.writeFileSync(fp, s); };

const SITE = {
  title: 'Bridewell Place Notes',
  tagline: 'Helpful notes for new or existing Bridewell Place residents (Wapping)',
  url: 'https://elliotshimmin.com',
  domain: 'elliotshimmin.com',
};

const posts = JSON.parse(read('data/posts.json'))
  .sort((a, b) => (a.date < b.date ? 1 : -1)); // newest first

const fmtDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[m - 1]} ${d}, ${y}`;
};
const img = (name) => `/images/${name}`;
const postUrl = (p) => `/post/${p.slug}`;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function nav(active) {
  const items = [['/', 'Home'], ['/about', 'About'], ['/notes', 'Notes'], ['/contact', 'Contact']];
  return items.map(([href, label]) =>
    `<li><a href="${href}"${active === href ? ' class="active"' : ''}>${label}</a></li>`).join('');
}

function layout({ title, active = '', body, description = SITE.tagline }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="website">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Work+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/styles.css">
</head>
<body>
<div class="topbar">${esc(SITE.tagline)}</div>
<header class="site-header">
  <div class="wrap">
    <a class="brand" href="/">${SITE.title}</a>
    <nav><ul class="nav">${nav(active)}</ul></nav>
  </div>
</header>
<main>
${body}
</main>
<footer class="site-footer">
  <div class="wrap">
    <div class="brand-sm">${SITE.title}</div>
    <div>By Elliot Shimmin · Wapping, London</div>
  </div>
</footer>
</body>
</html>
`;
}

function card(p) {
  return `<article class="card">
  <a class="cover" href="${postUrl(p)}"><img src="${img(p.hero)}" alt="${esc(p.title)}"></a>
  <h3><a href="${postUrl(p)}">${esc(p.title)}</a></h3>
  <p class="meta">${fmtDate(p.date)} · ${p.readTime}</p>
  <p class="excerpt">${esc(p.excerpt)}</p>
  <a class="backlink" href="${postUrl(p)}">Read note →</a>
</article>`;
}

/* ---------- Home ---------- */
function buildHome() {
  const [latest, ...rest] = posts;
  const gridPosts = rest.slice(0, 6);
  const body = `
<section class="section">
  <div class="wrap">
    <p class="eyebrow">Latest note</p>
    <div class="featured">
      <a class="cover" href="${postUrl(latest)}"><img src="${img(latest.hero)}" alt="${esc(latest.title)}"></a>
      <div>
        <p class="meta">${fmtDate(latest.date)} · ${latest.readTime}</p>
        <h2><a href="${postUrl(latest)}">${esc(latest.title)}</a></h2>
        <p class="excerpt">${esc(latest.excerpt)}</p>
        <a class="btn" href="${postUrl(latest)}">Read note</a>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <p class="eyebrow">Notes</p>
    <div class="grid">
      ${gridPosts.map(card).join('\n')}
    </div>
    <div class="center" style="margin-top:44px;">
      <a class="btn" href="/notes">Explore more</a>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="about-blurb">
      <p class="eyebrow">About Bridewell Place Notes</p>
      <p>Hi, my name is Elliot. I moved into Bridewell Place (Wapping) in Feb 2025 with my wife Jessie. As I learned about Bridewell and the local area, I thought it'd be helpful to share my notes. It's a space for information that I would have appreciated to find as a new/existing resident.</p>
      <p style="margin-top:20px;"><a class="btn" href="/about">More about this site</a></p>
    </div>
  </div>
</section>`;
  write('index.html', layout({ title: `${SITE.title} | Wapping (Resident's Guide)`, active: '/', body }));
}

/* ---------- Notes index ---------- */
function buildNotes() {
  const body = `
<section class="section">
  <div class="wrap">
    <p class="eyebrow">Notes</p>
    <div class="grid">
      ${posts.map(card).join('\n')}
    </div>
  </div>
</section>`;
  write('notes.html', layout({ title: `Notes | ${SITE.title}`, active: '/notes', body }));
}

/* ---------- About ---------- */
function buildAbout() {
  const body = `
<section class="section">
  <div class="wrap">
    <div class="about-blurb">
      <p class="eyebrow">About</p>
      <h2>About Bridewell Place Notes</h2>
      <p>Hi, my name is Elliot. I moved into Bridewell Place (Wapping) in Feb 2025 with my wife Jessie. As I learned about Bridewell and the local area, I thought it'd be helpful to share my notes. It's a space for information that I would have appreciated to find as a new/existing resident.</p>
    </div>
  </div>
</section>`;
  write('about.html', layout({ title: `About | ${SITE.title}`, active: '/about', body }));
}

/* ---------- Contact ---------- */
function buildContact() {
  const body = `
<section class="section">
  <div class="wrap">
    <div class="about-blurb">
      <p class="eyebrow">Contact</p>
      <h2>Get in touch</h2>
      <p>Questions, corrections, or something worth adding to the notes? Drop me a line at the address below.</p>
      <p style="margin-top:26px;"><img class="email-img" src="/images/email.png" alt="Email address (shown as an image to deter spam)"></p>
      <p class="meta" style="margin-top:12px;">Type it into your email client — it's an image, so there's nothing here for bots to harvest.</p>
    </div>
  </div>
</section>`;
  write('contact.html', layout({ title: `Contact | ${SITE.title}`, active: '/contact', body, description: 'Get in touch with Bridewell Place Notes.' }));
}

/* ---------- Posts ---------- */
function buildPosts() {
  for (const p of posts) {
    const inner = read(`content/${p.content}.html`);
    const body = `
<article>
  <div class="post-header">
    <div class="wrap">
      <p class="meta">${fmtDate(p.date)} · ${p.readTime}</p>
      <h1>${esc(p.title)}</h1>
    </div>
  </div>
  <div class="post-hero"><img src="${img(p.hero)}" alt="${esc(p.title)}"></div>
  <div class="article">
    ${inner}
    <p style="margin-top:40px;"><a class="backlink" href="/notes">← All notes</a></p>
  </div>
</article>`;
    write(`post/${p.slug}.html`, layout({ title: `${p.title} | ${SITE.title}`, active: '/notes', body, description: p.excerpt }));
  }
}

/* ---------- Static assets ---------- */
function copyAssets() {
  fs.mkdirSync(path.join(root, OUT), { recursive: true });
  fs.copyFileSync(path.join(root, 'templates/styles.css'), path.join(root, OUT, 'styles.css'));
  fs.cpSync(path.join(root, 'assets/images'), path.join(root, OUT, 'images'), { recursive: true });
  write('CNAME', SITE.domain + '\n');
}

copyAssets();
buildHome();
buildNotes();
buildAbout();
buildContact();
buildPosts();
console.log(`Built ${posts.length} posts + home, notes, about.`);
