# Konkur notebook (دفترچه کنکور ارشد)

A study site for the Iranian M.Sc. entrance exam in computer engineering (کنکور ارشد، رشته مهندسی و علم کامپیوتر، ۱۴۰۶).
Each course is split into **patterns**: question types that come back year after year. Every pattern has a short
review, how to recognise it, a fast method, common traps, an interactive tool where useful, a worked past question,
and past questions to practise with step-by-step solutions. Each course also has a timed self-test with negative marking.

The site is Persian, right-to-left, works on phones and desktops, has light and dark themes, and runs fully offline.
Progress is kept in the browser (`localStorage`, key `kn1406.v1`).

## Layout

```
build.py                 builds everything (plain Python 3, no packages)
tools/verify.py          all checks; build.py runs them, or run it alone
content/
  courses.json           exam info + every course of the exam (registry)
  site.json              page texts (home, exam day)
  plan.json              study plan (days -> patterns)
  <course>/<ID>-<slug>.json   one file per pattern, with its questions
  <course>/selftest.json      self-test question list (+ questions used only there)
  img/<course>/*.webp    images used by pattern reviews (optional)
keys/answer-keys.json    answer keys, kept apart from the content
fonts/                   Vazirmatn (SIL Open Font License 1.1)
web/
  template.html, style.css
  js/core/               helpers, storage, math renderer, icons, dates, registries
  js/components/         question card, pattern section, self-test, rings, widgets
  js/tools/              one file per interactive tool / figure / table
  js/views/              home (map), course page, exam-day page
  js/boot/               navigation, routing, theme, start-up
docs/                    build output for GitHub Pages (commit this folder)
```

The JS files are plain scripts. The build joins them in the order core, components, tools, views, boot
(files sorted by name inside each folder) into one function scope. There is no bundler and no runtime module system.

## Build

```
python build.py
```

Outputs:

- `../Executables/konkur-notebook.html`: one self-contained file (fonts and images inlined). Open it from disk.
- `docs/`: the site for GitHub Pages (`index.html`, `manifest.webmanifest`, icons, `sw.js`, `img/`).
  The service worker caches everything on the first visit, so the site then works offline.
  Its cache name is a hash of the files, so each new deploy replaces the old cache.
  Publish by pointing GitHub Pages at the `docs/` folder of the default branch.

The build stops with a list of errors if anything is wrong, for example:

- a question key differs from `keys/answer-keys.json`, or a question is missing from it (or the other way round),
- a question does not have exactly 4 options, or its year/number differ from its id,
- a source label breaks the rules in `keys/answer-keys.json` (`srcRules`),
- a pattern names a tool, figure, table or image that does not exist,
- the solver checks (re-solving computational questions) fail,
- any external URL would be loaded by the page.

It warns (but continues) when an image is larger than 150 KB, and prints a summary: courses, patterns,
questions per course and per year, keys checked, tools, image sizes.

## Add a course

1. In `content/courses.json` set `"hasContent": true` for the course and give it a `short` name for the
   navigation bar, an `icon` (a name from `web/js/core/30-icons.js`, or leave it out) and a `color`:
   `{"light": "#hex", "lightSoft": "rgba(...)", "dark": "#hex", "darkSoft": "rgba(...)"}`.
2. Create `content/<course id>/` and add pattern files (below) and, if you want a self-test, `selftest.json`.
3. Add every question id and its key to `keys/answer-keys.json` (`expected`).
4. Run `python build.py`.

Navigation, the home map, the course page and the exam-structure card are all generated from the registry.
A course without content shows as a «به‌زودی» card and gets no page.

## Add a pattern

Create `content/<course>/<ID>-<slug>.json` (the file name must start with the pattern id).
Patterns of a course appear in file-name order.

```json
{
  "id": "A1",
  "course": "ai",
  "title": "مقایسه جستجوهای ناآگاهانه",
  "en": "Uninformed search",
  "frequency": "در ۴ کنکور از ۵ کنکور ۱۴۰۱ تا ۱۴۰۵ آمده",
  "rank": { "order": 1, "repeat": "۴ از ۵", "hours": 1 },
  "review": [
    { "type": "text", "html": "BFS لایه به لایه جلو می‌رود و زمانش $O(b^d)$ است" },
    { "type": "img", "src": "img/ai/A1-bfs-layers.webp", "alt": "لایه‌های BFS", "caption": "ترتیب بسط گره‌ها" },
    { "type": "svg", "name": "figHeur" }
  ],
  "cue": ["..."],
  "how": ["..."],
  "trap": ["..."],
  "table": "searchTable",
  "tool": "ab",
  "example": "ai-1404-68",
  "practice": ["ai-1403-75", "ai-1403-72"],
  "questions": [
    {
      "id": "ai-1404-68", "year": 1404, "number": 68, "src": "k", "key": 4,
      "figure": "figAB1404",
      "text": "کدام گزاره درست است؟",
      "options": ["...", "...", "...", "..."],
      "steps": ["...", "... ← <b>گزینه ۴</b>"]
    }
  ]
}
```

Fields:

- Text fields may hold `$...$` math (a small TeX subset: `\frac`, `\sqrt`, `^`, `_`, `\log`, Greek letters, relations)
  and small HTML (`<br>`, `<b>`, `<small>`).
- `rank` (optional): position in the home page list "most marks per hour".
- `review` (optional): the «یادآوری» box shown first in the pattern, open until the reader closes it.
  Blocks: `text` (`html`), `img` (`src` under `content/img/<course>/`, `alt`, optional `caption`),
  `svg` (`name` of a registered figure, optional `caption`). In `docs/` images are separate cached files;
  in the single file they are inlined.
- `table`, `tool`, `figure`: names registered in `web/js/tools/` (see below). Optional.
- `example`: the worked question; `practice`: questions to solve. Every question in the file must be one of them.
- Question `id` is `<course>-<year>-<number>`. `src` is the key source: `s` final Sanjesh key, `k` Sanjesh key,
  `v` independent solution. `key` is 1 to 4.

`selftest.json`:

```json
{ "course": "ai", "ids": ["ai-1405-72", "ai-1404-70"], "questions": [ { "id": "ai-1405-72", "...": "..." } ] }
```

`ids` may point to any question of the course; `questions` holds the ones that are not in a pattern file.
The test gives 135 seconds per question and scores `(3C − W) / 3N`.

## Add a tool, figure or table

Create a file in `web/js/tools/` and register it by name:

```js
regTool('myTool', function (el) { el.innerHTML = wgHead('عنوان') + '...'; /* wire events inside el */ });
regFig('figMine', function () { return '<svg ...>...</svg>'; });
regTable('myTable', function () { return '<div class="tw"><table class="dt">...</table></div>'; });
```

Then refer to it from content: `"tool": "myTool"`, `"figure": "figMine"`, `"table": "myTable"`,
or `{"type": "svg", "name": "figMine"}` in a review. The build checks that every name exists.

## Checks only

```
python tools/verify.py
```
