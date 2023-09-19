(async () => {
    var [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    var [{ result: selection }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: function () {
            return window.getSelection().toString();
        }
    });

    if (selection != "" && typeof (selection) != 'undefined') {
        window.open("https://www.youtube.com/results?search_query=" + selection);
    } else {
        document.querySelector('#searchBtn').addEventListener('click', searchBySearchQuery);
        document.addEventListener('keypress', function (event) {
            if (event.key === 'Enter') {
                searchBySearchQuery();
            }
        });
    }
})();

const searchBySearchQuery = () => {
    var query = document.querySelector('#searchQuery').value;

    // Open "Watch later" playlist if search is empty
    if (query == '') {
        window.open("https://www.youtube.com/playlist?list=WL");
    } else {
        window.open("https://www.youtube.com/results?search_query=${query}");
    }
};



