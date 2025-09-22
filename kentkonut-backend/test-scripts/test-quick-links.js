// Testing the front-end loading of quick links

// First, let's try to reproduce the issue in a minimal way
// We'll simulate fetching quick links from the API and displaying them

document.addEventListener('DOMContentLoaded', () => {
  // Render logging
  console.log('Front-end test script loaded');
  
  // Test the fetch function
  testFetchQuickLinks();
});

async function testFetchQuickLinks() {
  console.log('Starting test fetch...');
  
  try {
    // Add cache-busting parameter to avoid Next.js caching
    const cacheBuster = new Date().getTime();
    console.log('Sending API request to: /api/quick-links?t=' + cacheBuster);
    
    const response = await fetch(`/api/quick-links?t=${cacheBuster}`, {
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
    
    console.log('API response status:', response.status);
    console.log('API response ok:', response.ok);
    
    if (!response.ok) {
      throw new Error('Failed to load quick links');
    }
    
    const data = await response.json();
    console.log('API returned data:', data);
    console.log('Data type:', typeof data);
    console.log('Is array:', Array.isArray(data));
    console.log('Length:', data?.length);
    
    // Try rendering the data
    renderResults(data);
  } catch (err) {
    console.error('Test fetch error:', err);
    document.body.innerHTML += `<div style="color: red">Error: ${err.message}</div>`;
  }
}

function renderResults(links) {
  if (!Array.isArray(links)) {
    console.error('Links is not an array:', links);
    return;
  }
  
  // Create a simple HTML display
  const resultsDiv = document.createElement('div');
  resultsDiv.innerHTML = `
    <h3>Test Results</h3>
    <p>Found ${links.length} quick links</p>
    <ul>
      ${links.map(link => `<li>${link.title} - ${link.url}</li>`).join('')}
    </ul>
  `;
  
  // Add to document
  document.body.appendChild(resultsDiv);
}
