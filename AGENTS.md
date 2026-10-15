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
