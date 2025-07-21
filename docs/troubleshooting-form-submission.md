# Troubleshooting Form Submission Issues

## Debug Steps for Publish Button Not Working

### 1. Console Debugging

Open your browser's Developer Tools (F12) and check the Console tab when clicking the publish button. You should see:

```
🔘 Publish button clicked
Submitting: false
Step4 Valid: true/false
Form validation: { success: true/false, ... }
```

If `Step4 Valid` is false, check which fields are missing.

### 2. Common Issues and Solutions

#### Issue: Button is disabled
- **Check**: Is the button greyed out?
- **Debug**: Check console for `Step4 Valid: false`
- **Solution**: Ensure all required fields are filled:
  - `location_city` (minimum 2 characters)
  - `shipping_type` (should default to 'standard')

#### Issue: Form doesn't submit even when button is enabled
- **Check**: Look for `🚀 Form submission triggered` in console
- **Debug**: Check Network tab for POST request to `/sell?/createListing`
- **Possible causes**:
  - JavaScript error preventing submission
  - Form enhance not working properly
  - CSP blocking form submission

#### Issue: Network request fails
- **Check**: Network tab shows red request
- **Debug**: Check response details
- **Common errors**:
  - 401: User not authenticated
  - 400: Form validation failed server-side
  - 500: Database error

### 3. Manual Testing

To test if the form structure is correct, run this in the console:

```javascript
// Get the form element
const form = document.querySelector('form[action*="createListing"]');
console.log('Form found:', form);

// Check form data
const formData = new FormData(form);
for (let [key, value] of formData.entries()) {
  console.log(key, ':', value);
}

// Test manual submission
// form.submit(); // Uncomment to force submit
```

### 4. Required Fields Checklist

Ensure these fields have values:

**Step 1 (Basic Info)**:
- [ ] title (3-100 characters)
- [ ] description (10-2000 characters)
- [ ] category_id (valid UUID)

**Step 2 (Images)**:
- [ ] images array (at least 1 image URL)

**Step 3 (Pricing)**:
- [ ] price (positive number)
- [ ] condition ('new', 'like_new', 'good', or 'fair')
- [ ] color (at least 1 character)

**Step 4 (Shipping)**:
- [ ] location_city (2-100 characters)
- [ ] shipping_type ('standard', 'express', or 'pickup')

### 5. Browser-Specific Issues

#### Content Security Policy (CSP)
Check for CSP errors in console:
```
Refused to send form data to '...' because it violates the following Content Security Policy directive
```

#### Form Action Issues
Ensure the form action URL is correct:
- Should be relative: `?/createListing`
- Full URL should be: `http://localhost:5173/sell?/createListing`

### 6. Debug Data Persistence

Check if form data is being saved:

```javascript
// Check localStorage for saved form data
const savedData = localStorage.getItem('form_create_listing');
console.log('Saved form data:', JSON.parse(savedData));
```

### 7. Step-by-Step Debug Process

1. **Clear all data and start fresh**:
   ```javascript
   localStorage.removeItem('form_create_listing');
   location.reload();
   ```

2. **Fill form step by step**, checking validation at each step:
   ```javascript
   // After each step, run:
   const form = document.querySelector('form');
   const formData = new FormData(form);
   console.log('Current form data:', Object.fromEntries(formData));
   ```

3. **On final step**, before clicking publish:
   ```javascript
   // Check all required fields
   const required = ['title', 'description', 'category_id', 'images', 'price', 'condition', 'color', 'location_city', 'shipping_type'];
   const form = document.querySelector('form');
   const formData = new FormData(form);
   required.forEach(field => {
     console.log(`${field}:`, formData.get(field));
   });
   ```

### 8. Network Debugging

1. Open Network tab in DevTools
2. Click the publish button
3. Look for request to `/sell?/createListing`
4. Check:
   - Request method: should be POST
   - Request headers: should include form data
   - Response status: 303 = success, 400/500 = error

### 9. Additional Debug Logging

The form now includes extensive debug logging. When you click publish, check for:

1. `🔘 Publish button clicked` - Button event fired
2. `🚀 Form submission triggered` - Form is submitting
3. `🔍 Form Submission Debug` - Detailed form analysis
4. `📦 Form result:` - Server response

### 10. Quick Fix Attempts

If nothing else works, try:

1. **Hard refresh**: Ctrl+F5
2. **Clear cache**: DevTools > Application > Clear Storage
3. **Try incognito mode**: Rules out extensions
4. **Check for ad blockers**: May block form submissions
5. **Try different browser**: Rules out browser-specific issues