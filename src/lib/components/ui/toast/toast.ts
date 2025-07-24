import { writable } from 'svelte/store';

export interface ToastData {
	id: string;
	title?: string;
	description?: string;
	variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
	duration?: number;
}

function createToastStore() {
	const { subscribe, update } = writable<ToastData[]>([]);

	return {
		subscribe,
		show: (data: Omit<ToastData, 'id'>) => {
			const id = Math.random().toString(36).slice(2);
			const toast: ToastData = { id, duration: 5000, ...data };
			
			update(toasts => [...toasts, toast]);
			
			if (toast.duration && toast.duration > 0) {
				setTimeout(() => {
					update(toasts => toasts.filter(t => t.id !== id));
				}, toast.duration);
			}
			
			return id;
		},
		dismiss: (id: string) => {
			update(toasts => toasts.filter(t => t.id !== id));
		},
		dismissAll: () => {
			update(() => []);
		}
	};
}

export const toast = createToastStore();