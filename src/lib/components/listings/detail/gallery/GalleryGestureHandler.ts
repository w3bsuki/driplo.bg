import { getContext, setContext } from 'svelte';

export interface GalleryGestureState {
	// Touch and gesture state
	touchStartX: number;
	touchStartY: number;
	touchEndX: number;
	touchEndY: number;
	isTouching: boolean;
	isTransitioning: boolean;
	
	// Zoom state for fullscreen mode
	scale: number;
	translateX: number;
	translateY: number;
	lastPinchDistance: number;
	isZooming: boolean;
}

export interface GalleryGestureHandlers {
	// Navigation
	nextImage: () => void;
	prevImage: () => void;
	
	// Touch handlers for main gallery
	handleTouchStart: (e: TouchEvent) => void;
	handleTouchMove: (e: TouchEvent) => void;
	handleTouchEnd: (e: TouchEvent) => void;
	
	// Touch handlers for fullscreen mode
	handleFullscreenTouchStart: (e: TouchEvent) => void;
	handleFullscreenTouchMove: (e: TouchEvent) => void;
	handleFullscreenTouchEnd: (e: TouchEvent) => void;
	
	// Zoom controls
	resetZoom: () => void;
	
	// Utilities
	getDistance: (touches: TouchList) => number;
}

const GALLERY_GESTURE_KEY = Symbol('galleryGesture');

export function createGalleryGestureHandler(
	images: string[],
	currentImageIndex: { value: number; set: (value: number) => void },
	preloadAdjacentImages: () => void,
	gestureState: GalleryGestureState
): GalleryGestureHandlers {
	
	const MIN_SWIPE_DISTANCE = 50;
	const TRANSITION_DURATION = 300;
	
	function nextImage() {
		if (gestureState.isTransitioning || images.length <= 1) return;
		gestureState.isTransitioning = true;
		currentImageIndex.set((currentImageIndex.value + 1) % images.length);
		preloadAdjacentImages();
		setTimeout(() => gestureState.isTransitioning = false, TRANSITION_DURATION);
	}

	function prevImage() {
		if (gestureState.isTransitioning || images.length <= 1) return;
		gestureState.isTransitioning = true;
		currentImageIndex.set((currentImageIndex.value - 1 + images.length) % images.length);
		preloadAdjacentImages();
		setTimeout(() => gestureState.isTransitioning = false, TRANSITION_DURATION);
	}
	
	function resetZoom() {
		gestureState.scale = 1;
		gestureState.translateX = 0;
		gestureState.translateY = 0;
		gestureState.lastPinchDistance = 0;
		gestureState.isZooming = false;
	}

	function getDistance(touches: TouchList): number {
		const touch1 = touches[0];
		const touch2 = touches[1];
		if (!touch1 || !touch2) return 0;
		return Math.sqrt(
			Math.pow(touch2.clientX - touch1.clientX, 2) + 
			Math.pow(touch2.clientY - touch1.clientY, 2)
		);
	}
	
	// Touch event handlers for swipe gestures
	function handleTouchStart(e: TouchEvent) {
		if (images.length <= 1) return;
		
		const touch = e.touches[0];
		if (!touch) return;
		gestureState.touchStartX = touch.clientX;
		gestureState.touchStartY = touch.clientY;
		gestureState.isTouching = true;
	}
	
	function handleTouchMove(e: TouchEvent) {
		if (!gestureState.isTouching) return;
		
		const touch = e.touches[0];
		if (!touch) return;
		gestureState.touchEndX = touch.clientX;
		gestureState.touchEndY = touch.clientY;
		
		// Prevent scrolling if it's a horizontal swipe
		const deltaX = Math.abs(gestureState.touchEndX - gestureState.touchStartX);
		const deltaY = Math.abs(gestureState.touchEndY - gestureState.touchStartY);
		
		if (deltaX > deltaY && deltaX > 10) {
			e.preventDefault();
		}
	}
	
	function handleTouchEnd(e: TouchEvent) {
		if (!gestureState.isTouching) return;
		
		const deltaX = gestureState.touchEndX - gestureState.touchStartX;
		const deltaY = gestureState.touchEndY - gestureState.touchStartY;
		const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
		
		// Check if it's a horizontal swipe
		if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > MIN_SWIPE_DISTANCE) {
			if (deltaX > 0) {
				prevImage(); // Swipe right = previous image
			} else {
				nextImage(); // Swipe left = next image
			}
		}
		
		gestureState.isTouching = false;
		gestureState.touchStartX = 0;
		gestureState.touchStartY = 0;
		gestureState.touchEndX = 0;
		gestureState.touchEndY = 0;
	}
	
	// Fullscreen touch handlers with zoom support
	function handleFullscreenTouchStart(e: TouchEvent) {
		if (e.touches.length === 2) {
			// Pinch gesture
			gestureState.lastPinchDistance = getDistance(e.touches);
			gestureState.isZooming = true;
			e.preventDefault();
		} else if (e.touches.length === 1 && !gestureState.isZooming) {
			// Single touch for pan or swipe
			handleTouchStart(e);
		}
	}
	
	function handleFullscreenTouchMove(e: TouchEvent) {
		if (e.touches.length === 2 && gestureState.isZooming) {
			// Pinch zoom
			const currentDistance = getDistance(e.touches);
			const scaleChange = currentDistance / gestureState.lastPinchDistance;
			const newScale = Math.min(Math.max(gestureState.scale * scaleChange, 0.5), 3);
			
			gestureState.scale = newScale;
			gestureState.lastPinchDistance = currentDistance;
			e.preventDefault();
		} else if (e.touches.length === 1 && !gestureState.isZooming) {
			if (gestureState.scale > 1) {
				// Pan when zoomed
				const touch = e.touches[0];
				if (!touch) return;
				const deltaX = touch.clientX - gestureState.touchStartX;
				const deltaY = touch.clientY - gestureState.touchStartY;
				
				gestureState.translateX += deltaX * 0.5;
				gestureState.translateY += deltaY * 0.5;
				
				gestureState.touchStartX = touch.clientX;
				gestureState.touchStartY = touch.clientY;
				e.preventDefault();
			} else {
				// Regular swipe handling
				handleTouchMove(e);
			}
		}
	}
	
	function handleFullscreenTouchEnd(e: TouchEvent) {
		if (gestureState.isZooming && e.touches.length < 2) {
			gestureState.isZooming = false;
			gestureState.lastPinchDistance = 0;
		} else if (!gestureState.isZooming && gestureState.scale <= 1) {
			handleTouchEnd(e);
		}
	}
	
	const handlers: GalleryGestureHandlers = {
		nextImage,
		prevImage,
		handleTouchStart,
		handleTouchMove,
		handleTouchEnd,
		handleFullscreenTouchStart,
		handleFullscreenTouchMove,
		handleFullscreenTouchEnd,
		resetZoom,
		getDistance
	};

	setContext(GALLERY_GESTURE_KEY, handlers);
	return handlers;
}

export function getGalleryGestureHandler(): GalleryGestureHandlers {
	const handlers = getContext<GalleryGestureHandlers>(GALLERY_GESTURE_KEY);
	if (!handlers) {
		throw new Error('GalleryGestureHandler context not found. Make sure to call createGalleryGestureHandler in a parent component.');
	}
	return handlers;
}