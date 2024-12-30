import type { PageServerLoad } from './';

export const load: PageServerLoad = async (event) => {
	const { level1 } = event.params;

	return {
		params: {
			level1,
		}
	};
};
