(async () => {
    var [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    var windowId = tab.windowId;

    // Check for highlighted text on current window
    var [{ result: selection }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: function () {
            return window.getSelection().toString();
        }
    });

    // If none highlighted, open up search input box
    if (selection != "" && typeof selection != 'undefined') {
        chrome.tabs.create({ url: `https://www.youtube.com/results?search_query=${selection}`, windowId: windowId });
    } else {
        document.querySelector('#searchBtn').addEventListener('click', () => { searchBySearchQuery(windowId); });
        document.addEventListener('keypress', function (event) {
            if (event.key === 'Enter') {
                searchBySearchQuery(windowId);
            }
        });

        // Initialize autocomplete, to display search suggestions
        $("#searchQuery").autocomplete({
            open: function () {
                $('html').addClass('expanded');
            },
            close: function () {
                $('html').removeClass('expanded');
            },
            select: function () {
                searchBySearchQuery(windowId);
            }
        });

        document.addEventListener('input', function () {
            var searchTerm = document.querySelector('#searchQuery').value;

            var suggestionsPromise = fetchSuggestions(searchTerm);
            suggestionsPromise.then(suggestions => {
                $("#searchQuery").autocomplete({
                    source: suggestions
                });
            });
        });
    }
})();

const fetchSuggestions = (searchTerm) => {
    var suggestions = [];

    const res = fetch(`http://suggestqueries.google.com/complete/search?client=youtube&ds=yt&h1=en&q=${searchTerm}`)
        .then((res) => res.text())
        .then((resText) => {
            data = JSON.parse(resText.replace("window.google.ac.h(", "").slice(0, -1))[1];
            data.forEach(function (val) {
                suggestions.push(val[0]);
            });

            suggestions.length = 5;

            return suggestions;
        });

    return res;
};

const searchBySearchQuery = (windowId) => {
    var query = document.querySelector('#searchQuery').value;

    // Open "Watch later" playlist if search is empty
    if (query === '') {
        chrome.tabs.create({ url: "https://www.youtube.com/playlist?list=WL", windowId: windowId });
    } else {
        chrome.tabs.create({ url: `https://www.youtube.com/results?search_query=${query}`, windowId: windowId });
    }
};