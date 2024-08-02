const { createDirectus, readItems, rest } = require('@directus/sdk');

// Initialize the Directus client with REST capabilities
const client = createDirectus('https://dev-sikafiber-admin.spheraeng-software.com').with(rest());

async function fetchGlobalCatalogue() {
    try {
        // Fetching all items from 'global_catalogue' collection
        const result = await client.request(
            readItems('global_catalogue', {
                fields: ['*', { tests: ['*'] }]
            })
        );
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        // Error handling
        console.error('Error fetching global_catalogue:', error);
    }
}

async function fetchTests() {
    try {
        // Fetching items from 'global_catalogue' where tests are not null
        const result = await client.request(
            readItems('global_catalogue', {
                fields: ['*', { tests: ['item.*', 'collection'] }],
                filter: {
                    tests: {
                        _nnull: true
                    }
                }
            })
        );
        return result;
    } catch (error) {
        // Error handling
        console.error('Error fetching tests:', error);
    }
}
// Function to fetch items with associated EN_14651_test items
async function fetchEN() {
  try {
      const items = await fetchTests();
      const enItems = items.map(item => ({
          ...item,
          tests: item.tests.filter(test => test.collection === 'EN_14651_test')
      })).filter(item => item.tests.length > 0);

      return enItems;
  } catch (error) {
      console.error('Error fetching EN tests:', error);
  }
}

// Function to fetch items with associated ASTM_C1609_test items
async function fetchASTM() {
  try {
      const items = await fetchTests();
      const astmItems = items.map(item => ({
          ...item,
          tests: item.tests.filter(test => test.collection === 'ASTM_C1609_test')
      })).filter(item => item.tests.length > 0);

      return astmItems;
  } catch (error) {
      console.error('Error fetching ASTM tests:', error);
  }
}

// Fetch EN test items and log them
fetchEN().then(enItems => {
  console.log("EN Tests:", JSON.stringify(enItems, null, 2));
});

// Fetch ASTM test items and log them
fetchASTM().then(astmItems => {
  console.log("ASTM Tests:", JSON.stringify(astmItems, null, 2));
});
