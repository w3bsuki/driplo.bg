// Form debug utility for troubleshooting form submission issues
export function debugFormSubmission(form: HTMLFormElement, formData: any) {
	console.group('🔍 Form Submission Debug')
	
	// 1. Check form structure
	console.log('📋 Form Element:', form)
	console.log('Form Action:', form.action)
	console.log('Form Method:', form.method)
	console.log('Form ID:', form.id)
	
	// 2. Check form data
	console.log('📝 Form Data:', formData)
	
	// 3. Check validation state
	const requiredFields = {
		// Step 1
		title: formData.title,
		description: formData.description,
		category_id: formData.category_id,
		// Step 2
		images: formData.images,
		// Step 3
		price: formData.price,
		condition: formData.condition,
		color: formData.color,
		// Step 4
		location_city: formData.location_city,
		shipping_type: formData.shipping_type
	}
	
	console.log('✅ Required Fields:', requiredFields)
	
	// Check for missing required fields
	const missingFields = Object.entries(requiredFields)
		.filter(([_, value]) => !value || (Array.isArray(value) && value.length === 0))
		.map(([key]) => key)
	
	if (missingFields.length > 0) {
		console.error('❌ Missing Required Fields:', missingFields)
	} else {
		console.log('✅ All required fields present')
	}
	
	// 4. Check form inputs
	const inputs = form.querySelectorAll('input, textarea, select')
	console.log('🔢 Form Inputs Count:', inputs.length)
	
	const inputData: Record<string, any> = {}
	inputs.forEach(input => {
		const el = input as HTMLInputElement
		inputData[el.name || el.id] = el.value
	})
	console.log('📊 Input Values:', inputData)
	
	// 5. Check hidden inputs
	const hiddenInputs = form.querySelectorAll('input[type="hidden"]')
	console.log('🙈 Hidden Inputs:', hiddenInputs.length)
	hiddenInputs.forEach(input => {
		const el = input as HTMLInputElement
		console.log(`Hidden: ${el.name} = ${el.value}`)
	})
	
	// 6. Check for event listeners
	const submitButton = form.querySelector('button[type="submit"]')
	if (submitButton) {
		console.log('🔘 Submit Button:', submitButton)
		console.log('Button Disabled:', (submitButton as HTMLButtonElement).disabled)
		console.log('Button Text:', submitButton.textContent)
	}
	
	// 7. Check FormData object
	try {
		const fd = new FormData(form)
		const fdEntries: Record<string, any> = {}
		fd.forEach((value, key) => {
			if (fdEntries[key]) {
				if (Array.isArray(fdEntries[key])) {
					fdEntries[key].push(value)
				} else {
					fdEntries[key] = [fdEntries[key], value]
				}
			} else {
				fdEntries[key] = value
			}
		})
		console.log('📦 FormData Entries:', fdEntries)
	} catch (error) {
		console.error('❌ FormData Error:', error)
	}
	
	console.groupEnd()
}

// Network request debugger
export function debugNetworkRequest(url: string, method: string, headers: Headers, body: any) {
	console.group('🌐 Network Request Debug')
	console.log('URL:', url)
	console.log('Method:', method)
	console.log('Headers:', Object.fromEntries(headers.entries()))
	console.log('Body:', body)
	console.groupEnd()
}

// Console error checker
export function checkConsoleErrors() {
	const originalError = console.error
	const errors: string[] = []
	
	console.error = function(...args) {
		errors.push(args.join(' '))
		originalError.apply(console, args)
	}
	
	return {
		getErrors: () => errors,
		restore: () => { console.error = originalError }
	}
}