#!/usr/bin/env node
/*
 * Gestor de publicación del blog LOOM.IA
 * -------------------------------------------------------------
 * Fuente de verdad:
 *   data/posts.json   -> posts PUBLICADOS  (se despliegan)
 *   data/drafts.json  -> BORRADORES        (locales, en .gitignore)
 *
 * Genera siempre los .js que consume el sitio:
 *   data/posts.js     -> const BLOG_POSTS  (publicados)
 *   data/drafts.js    -> const BLOG_DRAFTS (borradores, no se sube)
 *
 * Uso:
 *   node scripts/blog.js list
 *   node scripts/blog.js publish <id>
 *   node scripts/blog.js unpublish <id>
 *
 * Regla de oro: un borrador NUNCA debe quedar en posts.json/posts.js.
 */

const fs = require('fs');
const path = require('path');

const DATA = path.join(__dirname, '..', 'data');
const POSTS_JSON = path.join(DATA, 'posts.json');
const DRAFTS_JSON = path.join(DATA, 'drafts.json');
const POSTS_JS = path.join(DATA, 'posts.js');
const DRAFTS_JS = path.join(DATA, 'drafts.js');

function readArr(file) {
  if (!fs.existsSync(file)) return [];
  const txt = fs.readFileSync(file, 'utf8').trim();
  return txt ? JSON.parse(txt) : [];
}

function j(arr) {
  return JSON.stringify(arr, null, 4) + '\n';
}

// Reescribe los 4 archivos a partir de los dos arrays en memoria.
function writeAll(published, drafts) {
  const byId = (a, b) => a.id - b.id;
  published = [...published].sort(byId);
  drafts = [...drafts].sort(byId);

  fs.writeFileSync(POSTS_JSON, j(published));
  fs.writeFileSync(POSTS_JS, 'const BLOG_POSTS = ' + j(published).trimEnd() + ';\n');
  fs.writeFileSync(DRAFTS_JSON, j(drafts));
  fs.writeFileSync(DRAFTS_JS, 'const BLOG_DRAFTS = ' + j(drafts).trimEnd() + ';\n');
}

function fmt(p) {
  return `  #${p.id}  ${p.slug.padEnd(34)} ${p.title}`;
}

function list() {
  const published = readArr(POSTS_JSON);
  const drafts = readArr(DRAFTS_JSON);
  console.log('\nPUBLICADOS (en vivo):');
  console.log(published.length ? published.sort((a, b) => a.id - b.id).map(fmt).join('\n') : '  (ninguno)');
  console.log('\nBORRADORES (locales, no publicados):');
  console.log(drafts.length ? drafts.sort((a, b) => a.id - b.id).map(fmt).join('\n') : '  (ninguno)');
  console.log('');
}

function move(id, dir) {
  id = String(id);
  let published = readArr(POSTS_JSON);
  let drafts = readArr(DRAFTS_JSON);

  const from = dir === 'publish' ? drafts : published;
  const fromName = dir === 'publish' ? 'borradores' : 'publicados';

  const idx = from.findIndex((p) => String(p.id) === id);
  if (idx === -1) {
    const inOther = (dir === 'publish' ? published : drafts).some((p) => String(p.id) === id);
    if (inOther) {
      console.error(`El post #${id} ya está ${dir === 'publish' ? 'publicado' : 'en borradores'}. Nada que hacer.`);
    } else {
      console.error(`No existe ningún post #${id} en ${fromName}.`);
    }
    process.exit(1);
  }

  const [post] = from.splice(idx, 1);

  if (dir === 'publish') {
    delete post.active; // publicado = sin flag (active !== false)
    published.push(post);
    console.log(`Publicado #${post.id} — "${post.title}"`);
  } else {
    post.active = false; // borrador
    drafts.push(post);
    console.log(`Despublicado #${post.id} — "${post.title}" (vuelve a borradores)`);
  }

  writeAll(published, drafts);
  console.log('Archivos regenerados: posts.json, posts.js, drafts.json, drafts.js');
  console.log('Recordá commitear posts.js y posts.json (drafts.* están en .gitignore).');
}

const [cmd, arg] = process.argv.slice(2);

switch (cmd) {
  case 'list':
    list();
    break;
  case 'publish':
  case 'unpublish':
    if (!arg) {
      console.error(`Falta el id. Uso: node scripts/blog.js ${cmd} <id>`);
      process.exit(1);
    }
    move(arg, cmd);
    break;
  default:
    console.log('Comandos: list | publish <id> | unpublish <id>');
    process.exit(cmd ? 1 : 0);
}
