# Portfolio V2 — Claire LEFEZ

A one-page portfolio built with vanilla HTML, CSS (vert chasseur theme), and JavaScript.

## 📁 Structure

```
Portfolio-V2/
├── index.html          ← Main page (all sections)
├── style.css           ← Vert chasseur theme, responsive layout
├── script.js           ← Interactions: nav, modal, animations
└── assets/
    ├── profile.jpg            ← ⚠ Add your profile photo here
    ├── CV_Claire_LEFEZ.pdf    ← ⚠ Add your CV PDF here
    ├── project-alpha.jpg      ← Creative project images
    ├── project-beta.jpg
    ├── project-gamma.jpg
    ├── dev-project-1.jpg      ← Web dev project images
    ├── dev-project-2.jpg
    └── dev-project-3.jpg
```

## ✏️ How to customise

### About section
Edit `index.html` → `<section id="about">` → update the bio text.

### Projects
Each `<article class="project-card">` has these data attributes to fill in:
- `data-title` — project name
- `data-date` — year(s)
- `data-description` — full description (shown in the modal)
- `data-skills` — comma-separated skill list, e.g. `"React,Node.js,CSS"`
- `data-link` — (optional) external URL for web dev projects

### Journey / Timeline
Edit the `.timeline-item` blocks in the `#journey` section.
Replace placeholder dates, titles, organisations, and descriptions.

### Skills
Adjust the `data-level` (0–100) on each `.skill-bar` and edit the labels.
Add or remove `.skill-tag` spans in the soft skills group.

### Testimonials
Replace the placeholder names, roles, and quotes in `#testimonials`.
Update the initials in `.testimonial-avatar`.

## 🌿 Colour palette (Vert Chasseur)
| Token | Hex | Usage |
|---|---|---|
| `--vc-900` | `#1a2e1a` | Dark backgrounds |
| `--vc-500` | `#4a7c4a` | Primary accent |
| `--vc-300` | `#8dbc8d` | Hover highlights |
| `--gold`   | `#c9a84c` | Warm contrast accent |

## 🚀 Running locally
Just open `index.html` in a browser — no build step needed.

For live reload during editing, use the VS Code **Live Server** extension.