const cacheName = "clock";
const contentToCache = [
	"/",
	"/index.html", 
	"/style.css",

	"/sw.js", 
	"/worker.js",

	"/scripts/main.js",
	"/scripts/statistics.js",
	"/scripts/timer.js",
	"/scripts/view.js",

	"/scripts/profile_settings/audio.js",
	"/scripts/profile_settings/notifications.js",
	"/scripts/profile_settings/theming.js",
	"/scripts/profile_settings/timer_duration.js",

	"/meta/icon192.png",
	"/meta/icon512.png",
	"/meta/maskable192.png",
	"/meta/maskable512.png",
	"/meta/favicon.png",
	"/meta/appletouch.png",
	"/meta/GitHub-Mark-64px.png"
];


self.addEventListener("install", (e) => {
	console.log("Service Worker installed");
	e.waitUntil(
		(async () => {
			const cache = await caches.open(cacheName);
			await cache.addAll(contentToCache).catch(err => console.log(err));
		})()
	);
});

self.addEventListener("fetch", function (event) {
	event.respondWith(fetch(event.request).then((res) => {
		let response = res.clone();
        caches.open(cacheName).then((cache) => {
          cache.put(event.request, response);
        });
		return res
	}).catch((err) => {
		return caches.match(event.request)
	})
	);
});
