import type { Actions } from './$types'
import { json } from '@sveltejs/kit'

export const actions: Actions = {
	testSubmit: async ({ request }) => {
		console.log('Test form action triggered')
		
		const formData = await request.formData()
		const testField = formData.get('testField')
		
		console.log('Form data received:', { testField })
		
		return {
			success: true,
			data: {
				message: 'Form submitted successfully!',
				receivedData: {
					testField
				},
				timestamp: new Date().toISOString()
			}
		}
	}
}