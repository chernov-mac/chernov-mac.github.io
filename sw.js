self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open('v1').then(function (cache) {
            return cache.addAll([
                'index.html',
                'style.css',
                'style.css.map',
                'bundle.js',
                'bundle.js.map'
            ]);
        })
    );
});

self.addEventListener('install', function (event) {
    var indexPage = new Request('index.html');
    event.waitUntil(
        fetch(indexPage).then(function (response) {
            return caches.open('pwabuilder-offline').then(function (cache) {
                console.log(response.url);
                return cache.put(indexPage, response);
            });
        }));
});

self.addEventListener('fetch', function (event) {
    var updateCache = function (request) {
        return caches.open('pwabuilder-offline').then(function (cache) {
            return fetch(request).then(function (response) {
                console.log(response.url)
                return cache.put(request, response);
            });
        });
    };

    event.waitUntil(updateCache(event.request));

    event.respondWith(
        fetch(event.request).catch(function (error) {
            console.log(error);

            return caches.open('pwabuilder-offline').then(function (cache) {
                return cache.match(event.request).then(function (matching) {
                    var report = !matching || matching.status == 404 ? Promise.reject('no-match') : matching;
                    return report
                });
            });
        })
    );
})