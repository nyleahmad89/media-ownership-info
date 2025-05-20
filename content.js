console.log('content.js script loaded'); // Debugging

// Create the toggle button
const toggleButton = document.createElement('button');
toggleButton.textContent = 'Show Media Info';
toggleButton.style.position = 'fixed'; // Ensure the button is fixed to the viewport
toggleButton.style.top = '10px';
toggleButton.style.right = '10px';
toggleButton.style.zIndex = '10001'; // Ensure the button is above other elements
toggleButton.style.padding = '10px 20px';
toggleButton.style.backgroundColor = '#007bff'; // Modern blue color
toggleButton.style.color = '#fff';
toggleButton.style.border = 'none';
toggleButton.style.borderRadius = '5px';
toggleButton.style.cursor = 'pointer';
toggleButton.style.pointerEvents = 'auto'; // Ensure the button is interactive
toggleButton.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'; // Add a subtle shadow for visibility
toggleButton.style.fontSize = '14px';
toggleButton.style.fontWeight = 'bold';
toggleButton.style.transition = 'background-color 0.3s ease, transform 0.2s ease';
toggleButton.addEventListener('mouseenter', () => {
  toggleButton.style.backgroundColor = '#0056b3'; // Darker blue on hover
  toggleButton.style.transform = 'scale(1.05)'; // Slight zoom effect
});
toggleButton.addEventListener('mouseleave', () => {
  toggleButton.style.backgroundColor = '#007bff'; // Reset color
  toggleButton.style.transform = 'scale(1)'; // Reset zoom
});
document.body.appendChild(toggleButton);

// Debugging: Log when the button is created
console.log('Toggle button created:', toggleButton);

let sidebar; // Declare the sidebar variable
let sidebarVisible = false; // Track sidebar visibility

// Toggle sidebar visibility
toggleButton.addEventListener('click', () => {
  console.log('Button clicked'); // Debugging
  if (!sidebar) {
    console.log('Creating sidebar'); // Debugging
    // Create the sidebar dynamically
    sidebar = document.createElement('div');
    sidebar.style.position = 'fixed';
    sidebar.style.top = '0';
    sidebar.style.right = '-300px'; // Start off-screen
    sidebar.style.width = '300px';
    sidebar.style.height = '100%';
    sidebar.style.backgroundColor = '#2c2c2c'; // Darker gray for a modern look
    sidebar.style.color = '#f5f5f5'; // Lighter text
    sidebar.style.boxShadow = '-2px 0 10px rgba(0,0,0,0.3)';
    sidebar.style.zIndex = '10000';
    sidebar.style.padding = '15px';
    sidebar.style.transition = 'right 0.3s ease'; // Smooth transition
    sidebar.style.overflowY = 'auto'; // Allow scrolling if content overflows
    sidebar.style.fontFamily = 'Arial, sans-serif';
    sidebar.style.fontSize = '14px';
    sidebar.style.lineHeight = '1.6';
    sidebar.innerHTML = `
      <h3 style="margin-top: 0; color: #007bff; font-size: 18px; font-weight: bold;">Media Ownership Info</h3>
      <p style="margin-bottom: 10px;">Loading...</p>
    `;
    document.body.appendChild(sidebar);

    // Add a resizable handle
    const resizeHandle = document.createElement('div');
    resizeHandle.style.position = 'absolute';
    resizeHandle.style.left = '0';
    resizeHandle.style.top = '0';
    resizeHandle.style.width = '5px';
    resizeHandle.style.height = '100%';
    resizeHandle.style.cursor = 'ew-resize';
    resizeHandle.style.backgroundColor = '#444';
    resizeHandle.style.transition = 'background-color 0.3s ease';
    resizeHandle.addEventListener('mouseenter', () => {
      resizeHandle.style.backgroundColor = '#007bff'; // Highlight on hover
    });
    resizeHandle.addEventListener('mouseleave', () => {
      resizeHandle.style.backgroundColor = '#444'; // Reset on mouse leave
    });
    sidebar.appendChild(resizeHandle);

    // Make the sidebar resizable
    resizeHandle.addEventListener('mousedown', (e) => {
      console.log('Resizing started');
      e.preventDefault();
      document.addEventListener('mousemove', resizeSidebar);
      document.addEventListener('mouseup', stopResizing);
    });

    function resizeSidebar(e) {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 200 && newWidth < 600) { // Limit width between 200px and 600px
        sidebar.style.width = `${newWidth}px`;
        console.log('Sidebar resized to:', newWidth);
      }
    }

    function stopResizing() {
      document.removeEventListener('mousemove', resizeSidebar);
      document.removeEventListener('mouseup', stopResizing);
    }
  }

  // Toggle sidebar visibility
  sidebarVisible = !sidebarVisible;
  if (sidebarVisible) {
    console.log('Showing sidebar'); // Debugging
    sidebar.style.right = '0'; // Slide in
    sidebar.style.pointerEvents = 'auto'; // Enable interaction
    toggleButton.style.opacity = '0.8'; // Slightly fade the button
    toggleButton.textContent = 'Hide Media Info'; // Change button text
    const hostname = window.location.hostname.toLowerCase();
    fetchMediaInfo(hostname);
  } else {
    console.log('Hiding sidebar'); // Debugging
    sidebar.style.right = '-300px'; // Slide out
    sidebar.style.pointerEvents = 'none'; // Disable interaction
    toggleButton.style.opacity = '1'; // Restore button visibility
    toggleButton.textContent = 'Show Media Info'; // Reset button text
  }
  console.log('Sidebar toggled:', sidebarVisible ? 'Visible' : 'Hidden');
});

// Debugging: Log when the script starts
console.log('Content script loaded');

// Fetch and display media ownership info dynamically
async function fetchMediaInfo(hostname) {
  try {
    // Normalize hostname
    const normalizedHostname = hostname.startsWith('www.') ? hostname : `www.${hostname}`;
    console.log('Fetching media info for:', hostname);
    console.log('Normalized hostname:', normalizedHostname);

    // Fetch hardcoded data from Chrome storage
    const localData = await new Promise((resolve) => {
      chrome.storage.local.get('mediaOwners', (result) => {
        if (chrome.runtime.lastError) {
          console.error('Error accessing Chrome storage:', chrome.runtime.lastError);
          resolve({});
        } else {
          resolve(result.mediaOwners || {});
        }
      });
    });

    console.log('mediaOwners data:', localData);

    // Match against both normalized and raw hostname
    const info = localData[normalizedHostname] || localData[hostname];
    if (!info) {
      console.warn('No data found for hostname:', hostname);
      sidebar.innerHTML = `
        <h3 style="margin-top: 0; color: #f5f5f5;">Media Ownership Info</h3>
        <p><strong>Website:</strong> ${hostname}</p>
        <p><strong>Owner:</strong> Unknown</p>
        <p><strong>Bias:</strong> Unknown</p>
        <p>No information available for this website.</p>
      `;
      return;
    }

    // Construct the photo URL and handle missing images
    const photoUrl = chrome.runtime.getURL('data/photos/' + (info.photo || 'default.png'));
    sidebar.innerHTML = `
      <h3 style="margin-top: 0; color: #007bff; font-size: 18px; font-weight: bold;">Media Ownership Info</h3>
      <p style="margin: 5px 0;"><strong>Website:</strong> ${hostname}</p>
      <p style="margin: 5px 0;"><strong>Owner:</strong> ${info.owner || "Unknown"}</p>
      <p style="margin: 5px 0;"><strong>Bias:</strong> ${info.bias || "Unknown"}</p>
      <img src="${photoUrl}" 
           onerror="this.src='${chrome.runtime.getURL('data/photos/default.png')}'" 
           alt="${info.owner || "Unknown"}" 
           style="width: 100%; border-radius: 5px; margin-top: 10px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); object-fit: cover; border: 2px solid #007bff;">
      <p style="margin-top: 10px; font-size: 13px; line-height: 1.5; color: #ccc;">${info.blurb || "No additional information available."}</p>
    `;
  } catch (error) {
    console.error('Error fetching media info:', error);
    sidebar.innerHTML = `
      <h3 style="margin-top: 0; color: #f5f5f5;">Media Ownership Info</h3>
      <p>Error fetching data: ${error.message}</p>
    `;
  }
}
