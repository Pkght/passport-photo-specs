#!/usr/bin/env node
// Checks a JPEG against the file rules in specs.json: format, pixel size, shape and file size.
// It can't judge head size, background, expression or lighting; check those by eye.
//
// Usage: node check-photo.mjs <document-id> <photo.jpg>
//        node check-photo.mjs --list
// No dependencies. Node 18 or newer.

import { readFileSync } from 'node:fs';

const specs = JSON.parse(readFileSync(new URL('./specs.json', import.meta.url), 'utf8'));
const [id, file] = process.argv.slice(2);

if (!id || id === '--list' || id === '--help') {
  console.log('Usage: node check-photo.mjs <document-id> <photo.jpg>\n\nDocument ids:');
  for (const d of specs.documents) console.log(`  ${d.id.padEnd(32)} ${d.name}`);
  process.exit(id === '--list' ? 0 : 1);
}

const doc = specs.documents.find((d) => d.id === id);
if (!doc) {
  console.error(`Unknown document id "${id}". Run with --list to see them.`);
  process.exit(1);
}
if (!doc.digital) {
  console.error(`"${doc.name}" has no digital upload rules (printed photo only).`);
  process.exit(1);
}
if (!file) {
  console.error('Give the photo file to check, e.g. node check-photo.mjs us-visa-ds160 photo.jpg');
  process.exit(1);
}

// Width and height from the JPEG start-of-frame marker.
function jpegSize(bytes) {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let i = 2;
  while (i + 9 < bytes.length) {
    if (bytes[i] !== 0xff) return null;
    const marker = bytes[i + 1];
    if (marker === 0xff) { i += 1; continue; } // fill byte
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { i += 2; continue; } // no length
    const length = (bytes[i + 2] << 8) | bytes[i + 3];
    const isFrame = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
    if (isFrame) return { height: (bytes[i + 5] << 8) | bytes[i + 6], width: (bytes[i + 7] << 8) | bytes[i + 8] };
    i += 2 + length;
  }
  return null;
}

const bytes = readFileSync(file);
const rules = doc.digital;
const results = [];
const check = (ok, text) => results.push({ ok, text });

const size = jpegSize(bytes);
check(Boolean(size), size ? 'File is a JPEG' : 'File is not a readable JPEG');

if (size) {
  const { width, height } = size;
  const px = `${width} × ${height} px`;
  if (rules.exact_px) {
    const [w, h] = rules.exact_px;
    check(width === w && height === h, `Size ${px} (needs exactly ${w} × ${h})`);
  }
  if (rules.min_px) {
    const [w, h] = rules.min_px;
    check(width >= w && height >= h, `Size ${px} (needs at least ${w} × ${h})`);
  }
  if (rules.max_px) {
    const [w, h] = rules.max_px;
    check(width <= w && height <= h, `Size ${px} (needs at most ${w} × ${h})`);
  }
  if (rules.aspect) {
    const [aw, ah] = rules.aspect.split(':').map(Number);
    const ratio = width / height;
    const target = aw / ah;
    check(Math.abs(ratio - target) / target < 0.01, `Shape ${(ratio).toFixed(3)}:1 (needs ${rules.aspect})`);
  }
}

// 1 KB = 1,000 bytes: passes forms that count either way.
const kb = bytes.length / 1000;
const kbText = `${kb.toFixed(1)} KB`;
if (rules.max_kb) {
  const ok = rules.max_exclusive ? kb < rules.max_kb : kb <= rules.max_kb;
  check(ok, `File ${kbText} (needs ${rules.max_exclusive ? 'under' : 'at most'} ${rules.max_kb} KB)`);
}
if (rules.min_kb) check(kb >= rules.min_kb, `File ${kbText} (needs at least ${rules.min_kb} KB)`);

console.log(`${doc.name}: ${file}\n`);
for (const r of results) console.log(`  ${r.ok ? 'PASS' : 'FAIL'}  ${r.text}`);
if (rules.head_ratio) {
  const [a, b] = rules.head_ratio.map((x) => Math.round(x * 100));
  console.log(`  ----  Head size not checked: it must be ${a}%–${b}% of the image height`);
}
if (rules.crop) console.log(`  ----  ${rules.crop}`);
console.log(`\nRules checked ${specs.checked}. Always confirm with the official source:`);
for (const s of doc.sources) console.log(`  ${s.url}`);
process.exit(results.every((r) => r.ok) ? 0 : 2);
