import * as m from '$lib/paraglide/messages.js';
import { getLocale } from '$lib/paraglide/runtime.js';
import type { Category } from '$lib/types';

// Popular brands
export const popularBrands = [
	{ name: 'Nike', emoji: '👟' },
	{ name: 'Adidas', emoji: '⚡' },
	{ name: 'Zara', emoji: '👗' },
	{ name: 'H&M', emoji: '🛍️' },
	{ name: 'Gucci', emoji: '💎' },
	{ name: 'Prada', emoji: '👜' },
	{ name: 'Versace', emoji: '✨' },
	{ name: 'Balenciaga', emoji: '🔥' },
	{ name: 'Louis Vuitton', emoji: '💼' },
	{ name: 'Chanel', emoji: '🌹' },
	{ name: 'Dior', emoji: '💐' },
	{ name: 'Burberry', emoji: '🧥' }
];

// Condition options with translations
export const conditionOptions = [
	{ value: 'new_with_tags', label: getLocale() === 'bg' ? 'Нови с етикети' : 'New with tags', emoji: '🏷️' },
	{ value: 'like_new', label: getLocale() === 'bg' ? 'Като нови' : 'Like new', emoji: '✨' },
	{ value: 'good', label: getLocale() === 'bg' ? 'Добро' : 'Good', emoji: '👍' },
	{ value: 'fair', label: getLocale() === 'bg' ? 'Задоволително' : 'Fair', emoji: '👌' },
	{ value: 'poor', label: getLocale() === 'bg' ? 'Лошо' : 'Poor', emoji: '🔧' }
];

// Category hierarchy with subcategories
export const getCategoryHierarchy = () => [
	{
		slug: '',
		name: m.category_all(),
		icon: '🔍',
		subcategories: []
	},
	{
		slug: 'women',
		name: m.category_women(),
		icon: '👩',
		subcategories: [
			{ name: m.subcategory_dresses(), slug: 'dresses', icon: '👗' },
			{ name: m.women_tops_blouses(), slug: 'tops', icon: '👚' },
			{ name: m.women_skirts(), slug: 'skirts', icon: '👗' },
			{ name: m.women_pants_jeans(), slug: 'pants', icon: '👖' },
			{ name: m.women_jackets_coats(), slug: 'jackets', icon: '🧥' },
			{ name: m.women_shoes(), slug: 'shoes', icon: '👠' },
			{ name: m.women_bags_accessories(), slug: 'bags', icon: '👜' },
			{ name: m.subcategory_jewelry(), slug: 'jewelry', icon: '💍' },
			{ name: m.women_lingerie(), slug: 'lingerie', icon: '👙' },
			{ name: m.women_activewear(), slug: 'activewear', icon: '🏃‍♀️' }
		]
	},
	{
		slug: 'men',
		name: m.category_men(),
		icon: '👨',
		subcategories: [
			{ name: m.men_tshirts(), slug: 'tshirts', icon: '👕' },
			{ name: m.men_shirts(), slug: 'shirts', icon: '👔' },
			{ name: m.men_pants_jeans(), slug: 'pants', icon: '👖' },
			{ name: m.men_jackets_coats(), slug: 'jackets', icon: '🧥' },
			{ name: m.men_hoodies_sweatshirts(), slug: 'hoodies', icon: '👕' },
			{ name: m.men_shoes(), slug: 'shoes', icon: '👞' },
			{ name: m.men_accessories(), slug: 'accessories', icon: '⌚' },
			{ name: m.men_suits_formal(), slug: 'suits', icon: '🤵' },
			{ name: m.men_activewear(), slug: 'activewear', icon: '🏃‍♂️' },
			{ name: m.men_underwear(), slug: 'underwear', icon: '🩲' }
		]
	},
	{
		slug: 'kids',
		name: m.category_kids(),
		icon: '👶',
		subcategories: [
			{ name: m.kids_baby(), slug: 'baby', icon: '👶' },
			{ name: m.kids_girls(), slug: 'girls', icon: '👧' },
			{ name: m.kids_boys(), slug: 'boys', icon: '👦' },
			{ name: m.kids_shoes(), slug: 'shoes', icon: '👟' },
			{ name: m.kids_school_uniforms(), slug: 'school', icon: '🎒' },
			{ name: m.kids_toys_games(), slug: 'toys', icon: '🧸' },
			{ name: m.kids_maternity(), slug: 'maternity', icon: '🤱' }
		]
	},
	{
		slug: 'designer',
		name: m.category_designer(),
		icon: '💎',
		subcategories: [
			{ name: m.designer_luxury_handbags(), slug: 'handbags', icon: '👜' },
			{ name: m.designer_shoes(), slug: 'shoes', icon: '👠' },
			{ name: m.designer_dresses(), slug: 'dresses', icon: '👗' },
			{ name: m.designer_luxury_watches(), slug: 'watches', icon: '⌚' },
			{ name: m.designer_fine_jewelry(), slug: 'jewelry', icon: '💍' },
			{ name: m.designer_sunglasses(), slug: 'sunglasses', icon: '🕶️' },
			{ name: m.designer_vintage_pieces(), slug: 'vintage', icon: '🕰️' }
		]
	},
	{
		slug: 'home',
		name: m.category_home(),
		icon: '🏠',
		subcategories: [
			{ name: m.home_furniture(), slug: 'furniture', icon: '🪑' },
			{ name: m.home_decor(), slug: 'decor', icon: '🖼️' },
			{ name: m.home_kitchen(), slug: 'kitchen', icon: '🍽️' },
			{ name: m.home_bedding(), slug: 'bedding', icon: '🛏️' },
			{ name: m.home_lighting(), slug: 'lighting', icon: '💡' }
		]
	}
];

// Popular collections (cross-category)
export const popularCollections = [
	{ slug: 'shoes', name: getLocale() === 'bg' ? 'Всички обувки' : 'All Shoes', icon: '👟' },
	{ slug: 'bags', name: getLocale() === 'bg' ? 'Всички чанти' : 'All Bags', icon: '👜' },
	{ slug: 'jewelry', name: getLocale() === 'bg' ? 'Бижута' : 'Jewelry', icon: '💍' },
	{ slug: 'vintage', name: getLocale() === 'bg' ? 'Винтидж' : 'Vintage', icon: '🕰️' },
	{ slug: 'sale', name: getLocale() === 'bg' ? 'Намаления' : 'On Sale', icon: '🔥' },
	{ slug: 'new', name: getLocale() === 'bg' ? 'Нови' : 'New In', icon: '✨' }
];