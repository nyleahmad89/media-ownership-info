document.getElementById('show-info').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    console.log('Injecting content.js into tab:', tabs[0].id); // Debugging
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      files: ["content.js"]
    }).then(() => {
      console.log('content.js successfully injected into tab:', tabs[0].id); // Debugging
    }).catch((error) => {
      console.error('Error injecting content.js:', error); // Debugging
    });
  });
});

document.getElementById('update-data').addEventListener('click', () => {
  const remoteDataUrl = 'https://your-hosted-url.com/media_owners.json'; // Replace with your hosted JSON URL
  fetch(remoteDataUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch remote media_owners.json with status ${response.status}`);
      }
      if (!response.headers.get('Content-Type')?.includes('application/json')) {
        throw new Error('Remote media_owners.json is not valid JSON.');
      }
      return response.json();
    })
    .then(data => {
      chrome.storage.local.set({ mediaOwners: data }, () => {
        console.log('Media owners data updated via popup from remote source.');
        alert('Media owners data updated successfully!');
      });
    })
    .catch(error => {
      console.error('Failed to fetch remote media_owners.json:', error);
      // Fallback to local media_owners.json
      fetch(chrome.runtime.getURL('data/media_owners.json'))
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to fetch local media_owners.json with status ${response.status}`);
          }
          if (!response.headers.get('Content-Type')?.includes('application/json')) {
            throw new Error('Local media_owners.json is not valid JSON.');
          }
          return response.json();
        })
        .then(data => {
          chrome.storage.local.set({ mediaOwners: data }, () => {
            console.log('Media owners data updated via popup from local file.');
            alert('Media owners data updated successfully from local file!');
          });
        })
        .catch(localError => {
          console.error('Failed to fetch local media_owners.json:', localError);
          alert('Failed to update media owners data from both remote and local sources.');
        });
    });
});
