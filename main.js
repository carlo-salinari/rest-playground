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

/**
 * Fetch available tests by country ID.
 * @param {string} countryId - The ID of the country to filter tests.
 */
async function fetchAvailableTestsByCountry(countryId) {
  try {
      const result = await client.request(
          readItems('availability_by_country', {
              fields: ['*', 'tests.*', 'product.*'],  // Assuming 'tests' is a related field you want to fetch
              filter: {
                  country_id: countryId  // Filter by country ID
              }
          })
      );
      console.log('Available Tests:', JSON.stringify(result, null, 2));
      return result;
  } catch (error) {
      console.error('Error fetching available tests:', error);
  }
}

async function fetchASTMByCountry(countryId) {
  try {
      const result = await client.request(readItems('availability_by_country'), {
          fields: [
              'product.*',
              'product.tests.*',
              'product.tests.astm_c1609_test.*'  // Ensuring to fetch all relevant test data
          ],
          filter: {
              country_id: countryId,
              availability: {_in: ["Available", "Available Upon Request"]},
              'product.tests.collection': 'astm_c1609_test'  // Adjust based on actual collection identifier
          }
      });

      // Process and log results
      const filteredResults = result.data.map(item => ({
          ...item,
          tests: item.product.tests.map(test => test.astm_c1609_test)
      }));

      console.log('ASTM C1609 Tests by Country:', JSON.stringify(filteredResults, null, 2));
      return filteredResults;
  } catch (error) {
      console.error('Error fetching ASTM C1609 tests by country:', error);
  }
}


/**
 * Fetches products that are "Available" or "Available Upon Request" in a specific country
 * and populates the 'tests' array with actual test data.
 * @param {string} countryId - The ID of the country to filter products.
 */
async function fetchProductsAndTestsByCountry(countryId) {
  try {
    const params = {
      fields: [
        'product.id', 'product.name',
        'product.tests.id', // ID of the test for debugging
        'product.tests.astm_c1609_test.*', // Assuming this is a correct relationship path
        'product.tests.en_14651_test.*' // Load EN 14651 tests if applicable
      ],
      filter: {
        country_id: countryId,
        availability: {_in: ["Available", "Available Upon Request"]}
      }
    };

    const result = await client.request(readItems('availability_by_country', params));

    if (result && result.data) {
      console.log('Products with Full Test Details:', JSON.stringify(result.data, null, 4));
      return result.data;
    } else {
      console.log('No data returned:', JSON.stringify(result, null, 4));
      return [];
    }
  } catch (error) {
    console.error('Error fetching products and tests:', JSON.stringify(error, null, 4));
    return [];
  }
}

async function testBasicFetch() {
  try {
      const params = {
          fields: ['product.id', 'product.name'],
      };
      const result = await client.request(readItems('availability_by_country', params));
      if (result) {
          console.log('Basic Fetch Results:', JSON.stringify(result.data, null, 2));
      } else {
          console.log('Fetch returned no data');
      }
  } catch (error) {
      console.error('Error during basic fetch:', error);
      // Additional debug information
      console.error('Status:', error.response?.status);
      console.error('Error Details:', error.response?.data);
  }
}

async function fetchProductsWithDetailedTests() {
  try {
      const params = {
          fields: [
              'product.id',
              'product.name',
              'product.material',
              // Assuming there's a direct relationship configured in Directus
              'product.tests.id',  // Adjust this field path based on actual relationship keys
              'product.tests.collection', // Fetches the test type or collection name
              'product.tests.item',  // Adjust if 'item' is actually the test details
              'product.tests.item.*', // Fetch all data of the test, adjust the path if needed
          ],
          filter: {
              'availability': {_neq: "Not Available"}
          }
      };

      const result = await client.items('availability_by_country').readMany({
        fields: ['*']
      });


      console.log('Products with Detailed Test Data:', JSON.stringify(result.data, null, 2));
      return result.data;
  } catch (error) {
      console.error('Error fetching products with tests:', error);
  }
}

async function fetchProductsWithTests(countryId) {
  try {
    const result = await client.request(
      readItems('availability_by_country', {
      filter: {
        availability: {
          _neq: 'Not Available'
        },
        country_id: countryId
      },
      fields: [
        'product.name',
        'product.tests.collection',
        'product.tests.item.*'
      ]
    }));
    console.log('Product Tests:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error fetching product tests:', error);
  }
}

fetchProductsWithTests('Italy');
//fetchProductsWithDetailedTests();
//testBasicFetch();
//testBasicFetch('Italy');
//fetchProductsAndTestsByCountry();

/*
// Fetch EN test items and log them
fetchEN().then(enItems => {
  console.log("EN Tests:", JSON.stringify(enItems, null, 2));
  });

  // Fetch ASTM test items and log them
fetchASTM().then(astmItems => {
  console.log("ASTM Tests:", JSON.stringify(astmItems, null, 2));
});
*/
//fetchAvailableTestsByCountry('United Kingdom');
//fetchASTMByCountry('United Kingdom');
//fetchASTMByCountry('Italy');
//fetchProductsAndTestsByCountry('Italy');