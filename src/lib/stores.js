import { writable } from 'svelte/store';

// localStorage.getItem('THREADED_VIEW') === 'true'
export const isThreadedView = writable(true);
export const siteTitle = writable('');

