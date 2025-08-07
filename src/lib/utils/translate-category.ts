import * as m from '$lib/paraglide/messages.js';

// Map database categories to translation keys
const categoryTranslations: Record<string, () => string> = {
	'Women': m.category_women,
	'Men': m.category_men,
	'Kids': m.category_kids,
	'Designer': m.category_designer,
	'Home': m.category_home,
	'Bags': m.category_bags,
	'Dresses': m.category_dresses,
	'Trainers': m.category_trainers,
	'Jackets': m.category_jackets,
	'Котка': m.category_bags, // Map Bulgarian category to correct translation
};

export function translateCategory(category: string): string {
	const translator = categoryTranslations[category];
	return translator ? translator() : category;
}