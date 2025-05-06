(async () => {
    if (!chrome.tabs) return;

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || tab.url.startsWith("chrome") || tab.url.startsWith("https://chrome")) return;

    const windowId = tab.windowId;

    const [{ result: selection }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => window.getSelection().toString()
    });

    if (selection && selection.trim()) {
        chrome.tabs.create({
            url: `https://www.youtube.com/results?search_query=${encodeURIComponent(selection)}`,
            windowId
        });
        return;
    }

    const input = document.querySelector('#searchQuery');
    const button = document.querySelector('#searchBtn');

    if (button) {
        button.addEventListener('click', () => searchBySearchQuery(windowId));
    }

    document.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            searchBySearchQuery(windowId);
        }
    });

    // Initialize autocomplete UI
    $("#searchQuery").autocomplete({
        open: () => $('html').addClass('suggestions'),
        close: () => $('html').removeClass('suggestions'),
        select: () => searchBySearchQuery(windowId)
    });

    document.addEventListener('input', async () => {
        const term = input?.value.trim();
        if (!term) return;

        const suggestions = await fetchSuggestions(term);
        $("#searchQuery").autocomplete({ source: suggestions });
    });
})();

const fetchSuggestions = async (searchTerm) => {
    try {
        const res = await fetch(`http://suggestqueries.google.com/complete/search?client=youtube&ds=yt&h1=en&q=${encodeURIComponent(searchTerm)}`);
        const text = await res.text();
        const rawData = JSON.parse(text.replace("window.google.ac.h(", "").slice(0, -1))[1];

        const suggestions = rawData
            .filter(item => Array.isArray(item) && item[0])
            .map(item => item[0])
            .slice(0, 5);

        return suggestions;
    } catch (err) {
        console.error('Failed to fetch suggestions:', err);
        return [];
    }
};

const searchBySearchQuery = (windowId) => {
    const query = document.querySelector('#searchQuery')?.value.trim();

    const url = query
        ? `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
        : "https://www.youtube.com/playlist?list=WL";

    chrome.tabs.create({ url, windowId });
};