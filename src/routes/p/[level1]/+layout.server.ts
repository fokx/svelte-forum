import type { PageServerLoad } from './';

export const load: PageServerLoad = async (event) => {
	const { level1, level2 } = event.params;

	return {
		params: {
			level1,
			level2: level2 ?? null
		}
	};
};