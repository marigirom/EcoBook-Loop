import { precacheAndRoute } from 'workbox-precaching';

// Workbox injects asset list during build
precacheAndRoute(self.__WB_MANIFEST);
