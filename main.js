const { createDirectus, readItems, rest } = require('@directus/sdk');

// Initialize the Directus client with REST capabilities
const client = createDirectus('https://dev-sikafiber-admin.spheraeng-software.com').with(rest());

async function fetchGlobalCatalogue() {
    try {
        // Fetching all items from 'global_catalogue' collection
      const result = await client.request(
        readItems('global_catalogue',
          {
            fields: ['*', { tests: ['*'] }]
          }
        ));
        console.log(result);
    } catch (error) {
        // Error handling
        console.error('Error fetching global_catalogue:', error);
    }
}

// Execute the function to perform the fetch
fetchGlobalCatalogue();
