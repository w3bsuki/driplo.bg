<script lang="ts">
  interface Props {
    onVerify: (token: string) => void;
    onExpire?: () => void;
    onError?: () => void;
    onTimeout?: () => void;
    reset?: () => void;
  }
  
  let { 
    onVerify, 
    onExpire = () => {}, 
    onError = () => {}, 
    onTimeout = () => {},
    reset: resetProp 
  }: Props = $props();
  
  // Turnstile site key from environment
  const siteKey = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY || ''
  
  let turnstileContainer: HTMLDivElement
  let widgetId: string | null = null
  
  $effect(() => {
    if (!siteKey) {
      // In development, auto-verify with a test token
      if (import.meta.env.MODE === 'development') {
        onVerify('development-test-token')
      }
      return
    }
    
    // Load Turnstile script
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad'
    script.async = true
    script.defer = true
    
    // Define callback for when Turnstile loads
    window.onTurnstileLoad = () => {
      if (window.turnstile && turnstileContainer) {
        try {
          widgetId = window.turnstile.render(turnstileContainer, {
            sitekey: siteKey,
            callback: (token: string) => {
              onVerify(token)
            },
            'expired-callback': () => {
              onExpire()
            },
            'error-callback': () => {
              onError()
            },
            'timeout-callback': () => {
              onTimeout()
            },
            theme: 'light', // 'light' or 'dark' or 'auto'
            size: 'normal', // 'normal' or 'compact'
            appearance: 'always', // 'always' or 'execute' or 'interaction-only'
            'response-field': false,
            'response-field-name': 'cf-turnstile-response'
          })
        } catch (error) {
          onError()
        }
      }
    }
    
    document.head.appendChild(script)
    
    return () => {
      // Clean up
      if (window.turnstile && widgetId !== null) {
        try {
          window.turnstile.remove(widgetId)
        } catch (error) {
          // Widget might already be destroyed
        }
      }
      
      // Remove the global callback
      if (window.onTurnstileLoad) {
        delete window.onTurnstileLoad
      }
    }
  })
  
  // Reset method for parent component to use via callback prop
  function reset() {
    if (typeof window !== 'undefined' && window.turnstile && widgetId !== null) {
      window.turnstile.reset(widgetId)
    }
  }
  
  // Call parent's reset prop if provided
  $effect(() => {
    if (resetProp) {
      resetProp = reset;
    }
  });
</script>

{#if siteKey}
  <div bind:this={turnstileContainer} class="cf-turnstile"></div>
{:else if import.meta.env.MODE === 'development'}
  <div class="text-xs text-gray-500 text-center p-2 border border-gray-200 rounded bg-gray-50">
    Turnstile CAPTCHA disabled in development mode
  </div>
{/if}

<style>
  /* Ensure Turnstile is centered on mobile */
  @media (max-width: 480px) {
    :global(.cf-turnstile) {
      transform: scale(0.9);
      transform-origin: center;
    }
  }
</style>