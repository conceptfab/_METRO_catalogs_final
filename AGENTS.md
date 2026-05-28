<claude-mem-context>
# Memory Context

# [__METRO_catalogs_stage3] recent context, 2026-05-21 7:20pm GMT+2

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 50 obs (15,836t read) | 599,358t work | 97% savings

### May 19, 2026
S1704 LCP optimization for hero images in METRO catalogs — finish the implementation (May 19 at 10:37 PM)
4841 10:40p 🔵 HeroMCR800 Has Identical Missing fetchPriority Issue as HeroQX
4842 10:41p 🔵 HeroData Type Reveals First Hero Image URL Resolvable Server-Side
4843 " 🔵 CatalogPageQX Passes catalog.hero Directly to HeroQX — Preload Injection Point Confirmed
4844 11:12p 🟣 Hero image LCP optimization with fetchPriority and decoding attributes
4845 " 🟣 LCP image optimization applied to HeroMCR800 layout
4846 11:13p 🟣 Server-side hero image preload via ReactDOM.preload in catalog page
4847 " 🔵 TypeScript check and full test suite pass after LCP optimization changes
S1705 Mobile performance improvement plan for metro-catalogs Next.js project — analyze PageSpeed mobile report and write actionable improvement plan (May 19 at 11:13 PM)
4848 11:31p 🔵 metro-catalogs Next.js Project Structure Identified
4849 11:32p 🔵 metro-catalogs Has MCP/OAuth Integration and Responsive Image Infrastructure
4850 " 🔵 Responsive Image System: Feature Images Have No Responsive Variants
4851 " 🔵 HeroQX and HeroMCR800 Are Near-Identical Duplicates with framer-motion Animations
4852 " 🔵 Next.js Config: React Compiler Enabled, Custom Image Loader, No Analytics Scripts
4853 " 🔵 CatalogPage Pre-loads LCP Hero Image with ReactDOM.preload
4854 " 🔵 content-visibility: auto Already Applied to Below-Fold Catalog Sections
4855 11:33p 🔵 WebMcpProvider Is Zero-Cost for Regular Users — Exits Immediately Without modelContext
4856 " 🔵 Home Tile Pan Animations Use object-position — Non-Composited, Causes Repaints
4857 " 🔵 public/catalogs Directory Is 255MB of Static Assets Excluded from Vercel Bundles
4858 11:34p 🔵 print.css (729 Lines) Loaded Globally Without media="print" Attribute
4859 " 🔵 Full Mobile Performance Audit Summary: No Render-Blocking Scripts, Fonts Optimal, Robots Valid
4860 11:35p 🔵 FOTA Hero Images Are Massively Larger Than Other Catalogs at All Breakpoints
4861 " 🔵 Thumbnail Generator Uses Fixed quality=85 with No Per-Catalog Override — FOTA Heaviness Is Source Content
4862 " 🔵 Hero Thumbnails Have No Aspect Ratio Constraint — Full Source Dimensions Preserved
4863 11:36p 🔵 Hero Mobile sizes='200vh' Causes Browser to Select 1280w–1920w Variant Instead of 640w on Mobile
4864 11:37p 🔵 Gallery and Gallery-Thumb Mobile sizes Hints Are Also Oversized (200vw)
4865 11:39p 🔵 Hero Slides Are Configured via JSON Files Per Catalog — slider.json Drives LCP Image Selection
S1706 Mobile performance optimization: fix hero `sizes` LCP bug + doc cleanup in design-system page (May 19 at 11:48 PM)
S1722 Replace "EXECUTION" with "PRODUCTION" in the ConceptFab.com footer tagline across the METRO catalogs Stage 3 project (May 19 at 11:59 PM)
### May 20, 2026
4982 5:58p ✅ Updated footer tagline from EXECUTION to PRODUCTION
4983 " 🔵 CONCEPTFAB footer text defined in two source locations
4984 5:59p ✅ Updated footerText default in catalog-loader.ts
4985 " ✅ Footer tagline fully updated to PRODUCTION in both source files
S1723 Shorten hero taglines for FM, VR, TS catalogs to single-line headline phrases (May 20 at 5:59 PM)
4986 6:02p 🔵 VR catalog hero tagline contains literal "/n" instead of newline escape
4987 6:03p 🔵 FM/VR/TS slider.json files share identical generic slide descriptions
4988 " ✅ FM hero tagline shortened to single-line form
4989 " ✅ VR and TS hero taglines shortened to single-line headlines
S1725 Mobile PageSpeed performance improvement — analyze report and create/execute improvement plan; hero font size increased 30% as one action (May 20 at 6:03 PM)
4991 6:11p 🔵 Hero Text Font-Size Architecture in METRO Catalogs
4992 " 🔵 HeroQX Mobile Custom Properties Include Layout Alignment and Offset
4994 6:12p 🔵 Catalog Hero JSON Uses fontSizePx for Description Text, Not Hero Title
4995 " 🔵 Hero Text Mobile Alignment Defaults to Left; qx-word Inherits All Typography
4996 " ✅ Hero Text Default Font Size Increased from 2.4rem to 3.12rem
S1734 Mobile performance improvement — analyzing PageSpeed report and standardizing QX hero slider mobile text styles (May 20 at 6:13 PM)
5010 6:18p ✅ Mobile HERO Section Text Styling Update to Match QX Slide 2
5011 6:19p 🔵 QX Hero Slider JSON Structure — Slide 2 Has No mobileTextStyle
5012 " 🔵 globals.css Mobile HERO Text Architecture — Per-Catalog and Per-Slide CSS Overrides
5015 6:21p 🔵 FOTA Uses QX Layout; MCR800 Has No Mobile Hero Override in globals.css
5016 " 🔵 Only QX Slide 1 Has a mobileTextStyle Override Across All Catalogs
5022 6:30p ✅ Removed mobileTextStyle override from QX hero slider slide 1
5023 6:31p 🔵 No mobileTextStyle overrides remain in any catalog hero JSON files
S1741 Diagnose and resolve diverged git branches in METRO_catalogs_stage3 repo (user asked "co jest?" about a git error in VS Code) (May 20 at 6:31 PM)
5038 6:48p 🔵 METRO_catalogs_stage3 Git Branch Diverged
5040 6:50p 🔵 METRO_catalogs_stage3 Divergence: 4 Overlapping Binary Files Risk Merge Conflict
5041 6:51p 🔵 METRO_catalogs_stage3 Merge Confirmed Conflict-Free
S1742 Resolve diverged git branches in METRO_catalogs_stage3 — diagnosis, conflict check, and rebase execution (May 20 at 6:51 PM)
5042 6:52p ✅ METRO_catalogs_stage3 Rebase Completed Successfully
5043 6:53p ✅ METRO_catalogs_stage3 Pushed to GitHub — Branches Fully Synchronized
S1743 Resolve diverged git branches in METRO_catalogs_stage3 — full cycle: diagnosis → rebase → push (May 20 at 6:53 PM)
**Investigated**: Git state, branch divergence, merge base, per-commit file lists, blob-hash comparison of overlapping binary files, merge-tree dry run.

**Learned**: - A remote commit (e477554) pushed 221 regenerated webp assets + responsive-image-manifest.json from a build machine/second workstation, causing the divergence.
    - All 4 apparently overlapping FM RAL 9006 webp files had identical blob hashes — no true conflict existed.
    - Rebase produces cleaner linear history than merge for this type of single-commit divergence.

**Completed**: - Diagnosed divergence: local 0f0d653 vs remote e477554, common ancestor 7342f84.
    - Confirmed zero conflicts via blob-hash comparison and merge-tree dry run.
    - Executed git pull --rebase origin main — local chore commit re-hashed to b487c76, placed on top of e477554.
    - Executed git push — origin/main advanced from e477554 to b487c76.
    - Local and remote main are fully synchronized; VS Code git error resolved.
    - Live on GitHub: footer "PRODUCTION", FM/VR/TS taglines shortened, hero font +30%, QX slider color unified.

**Next Steps**: No active git task — repository is clean and fully synced. Awaiting next user task.


Access 599k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>

## Design System — obowiązkowe

Projekt posiada żywy design system pod `/design-system`:

- **Strona przeglądowa:** [src/app/design-system/page.tsx](src/app/design-system/page.tsx) — katalog tokenów (kolory, typografia, spacing), komponentów, wzorców sekcji katalogu QX
- **Tokeny CSS:** [src/app/globals.css](src/app/globals.css) — zmienne `--background`, `--foreground`, `--surface-elevated`, `--warm-light`, `--accent`, klasy `.section_ID`, `.section_Title`, `.sec_main_text`, `.qx-word`, oraz overrides motywu `.catalog-qx0`
- **Tailwind config:** [tailwind.config.ts](tailwind.config.ts) — semantyczne aliasy (`bg-surface-elevated`, `text-on-dark`, `text-foreground`, itd.)
- **Raport spójności:** [docs/design-system-consistency-report.md](docs/design-system-consistency-report.md)

### Zasada: każda zmiana UI kończy się aktualizacją design-systemu

Po każdej zmianie wpływającej na UI (nowy komponent, nowy wzorzec sekcji, nowy token kolorystyczny/typograficzny, nowa klasa utility, nowy preset obrazów, zmiana wymiarów/spacingu, nowa interakcja) **musisz**:

1. Zaktualizować [src/app/design-system/page.tsx](src/app/design-system/page.tsx) — dodać/zaktualizować wpis (token, komponent, wzorzec) tak, żeby strona pokazywała stan faktyczny
2. Jeśli wprowadzasz nowy token — dodać go w [src/app/globals.css](src/app/globals.css) i (jeśli trzeba) w [tailwind.config.ts](tailwind.config.ts), zamiast hardcodować wartości w komponencie
3. Używać istniejących tokenów/klas zamiast magicznych wartości (`bg-warm-light` zamiast `bg-[#f4efe6]`, `section_Title` zamiast custom font-size)
4. Sprawdzić [docs/design-system-consistency-report.md](docs/design-system-consistency-report.md) i odnotować nową decyzję, jeśli jest istotna systemowo

**Nie wolno:** dodawać arbitralnych wartości (`text-[19px]`, `#a3a3a3`, `mt-[37px]`) tam, gdzie istnieje token. Jeśli token nie istnieje, najpierw go zdefiniuj, potem użyj.
