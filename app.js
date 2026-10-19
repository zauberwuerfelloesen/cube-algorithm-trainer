'use strict';

const ALGORITHMS = [
  {
    "id": "line",
    "name": "Linie",
    "stage": "edges",
    "group": "OLL",
    "moves": "F R U R' U' F'"
  },
  {
    "id": "ell",
    "name": "L-Form",
    "stage": "edges",
    "group": "OLL",
    "moves": "f R U R' U' f'"
  },
  {
    "id": "dot",
    "name": "Punkt",
    "stage": "edges",
    "group": "OLL",
    "moves": "F R U R' U' F' f R U R' U' f'"
  },
  {
    "id": "sune",
    "name": "Sune",
    "stage": "corners",
    "group": "OLL",
    "moves": "R U R' U R U2 R'"
  },
  {
    "id": "antisune",
    "name": "Anti-Sune",
    "stage": "corners",
    "group": "OLL",
    "moves": "R U2 R' U' R U' R'"
  },
  {
    "id": "oh",
    "name": "H-Form",
    "stage": "corners",
    "group": "OLL",
    "moves": "R U R' U R U' R' U R U2 R'"
  },
  {
    "id": "pi",
    "name": "Pi-Form",
    "stage": "corners",
    "group": "OLL",
    "moves": "R U2 R2 U' R2 U' R2 U2 R"
  },
  {
    "id": "ou",
    "name": "U-Form",
    "stage": "corners",
    "group": "OLL",
    "moves": "R2 D R' U2 R D' R' U2 R'"
  },
  {
    "id": "ot",
    "name": "T-Form",
    "stage": "corners",
    "group": "OLL",
    "moves": "r U R' U' r' F R F'"
  },
  {
    "id": "ol",
    "name": "L-Form",
    "stage": "corners",
    "group": "OLL",
    "moves": "F R' F' r U R U' r'"
  },
  {
    "id": "tperm",
    "name": "T-Perm",
    "stage": "pcorners",
    "group": "PLL",
    "moves": "R U R' U' R' F R2 U' R' U' R U R' F'"
  },
  {
    "id": "yperm",
    "name": "Y-Perm",
    "stage": "pcorners",
    "group": "PLL",
    "moves": "F R U' R' U' R U R' F' R U R' U' R' F R F'"
  },
  {
    "id": "ua",
    "name": "Ua-Perm",
    "stage": "pedges",
    "group": "PLL",
    "moves": "R U' R U R U R U' R' U' R2"
  },
  {
    "id": "ub",
    "name": "Ub-Perm",
    "stage": "pedges",
    "group": "PLL",
    "moves": "R2 U R U R' U' R' U' R' U R'"
  },
  {
    "id": "hperm",
    "name": "H-Perm",
    "stage": "pedges",
    "group": "PLL",
    "moves": "M2 U M2 U2 M2 U M2"
  },
  {
    "id": "zperm",
    "name": "Z-Perm",
    "stage": "pedges",
    "group": "PLL",
    "moves": "M' U M2 U M2 U M' U2 M2 U'"
  }
];
const LESSONS = {
  edges: { title: '1 · Gelbes Kreuz', subtitle: 'OLL · Kanten orientieren', text: 'Voraussetzung: Die ersten zwei Ebenen sind gelöst. Betrachte nur die vier gelben Kanten. Halte die obere Seite wie im Diagramm und wende den passenden Fall an. Ein fertiges Kreuz kannst du überspringen.' },
  corners: { title: '2 · Gelbe Ecken', subtitle: 'OLL · Ecken orientieren', text: 'Voraussetzung: Gelbes Kreuz und gelöste erste zwei Ebenen. Vergleiche die gelben Ecken auf U und den Seiten. Drehe nur U, bis der Fall zum Diagramm passt. Danach ist die gelbe Fläche vollständig.' },
  pcorners: { title: '3 · Ecken positionieren', subtitle: 'PLL · Ecken tauschen', text: 'Voraussetzung: Die gelbe Fläche ist fertig. Bringe die Ecken durch U-Züge in die bestmögliche Position. T-Perm tauscht benachbarte, Y-Perm diagonal gegenüberliegende Ecken; die Kanten dürfen dabei wechseln. Drehe U danach bei Bedarf nach.' },
  pedges: { title: '4 · Kanten positionieren', subtitle: 'PLL · Kanten tauschen', text: 'Voraussetzung: Alle Ecken stehen richtig. Vergleiche die Seitenfarben der Kanten. Ua und Ub bewegen drei Kanten, H tauscht gegenüberliegende, Z benachbarte Kantenpaare. Abschließend kann ein U-Zug nötig sein.' }
};
const DAY = 86400000;
const MAX_FILE = 1024 * 1024;

function clean(raw) {
  const result = {};
  for (const a of ALGORITHMS) {
    const v = raw?.[a.id];
    if (!v || !Number.isSafeInteger(v.attempts) || v.attempts < 0 || v.attempts > 10000000 ||
        !Number.isSafeInteger(v.success) || v.success < 0 || v.success > v.attempts ||
        ![0, 1, 2].includes(v.grade)) continue;
    result[a.id] = {
      attempts: v.attempts, success: v.success, grade: v.grade,
      streak: Number.isSafeInteger(v.streak) && v.streak >= 0 ? Math.min(v.streak, 1000) : 0,
      due: Number.isSafeInteger(v.due) && v.due >= 0 && v.due <= 8640000000000000 ? v.due : 0,
      reviewed: Number.isSafeInteger(v.reviewed) && v.reviewed >= 0 && v.reviewed <= 8640000000000000 ? v.reviewed : 0
    };
  }
  return result;
}
function review(previous, grade, now = Date.now()) {
  if (![0, 1, 2].includes(grade)) throw new Error('Ungültige Bewertung');
  const old = previous || { attempts: 0, success: 0, streak: 0 };
  const streak = grade === 2 ? old.streak + 1 : 0;
  const delay = grade === 0 ? 600000 : grade === 1 ? DAY : [1, 3, 7, 14, 30, 60][Math.min(streak - 1, 5)] * DAY;
  return { attempts: old.attempts + 1, success: old.success + (grade === 2 ? 1 : 0), grade, streak, due: now + delay, reviewed: now };
}
function parseImport(text) {
  if (new TextEncoder().encode(text).length > MAX_FILE) throw new Error('Die Datei darf höchstens 1 MB groß sein.');
  let parsed;
  try { parsed = JSON.parse(text.replace(/^\uFEFF/, '')); } catch { throw new Error('Das ist keine gültige JSON-Datei.'); }
  if (!parsed || ![1, 2].includes(parsed.version) || !parsed.progress || typeof parsed.progress !== 'object' || Array.isArray(parsed.progress)) {
    throw new Error('Bitte einen Fortschrittsexport dieses Trainers verwenden (Version 1 oder 2).');
  }
  const valid = clean(parsed.progress);
  if (Object.keys(parsed.progress).length && !Object.keys(valid).length) throw new Error('Keine gültigen Einträge gefunden.');
  return valid;
}
function mergeProgress(local, incoming) {
  const out = { ...local };
  for (const [id, v] of Object.entries(incoming)) {
    const old = out[id];
    if (!old || v.reviewed > old.reviewed || (v.reviewed === old.reviewed && v.attempts > old.attempts)) out[id] = v;
  }
  return out;
}
function pick(pool, progress, lastId, dueOnly, now = Date.now()) {
  const candidates = pool.filter(a => !dueOnly || !progress[a.id] || progress[a.id].due <= now);
  if (!candidates.length) return null;
  const different = candidates.filter(a => a.id !== lastId);
  return (different.length ? different : candidates).sort((a, b) =>
    (progress[a.id]?.due || 0) - (progress[b.id]?.due || 0) || ALGORITHMS.indexOf(a) - ALGORITHMS.indexOf(b))[0];
}
if (typeof module !== 'undefined') module.exports = { ALGORITHMS, LESSONS, clean, review, parseImport, mergeProgress, pick, DAY };

if (typeof document !== 'undefined') {
  const $ = id => document.getElementById(id), KEY = 'zwl-trainer-v1';
  let progress = {}, current = null, phase = 'ready', started = 0, interval;
  try { progress = clean(JSON.parse(localStorage.getItem(KEY))); } catch {}
  const pool = () => ALGORITHMS.filter(a => $('group').value === 'all' || a.stage === $('group').value);
  const dueOnly = () => $('mode').value === 'due';

  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(progress)); return true; }
    catch { $('feedback').textContent = 'Nur für diese Sitzung gespeichert. Exportiere deinen Fortschritt, um ihn zu behalten.'; return false; }
  }
  function dueLabel(v) {
    if (!v) return 'Neu';
    if (v.due <= Date.now()) return 'Jetzt fällig';
    return 'Wiederholen: ' + new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' }).format(v.due);
  }
  function stats() {
    const values = Object.values(progress);
    const attempts = values.reduce((n, v) => n + v.attempts, 0);
    const success = values.reduce((n, v) => n + v.success, 0);
    $('attempts').textContent = attempts;
    $('accuracy').textContent = attempts ? Math.round(success / attempts * 100) + ' %' : '—';
    $('learned').textContent = values.filter(v => v.grade === 2).length + ' / ' + ALGORITHMS.length;
    $('due-count').textContent = ALGORITHMS.filter(a => !progress[a.id] || progress[a.id].due <= Date.now()).length;
    $('library').replaceChildren();
    for (const [stage, lesson] of Object.entries(LESSONS)) {
      const section = document.createElement('section'), heading = document.createElement('h3');
      heading.textContent = lesson.title; section.append(heading);
      for (const a of ALGORITHMS.filter(a => a.stage === stage)) {
        const row = document.createElement('div'); row.className = 'library-row';
        const text = document.createElement('div'), title = document.createElement('b'), detail = document.createElement('small');
        title.textContent = a.name;
        const v = progress[a.id]; detail.textContent = (v ? v.attempts + ' Versuche · ' : '') + dueLabel(v);
        text.append(title, detail);
        const button = document.createElement('button');
        button.textContent = 'Üben'; button.setAttribute('aria-label', a.group + ' ' + a.name + ' üben');
        button.onclick = () => {
          $('group').value = a.stage; $('mode').value = 'free'; show(a);
          $('practice').scrollIntoView({ behavior: 'smooth', block: 'start' });
        };
        row.append(text, button); section.append(row);
      }
      $('library').append(section);
    }
  }
  function show(a) {
    clearInterval(interval); current = a; phase = 'ready';
    $('clock').textContent = '00:00.0'; $('solution').hidden = true; $('feedback').textContent = '';
    $('active-case').hidden = !a; $('empty').hidden = !!a;
    if (!a) {
      $('empty').textContent = 'Für diese Auswahl ist alles erledigt. Wähle „Frei üben“, um weiterzumachen. Deine nächsten Wiederholungen stehen in der Sammlung.';
      return;
    }
    const lesson = LESSONS[a.stage];
    $('name').textContent = a.name; $('hint').textContent = lesson.subtitle;
    $('lesson-title').textContent = lesson.title; $('lesson-text').textContent = lesson.text;
    $('category').textContent = a.group; $('position').textContent = 'Fall ' + (ALGORITHMS.indexOf(a) + 1) + ' / ' + ALGORITHMS.length;
    $('inverse').textContent = Cube.inverse(a.moves); $('algorithm').textContent = a.moves;
    $('case-diagram').innerHTML = Cube.svg(Cube.apply(Cube.solved(), Cube.inverse(a.moves)), a.name + ': Beispielstellung vor dem Algorithmus');
    $('due-date').textContent = dueLabel(progress[a.id]);
    $('start').textContent = 'Übung starten'; $('start').hidden = false;
    $('setup-details').open = false;
  }
  function next() { show(pick(pool(), progress, current?.id, dueOnly())); }
  function tick() {
    const t = Math.floor((performance.now() - started) / 100);
    $('clock').textContent = String(Math.floor(t / 600)).padStart(2, '0') + ':' + String(Math.floor(t / 10) % 60).padStart(2, '0') + '.' + t % 10;
  }
  function startStop() {
    if (!current) return;
    if (phase === 'ready') {
      phase = 'running'; started = performance.now(); interval = setInterval(tick, 100);
      $('start').textContent = 'Stoppen & Lösung anzeigen';
    } else if (phase === 'running') {
      tick(); clearInterval(interval); phase = 'revealed';
      $('solution').hidden = false; $('start').hidden = true;
    }
  }
  $('start').onclick = startStop;
  document.addEventListener('keydown', event => {
    if (event.code === 'Space' && !event.repeat && !/INPUT|SELECT|TEXTAREA|BUTTON|SUMMARY|A/.test(event.target.tagName) && !event.ctrlKey && !event.altKey && !event.metaKey) {
      event.preventDefault(); startStop();
    }
  });
  document.querySelectorAll('[data-grade]').forEach(button => button.onclick = () => {
    if (phase !== 'revealed') return;
    const name = current.name;
    progress[current.id] = review(progress[current.id], Number(button.dataset.grade));
    next(); stats();
    if (persist()) $('feedback').textContent = name + ' gespeichert. Die nächste Wiederholung ist geplant.';
  });
  $('group').onchange = $('mode').onchange = () => { current = null; next(); };
  $('reset').onclick = () => {
    if (confirm('Deinen lokal gespeicherten Fortschritt wirklich zurücksetzen? Ein Export bleibt erhalten.')) {
      progress = {}; next(); stats(); persist();
    }
  };
  $('export').onclick = () => {
    const data = { version: 2, exportedAt: new Date().toISOString(), progress };
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = 'zauberwuerfel-fortschritt.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  $('import-toggle').onclick = () => {
    $('import-panel').hidden = !$('import-panel').hidden;
    if (!$('import-panel').hidden) $('import-json').focus();
  };
  $('import-file').onchange = async event => {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > MAX_FILE) { $('import-status').textContent = 'Die Datei darf höchstens 1 MB groß sein.'; return; }
    try { $('import-json').value = await file.text(); $('import-status').textContent = 'Datei gelesen. Prüfen und zusammenführen, um zu importieren.'; }
    catch { $('import-status').textContent = 'Datei konnte nicht gelesen werden.'; }
  };
  $('import-confirm').onclick = () => {
    try {
      const incoming = parseImport($('import-json').value);
      progress = mergeProgress(progress, incoming); next(); stats();
      const stored = persist();
      $('import-status').textContent = Object.keys(incoming).length + ' gültige Einträge verarbeitet. Neuere lokale Einträge bleiben erhalten.' + (stored ? '' : ' Nur für diese Sitzung; bitte exportieren.');
    } catch (error) { $('import-status').textContent = error.message; }
  };
  document.addEventListener('visibilitychange', () => { if (!document.hidden) stats(); });
  next(); stats();
}

