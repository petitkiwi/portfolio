# Portfolio V2 — Claire LEFEZ

A one-page personal portfolio built with vanilla HTML, CSS (vert chasseur theme), and JavaScript (no build needed). 

## 📁 Structure

```
Portfolio-V2/
├── index.html                     ← Main page (all sections)
├── style.css                      ← Vert chasseur theme, responsive layout
├── script.js                      ← Nav, modal, scroll animations, skill bars
└── assets/
    ├── logo_dark.png              ← Favicon
    ├── logo_light.png             ← Navbar logo
    ├── profile.JPG                ← Profile photo
    ├── IMG-0059.JPG               ← Alternative profile photo
    ├── flag-breizh.png            ← Breton flag (gwenn-ha-du)
    ├── Resume_ClaireLEFEZ.pdf     ← Downloadable CV
    ├── testimonial_TOTALENERGIES.pdf
    ├── testimonial_UOB.pdf
    └── testimonial_CHANEL.pdf
```

## 🗂️ Sections

| Section | Description |
|---|---|
| **About** | Bio, profile photo, CTA buttons |
| **Journey** | Timeline — 3 work + 3 education entries |
| **Skills** | Skill bars (programming, tools) + tag cards (methods, languages) |
| **Projects** | 6 project cards with modal detail view |
| **Testimonials** | 3 recommendation letters with PDF links |
| **Contact** | Email / LinkedIn / GitHub links |

### Projects
Each `<article class="project-card">` uses data attributes for the modal:
- `data-title` — project name
- `data-date` — year(s)
- `data-description` — full description shown in the modal
- `data-skills` — comma-separated skills, e.g. `"React,Node.js,CSS"`
- `data-link` — (optional) external URL

### Skills
Adjust `data-level` (0–100) on each `.skill-bar` for the animated bar fill.
Add or remove `.skill-tag` spans in the methods/soft skills group.

### Timeline
Edit `.timeline-item` blocks in `#journey`. Each entry has a date, title, organisation, description, and tag badge.

## 🌿 Colour palette (Vert Chasseur)

| Token | Hex | Usage |
|---|---|---|
| `--vc-900` | `#1a2e1a` | Hero & footer backgrounds |
| `--vc-800` | `#243524` | Navbar, testimonial cards |
| `--vc-500` | `#4a7c4a` | Primary accent |
| `--vc-300` | `#8dbc8d` | Hover highlights |
| `--gold`   | `#c9a84c` | Timeline work dots, tagline |
| `--cream`  | `#f5f0e8` | Main light background |