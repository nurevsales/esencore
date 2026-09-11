# esencore.io

Static marketing site for Esencore Peptide Manufacturing. No build step, no
dependencies, no framework. Vercel serves these files as they are.

```
index.html                  the site — all CSS and JS inline, one file
privacy.html                \
terms.html                   |  policy pages, share /assets/legal.css
research-use-policy.html    /
404.html
assets/legal.css
img/                        photographs (created by fetch-images.sh)
fetch-images.sh             downloads the six photographs
favicon.svg / -32 / -16     browser tab icon
apple-touch-icon.png        iOS home screen
og.png                      link preview card (1200×630)
vercel.json                 clean URLs, caching, security headers
robots.txt / sitemap.xml
```

---

## 1. Deploy

You have already created `nurevsales/esencore` and opened Vercel's import
screen. Finish in this order:

1. **Push these files to the repo root.** Either drag them into GitHub's web
   uploader, or:

   ```bash
   git clone https://github.com/nurevsales/esencore.git
   cd esencore
   # copy the contents of this bundle in here
   bash fetch-images.sh          # downloads img/ — do this before committing
   git add -A
   git commit -m "Esencore site"
   git push
   ```

2. **Import in Vercel.** Framework Preset: **Other**. Leave Build Command and
   Output Directory empty — there is nothing to build. Deploy.

3. You get a `*.vercel.app` URL immediately. Check it before touching DNS.

Every later `git push` redeploys automatically.

---

## 2. Point esencore.io at it

In Vercel: **Project → Settings → Domains → Add**, enter `esencore.io`. Vercel
will offer to add `www.esencore.io` too — accept, it redirects to the apex.

Vercel then shows you the **exact records to create**. Use the values on that
screen, not values from anywhere else: Vercel now issues a *per-project* CNAME
target (something like `d1d4fc829fe7bc7c.vercel-dns-017.com`), so a value copied
from a tutorial will fail verification.

Expect two records, roughly:

| Host  | Type  | Value                                   |
| ----- | ----- | --------------------------------------- |
| `@`   | A     | the IP Vercel shows (usually `76.76.21.21`) |
| `www` | CNAME | the per-project target Vercel shows     |

In GoDaddy: **My Products → esencore.io → DNS → Manage Zones**.

- Delete GoDaddy's default parking `A` record on `@` and any conflicting
  `CNAME` on `www` first — a leftover record is the usual cause of Vercel
  reporting "invalid configuration".
- Add the two records above. TTL 600 is fine.
- **Leave your MX records alone** if you have email on this domain. You are only
  changing where the website points.

Propagation is usually minutes. Vercel issues the SSL certificate on its own
once the records resolve.

> Don't switch GoDaddy's nameservers to Vercel unless you want Vercel managing
> all DNS for the domain. The two records above are enough and lower-risk.

---

## 3. Before it goes public

### Blocking — the form loses inquiries until this is done

`index.html`, in the `CONFIG` object near the bottom, `contact.endpoint` is
`null`. In that state the form validates and thanks the visitor but **sends
nothing**.

Create a free form at [formspree.io](https://formspree.io), then:

```js
endpoint: 'https://formspree.io/f/xxxxxxxx',
```

Any endpoint accepting a JSON `POST` works — a Vercel serverless function, your
CRM's inbound webhook, whatever you already use. Submit a real test inquiry and
confirm it arrives before you announce the site.

### Blocking — fill in the legal placeholders

The three policy pages are **drafts**, written to be conservative and to match
the research-use positioning. Every company-specific fact is marked in cyan as
`[LEGAL ENTITY NAME]`, `[CONTACT EMAIL]`, `[EFFECTIVE DATE]` and so on. Search
the files for `[` to find them all.

**Have counsel review these before launch** — particularly the Research Use
Policy and the California privacy section. They are a solid starting draft, not
legal advice, and the research-use language is the part that actually protects
you.

### Recommended

- **Analytics.** There is a commented-out slot in `index.html`'s `<head>` with
  two cookie-free options. Uncomment one or leave it off.
- **Photography.** See below.

---

## 4. Replacing the photography

The six photographs are Pexels stock under the Pexels License (commercial use,
no attribution required). They are placeholders for real Esencore photography.

To swap one in, drop your own files into `img/` using the same names — for
example `img/facility-2600.jpg`, `-2000`, `-1400`, `-900` — and nothing else
changes. Shoot or crop roughly 16:10; the hero and facility want wider framing.

**One to prioritise:** `lyophilization` is a substitute. It shows vials in
stainless laboratory equipment, not a freeze dryer — no free-licensed
lyophilizer photograph exists. It reads fine to a general visitor; a scientist
will notice. That is the first shot worth taking yourself.

The page grades every photograph at runtime (darken, cool, vignette, grain) so
bright clinical source images land in the site's register. If your own
photography is already dark, soften the grade in `index.html`:

```css
.frame img{ filter: brightness(.72) contrast(1.12) saturate(.62); }
```

If an image file is missing the page falls back to the Pexels CDN copy, and if
that also fails it shows a designed tonal field — it never shows a broken image.

---

## 5. Editing content

Most repeated text lives in one `CONFIG` object near the bottom of
`index.html`: navigation, the six process stages and their explorer detail, the
quality chain, the service list, form dropdown options, footer links.

Section headlines and body copy sit in the markup itself, one block per
section, each labelled with a comment.

**Compliance note carried through the whole site:** nothing claims FDA, GMP,
cGMP, ISO, USP, sterile, aseptic, pharmaceutical-grade, clinical-grade, or
human-use status. Descriptions say what is done and documented. Keep new copy
inside that boundary — it is the site's main legal protection, and the hero
photograph's original stock caption used the word "sterile" where the alt text
here deliberately does not.

---

## 6. Accessibility and performance notes

- One `<h1>`; semantic heading order throughout.
- The process explorer is a real ARIA tablist — arrow keys, Home/End, focus
  management, and `#step-4` deep links.
- All motion respects `prefers-reduced-motion`.
- Parallax animates only `transform`, on one rAF-throttled scroll handler.
- Images carry `srcset`/`sizes`; the hero preloads, everything else lazy-loads.
