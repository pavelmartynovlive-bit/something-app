import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

// Кешируем всю конкретную сборку, включая хешированные JS/CSS Vite.
// Это работает уже после первого открытия, без повторной загрузки страницы.
const directory = resolve('dist');
async function filesIn(path = '') {
  const entries = await readdir(resolve(directory, path), { withFileTypes: true });
  const files = await Promise.all(entries.map(entry => {
    const name = path ? `${path}/${entry.name}` : entry.name;
    return entry.isDirectory() ? filesIn(name) : [name];
  }));
  return files.flat();
}
// Original editing sources are not needed offline; only prepared SFX are cached.
const files = (await filesIn()).filter(name => name !== 'sw.js'
  && !name.startsWith('assets/audio/source/')
  && !name.endsWith('.md')).sort();
const hash = createHash('sha256');
for (const name of files) hash.update(name).update(await readFile(resolve(directory, name)));
const version = hash.digest('hex').slice(0, 16);
await writeFile(resolve(directory, 'sw.js'), `
const PREFIX = 'tanya:' + self.registration.scope + ':';
const CACHE = PREFIX + '${version}';
const FILES = ${JSON.stringify(files)};
const urls = FILES.map(path => new URL(path, self.registration.scope).href);
const optionalAudio = urls.filter(url => new URL(url).pathname.includes('/assets/audio/sfx/'));
const required = urls.filter(url => !optionalAudio.includes(url));
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(async cache => {
    // Limit background work: cache.addAll launches every large PNG at once.
    let next = 0;
    await Promise.all(Array.from({ length: 3 }, async () => {
      while (next < required.length) await cache.add(required[next++]);
    }));
    // A missing optional sound must not prevent installing the playable game.
    await Promise.all(optionalAudio.map(async url => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);
      try {
        const response = await fetch(url, { signal: controller.signal });
        if (response.ok) await cache.put(url, response);
      } catch {} finally { clearTimeout(timer); }
    }));
  }));
});
// Обновлённая версия активируется после закрытия старых вкладок игры.
// Не перезагружаем и не меняем сборку посреди забега.
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name.startsWith(PREFIX) && name !== CACHE) await caches.delete(name);
    }
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || !request.url.startsWith(self.registration.scope)) return;
  if (request.mode === 'navigate') {
    event.respondWith(caches.open(CACHE).then(cache => cache.match(new URL('index.html', self.registration.scope).href, { ignoreVary: true })));
  } else if (urls.includes(request.url)) {
    // Некоторые хостинги добавляют Vary: Origin. У модульного JS Origin
    // отличается от precache-запроса; файлы сборки всё равно одинаковы.
    event.respondWith(caches.open(CACHE).then(async cache => (await cache.match(request, { ignoreVary: true })) || fetch(request)));
  }
});
`);
console.log(`PWA: ${files.length} файлов для офлайн-режима, версия ${version}`);
