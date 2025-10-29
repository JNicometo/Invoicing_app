// Main application logic
console.log('InvoicePro Desktop is running!');

// Check if API is available
if (window.api) {
    console.log('API bridge is available');
} else {
    console.warn('API bridge is not available - check preload.js');
}

// Add any initialization logic here
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');

    // Future: Initialize application state, load data, etc.
});
