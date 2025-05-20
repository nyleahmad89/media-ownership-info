chrome.action.onClicked.addListener((tab) => {
  console.log('Injecting content.js into tab:', tab.id); // Debugging
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["content.js"]
  }).then(() => {
    console.log('content.js successfully injected into tab:', tab.id); // Debugging
  }).catch((error) => {
    console.error('Error injecting content.js:', error); // Debugging
  });
});

chrome.runtime.onInstalled.addListener(() => {
  // Load hardcoded data from local media_owners.json
  fetch(chrome.runtime.getURL('data/media_owners.json'))
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch local media_owners.json with status ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Local media_owners.json loaded successfully:', data);
      chrome.storage.local.set({ mediaOwners: data }, () => {
        if (chrome.runtime.lastError) {
          console.error('Error setting mediaOwners in Chrome storage:', chrome.runtime.lastError);
        } else {
          console.log('mediaOwners successfully set in Chrome storage.');
        }
      });
    })
    .catch(error => {
      console.error('Failed to fetch local media_owners.json:', error);
      chrome.storage.local.set({ mediaOwners: {} }, () => {
        console.warn('Set empty mediaOwners in Chrome storage as fallback.');
      });
    });
});
