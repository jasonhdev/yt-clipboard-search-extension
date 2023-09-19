(async () => {
    var [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    var windowId = tab.windowId;

    var [{ result: selection }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: function () {
            return window.getSelection().toString();
        }
    });

    if (selection != "" && typeof selection != 'undefined') {
        chrome.tabs.create({ url: `https://www.youtube.com/results?search_query=${selection}`, windowId: windowId });
    } else {
        document.querySelector('#searchBtn').addEventListener('click', () => { searchBySearchQuery(windowId); });
        document.addEventListener('keypress', function (event) {
            if (event.key === 'Enter') {
                searchBySearchQuery(windowId);
            }
        });
    }
})();

const searchBySearchQuery = (windowId) => {
    var query = document.querySelector('#searchQuery').value;

    // Open "Watch later" playlist if search is empty
    if (query === '') {
        chrome.tabs.create({ url: "https://www.youtube.com/playlist?list=WL", windowId: windowId });
    } else {
        chrome.tabs.create({ url: `https://www.youtube.com/results?search_query=${query}`, windowId: windowId });
    }
};



