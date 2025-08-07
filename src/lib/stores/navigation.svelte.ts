import { browser } from '$app/environment';

interface NavigationState {
	isMobileMenuOpen: boolean;
	isCategoryDropdownOpen: boolean;
	isInHeroSection: boolean;
	shouldShowBottomNav: boolean;
}

class NavigationStore {
	isMobileMenuOpen = $state(false);
	isCategoryDropdownOpen = $state(false);
	isInHeroSection = $state(false);
	
	// Computed value for bottom nav visibility
	shouldShowBottomNav = $derived(
		!this.isInHeroSection && 
		!this.isCategoryDropdownOpen && 
		!this.isMobileMenuOpen
	);
	
	// Actions
	openMobileMenu() {
		this.isMobileMenuOpen = true;
		// Close other overlays
		this.isCategoryDropdownOpen = false;
		// Prevent body scroll when menu is open
		if (browser) {
			document.body.style.overflow = 'hidden';
		}
	}
	
	closeMobileMenu() {
		this.isMobileMenuOpen = false;
		// Restore body scroll
		if (browser) {
			document.body.style.overflow = '';
		}
	}
	
	toggleMobileMenu() {
		if (this.isMobileMenuOpen) {
			this.closeMobileMenu();
		} else {
			this.openMobileMenu();
		}
	}
	
	setCategoryDropdownOpen(isOpen: boolean) {
		this.isCategoryDropdownOpen = isOpen;
		// Close mobile menu if category dropdown opens
		if (isOpen) {
			this.closeMobileMenu();
		}
	}
	
	setInHeroSection(inHero: boolean) {
		this.isInHeroSection = inHero;
	}
	
	// Close all overlays
	closeAll() {
		this.closeMobileMenu();
		this.isCategoryDropdownOpen = false;
	}
}

// Export singleton instance
export const navigation = new NavigationStore();