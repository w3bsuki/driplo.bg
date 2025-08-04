import { getContext, setContext } from 'svelte'

const FORM_KEY = Symbol('form')

export interface FormContext {
	errors: Record<string, string | string[]>
	constraints?: Record<string, any>
}

export function setFormContext(context: FormContext) {
	setContext(FORM_KEY, context)
}

export function getFormContext(): FormContext | undefined {
	return getContext<FormContext>(FORM_KEY)
}