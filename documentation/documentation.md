# Lumen Studio Documentation

## 1. Installation guide
1. Unzip `photography-studio`.
2. Open `pages/index.html` to preview locally.
3. Upload the folder to your host. Keep the `assets/` and `pages/` folders side by side (pages load files with `../assets/`).
4. Optional: serve `pages/` as your site root and move `index.html` up one level (then change `../assets/` to `assets/`).
5. Production tip: minify `assets/css/*.css` and `assets/js/*.js`, convert photos to WebP.

## 2. Customization guide
- **Studio name, phone, email, address, hours, menu links:** the `<header>` and `<footer>` blocks, which are plain HTML repeated in every page in `pages/` (edit each page, or use find-and-replace across the folder). The `active` class on the current menu link is set by hand per page.
- **Colors:** `:root` variables in `assets/css/style.css` (`--color-primary`, `--color-secondary`, `--color-accent`). Dark colors are in `dark-mode.css`.
- **Fonts:** change the Google Fonts link in each page `<head>` and the `--font-heading` / `--font-body` variables.
- **Photos:** placeholders come from picsum.photos. Replace each `src` with your own images in `assets/images/` (keep the `alt` text meaningful).
- **Prices and packages:** edit `packages.html` and the `prices` object in `assets/js/main.js`.
- **Search for `TODO`** in the code to find every customization point.
- **Dark mode / RTL:** toggle buttons are in the header. Choices are remembered in the browser.
- **Domain:** replace `www.example.com` in `sitemap.xml`, `robots.txt` and the JSON-LD block.

## 3. Page structure
See README. Public pages share the same header, footer, buttons, cards and forms. The booking page is a 5-step wizard. The dashboard is one page with sections switched by JavaScript (no reload), driven by mock data in `assets/js/dashboard.js`.

## 4. Integrations (placeholders)
| Feature | Where | What to do |
|---|---|---|
| Contact form | `contact.html` | Set the form `action` to your Formspree URL, or add `data-netlify="true"` |
| Newsletter | home, coming soon | Point the form to your Mailchimp / ConvertKit form |
| Map | `contact.html` | Paste your Google Maps embed |
| Calendar | `booking.html` (`#calendar-placeholder`) | Embed Calendly, Cal.com or Google Calendar |
| Payments | `packages.html`, dashboard checkout | Add Stripe Payment Links or PayPal buttons |
| Login and dashboard data | `login.html`, `dashboard.js` | The login is a demo. Connect real authentication and an API, then replace `MOCK` data |

## 5. Credits
Bootstrap 5.3 (MIT), Bootstrap Icons (MIT), Google Fonts: DM Sans and Fraunces (OFL), placeholder photos: picsum.photos (random Unsplash photos). Replace placeholders with your own images before launch.

## 6. Changelog
- 1.0.0 - First release.

## 7. Support
Email: support@your-domain.example (TODO: add your support contact).

## Notes
- The dashboard is front-end only. Favourites are saved in the browser (`localStorage`); real accounts need a backend.
- Run the pages through the W3C validator and a PageSpeed test after you replace the placeholders.

## Home pages and header dropdown
The header "Home" menu is a dropdown written in the `<header>` HTML of each page. Add another home layout by creating the page and adding one `<li>` to that dropdown in every page.
- Home 1 (`index.html`): hero, stats, intro, portfolio, services, why choose us, how it works, packages, testimonials, FAQ, Instagram, newsletter, CTA.
- Home 2 (`index-2.html`): split hero, marquee, team, interactive services list, featured stories, before/after slider, swipe gallery, products, awards and press, journal, gift voucher, studio visit and enquiry form. No section is repeated from Home 1.

## Design
Colours and fonts live at the top of `assets/css/style.css` (`:root`) and `dark-mode.css`.
