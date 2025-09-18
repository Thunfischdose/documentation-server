# MyCompany Documentation Server

A static documentation portal built with Next.js and MDX. It automatically discovers content from the `content/` directory, renders it with reusable components, and provides PDF export tooling plus sitemap/SEO metadata for search engines.

## Key Features

- **MDX Driven**: Place `.mdx` files under `content/` (e.g., `content/product1`). Includes support for nested folders, partial reuse (`<Include slug="..." />`), and front-matter metadata.
- **Themed Rendering**: Typography, tables, and custom image templates (`ImageSmall`, `ImageMedium`, `ImageBig`) are centrally configured in `src/theme.ts`.
- **Navigation Drawer**: A responsive burger menu lazily loads the documentation tree and offers full-text search.
- **Asset Organization**: Static files live under `public/assets/<product>/<page>/` and are referenced directly from MDX.
- **SEO Metadata**: Directory-level `seo.json` files provide titles, descriptions, and keywords that bubble up to pages.
- **PDF Export**: Headless Chromium script (`npm run export-pdf`) renders any URL to PDF using a dedicated print stylesheet.
- **Sitemap Generation**: `src/app/sitemap.ts` generates the primary sitemap; `src/app/image-sitemap.ts` lists major images; `src/app/robots.ts` produces a configurable robots.txt.

## Project Structure

```
content/               MDX source files (product directories, shared snippets)
public/assets/         Static assets grouped by product/page
scripts/export-pdf.mjs PDF export script (Playwright)
src/app/               Next.js App Router pages, layout, sitemap, robots
src/components/        MDX renderer, navigation menu, shared components
src/lib/mdx.ts         MDX utilities and SEO helpers
src/pdf/print.css      Stylesheet applied during PDF export
```

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run the development server**
   ```bash
   npm run dev
   ```
   Visit [http://localhost:3000](http://localhost:3000) to view the site with hot reload.

3. **Add documentation**
   - Create folders inside `content/`, e.g. `content/product1/`.
   - Add `.mdx` files for each page. Include partials with `<Include slug="general/basicInstructions" />`.
   - Attach static assets under `public/assets/<product>/<page>/`.

4. **SEO metadata (optional)**
   - Place a `seo.json` file inside any content directory:
     ```json
     {
       "seoTitle": "MyCompany Product 1 Documentation",
       "seoDescription": "Official MyCompany Product 1 guides and onboarding resources.",
       "seoKeywords": ["MyCompany", "Product 1", "user guide"]
     }
     ```

5. **Environment variables** *(optional but recommended for deployment)*
   - `NEXT_PUBLIC_SITE_URL`: Base URL for canonical tags, sitemap entries, and robots.txt. Example: `https://docs.mycompany.com`
   - `NEXT_PUBLIC_ROBOTS_DISALLOW`: Comma-separated list of URL paths to disallow in robots.txt. Example: `/beta,/internal`

6. **PDF export**
   - Install the Chromium runtime once: `npx playwright install chromium`
   - Run: `npm run export-pdf -- http://localhost:3000/product2/user-guide out/product2-user-guide.pdf`

7. **Static build**
   ```bash
   npm run build
   ```
   With `output: "export"` set in `next.config.ts`, the optimized static site is emitted to the `out/` directory, ready for static hosting.

## Deployment

1. Set environment variables (if needed) before running the build:
   ```bash
   set NEXT_PUBLIC_SITE_URL=https://docs.mycompany.com
   set NEXT_PUBLIC_ROBOTS_DISALLOW=/beta,/internal
   npm run build
   ```
2. Upload the contents of the `out/` directory (and static assets under `public/` if your host requires them separately) to your static hosting provider or CDN.

## PDF Export Script

`scripts/export-pdf.mjs` uses Playwright to render a given URL:
```bash
npm run export-pdf -- http://localhost:3000/product1/product1 out/product1-overview.pdf
```

## License

MIT License
