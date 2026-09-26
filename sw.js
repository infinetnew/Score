self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        self.clients.claim()
    );
});

self.addEventListener('push', event => {
    const data = event.data
        ? event.data.json()
        : {};

    const title = data.title || 'Fanta 5';

const options = {
    body: data.body || '',
    icon: '/Score/assets/icon-192.png',
    badge: '/Score/assets/icon-192.png',
    data: {
        url: data.url || '/Score/'
    }
};

    event.waitUntil(
        self.registration.showNotification(
            title,
            options
        )
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();

    const url =
        event.notification.data?.url ||
        '/Score/';

    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then(clientList => {

            for (const client of clientList) {
                if ('focus' in client) {
                    client.navigate(url);
                    return client.focus();
                }
            }

            return clients.openWindow(url);
        })
    );
});
