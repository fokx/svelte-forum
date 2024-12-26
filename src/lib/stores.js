import { writable } from 'svelte/store';

// localStorage.getItem('FLAT_VIEW') === 'true'
export const siteTitle = writable('');

