import { getContext, setContext } from 'svelte';

export interface ImageLoaderState {
	imageLoading: Set<number>;
	imageLoadError: Set<number>;
}

export interface ImageLoaderHandlers {
	handleImageLoad: (index: number) => void;
	handleImageError: (index: number) => void;
	startImageLoad: (index: number) => void;
	preloadAdjacentImages: (currentIndex: number, images: string[]) => void;
}

const IMAGE_LOADER_KEY = Symbol('imageLoader');

export function createImageLoader(state: ImageLoaderState): ImageLoaderHandlers {
	
	function handleImageLoad(index: number) {
		const newLoading = new Set([...state.imageLoading]);
		newLoading.delete(index);
		state.imageLoading = newLoading;
	}
	
	function handleImageError(index: number) {
		const newLoading = new Set([...state.imageLoading]);
		newLoading.delete(index);
		state.imageLoading = newLoading;
		
		const newError = new Set([...state.imageLoadError]);
		newError.add(index);
		state.imageLoadError = newError;
	}
	
	function startImageLoad(index: number) {
		if (!state.imageLoading.has(index) && !state.imageLoadError.has(index)) {
			const newLoading = new Set([...state.imageLoading]);
			newLoading.add(index);
			state.imageLoading = newLoading;
		}
	}

	function preloadAdjacentImages(currentIndex: number, images: string[]) {
		if (!images.length) return;
		
		const nextIndex = (currentIndex + 1) % images.length;
		const prevIndex = (currentIndex - 1 + images.length) % images.length;
		
		[nextIndex, prevIndex].forEach(index => {
			if (images[index] && !state.imageLoading.has(index) && !state.imageLoadError.has(index)) {
				const img = new Image();
				img.onload = () => {
					handleImageLoad(index);
				};
				img.onerror = () => {
					handleImageError(index);
				};
				startImageLoad(index);
				img.src = images[index];
			}
		});
	}
	
	const handlers: ImageLoaderHandlers = {
		handleImageLoad,
		handleImageError,
		startImageLoad,
		preloadAdjacentImages
	};

	setContext(IMAGE_LOADER_KEY, handlers);
	return handlers;
}

export function getImageLoader(): ImageLoaderHandlers {
	const handlers = getContext<ImageLoaderHandlers>(IMAGE_LOADER_KEY);
	if (!handlers) {
		throw new Error('ImageLoader context not found. Make sure to call createImageLoader in a parent component.');
	}
	return handlers;
}