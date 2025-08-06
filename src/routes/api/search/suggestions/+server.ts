import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
	const query = url.searchParams.get('q')?.trim()
	
	if (!query || query.length < 2) {
		return json([])
	}

	try {
		// Get suggestions from titles and brands
		const [titleSuggestions, brandSuggestions] = await Promise.all([
			// Get matching titles
			supabase
				.from('listings')
				.select('title')
				.eq('is_sold', false)
				.eq('is_archived', false)
				.eq('is_draft', false)
				.ilike('title', `%${query}%`)
				.limit(5),
			
			// Get matching brands via join
			supabase
				.from('listings')
				.select('brands!brand_id(name)')
				.eq('is_sold', false)
				.eq('is_archived', false)
				.eq('is_draft', false)
				.not('brand_id', 'is', null)
				.limit(5)
		])

		const suggestions = []

		// Add title suggestions
		if (titleSuggestions.data) {
			titleSuggestions.data.forEach(item => {
				if (item.title && !suggestions.includes(item.title)) {
					suggestions.push(item.title)
				}
			})
		}

		// Add brand suggestions
		if (brandSuggestions.data) {
			const uniqueBrands = [...new Set(brandSuggestions.data.map(item => item.brands?.name).filter(Boolean))]
			uniqueBrands.forEach(brand => {
				if (brand && brand.toLowerCase().includes(query.toLowerCase()) && !suggestions.includes(brand)) {
					suggestions.push(brand)
				}
			})
		}

		// Add popular search terms (could be enhanced with analytics)
		const popularTerms = [
			'nike sneakers', 'vintage dress', 'designer bag', 'winter coat', 
			'summer dress', 'running shoes', 'denim jacket', 'gold jewelry'
		]
		
		popularTerms.forEach(term => {
			if (term.toLowerCase().includes(query.toLowerCase()) && !suggestions.includes(term)) {
				suggestions.push(term)
			}
		})

		return json(suggestions.slice(0, 8))
	} catch (error) {
		console.error('Search suggestions error:', error)
		return json([])
	}
}