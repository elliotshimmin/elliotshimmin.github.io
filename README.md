# Bridewell Place Notes — elliotshimmin.com

Static site (plain HTML/CSS) mirroring the original Wix "Bridewell Place Notes" blog.
No frameworks, no paid services. A tiny zero-dependency Node script generates the
static pages that Cloudflare Pages serves.

## Structure

```
build.mjs            Generator: reads data + content, writes public/
preview-server.mjs   Local preview with clean URLs (mirrors Cloudflare)
data/posts.json      Post metadata (title, date, slug, hero image, excerpt)
content/*.html       Post body fragments (the article HTML)
templates/styles.css Single stylesheet (copied into public/ on build)
public/              Generated output — this is what Cloudflare Pages serves
  index.html  about.html  notes.html
  post/<slug>.html
  images/     styles.css
```

## Build & preview

```bash
node build.mjs               # regenerate public/
node preview-server.mjs       # serve at http://localhost:8080
```

## Add a new blog post

1. Write the article HTML into `content/<name>.html` (use `<p>`, `<h2>`, `<ul>`,
   `<img src="/images/...">`, `<a href="...">` etc).
2. Drop any images into `public/images/`.
3. Add an entry to `data/posts.json`:
   ```json
   {
     "slug": "url-friendly-title",
     "content": "<name>",
     "title": "Human Title",
     "date": "2025-06-01",
     "readTime": "3 min read",
     "hero": "cover-image-filename.jpg",
     "excerpt": "One-sentence summary for cards and previews."
   }
   ```
4. `node build.mjs`, commit, push — Cloudflare Pages redeploys automatically.

## Deployment

Cloudflare Pages, connected to this GitHub repo.
Build command: *(none)* · Output directory: `public`
