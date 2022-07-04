# AvSearchBar - live search
configurable live search for results based on either an API call or div contents

## Quick Start
Include files
```html
<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>

<!-- av search files -->
<script src="dst/avSearch.min.js"></script>
<link rel="stylesheet" type="text/css" href="style.css" />
```

add search template where you want to display the search bar
```html
<div id="avSearchBar" class="av-search-bar">
    <span class="search-button"></span>
    <form class="search-box">
        <input class="search-input" value="Search" />
        <div class="search-results">
            <div class="loading">loading...</div>
            <div class="no-results">No Results</div>
            <div class="results"></div>
            <div class="result-template">
                <a class="result" href="$link">
                    <div class="name">$name</div>
                    <div class="email">$email</div>
                </a>
            </div>
        </div>
    </form>
</div>
```

activate the search bar 
```js
$(() => {
    let config = {
        instantSearch: {
            enabled: true,
        },
        request: {
            url: "exampleResponse.json",
            method: "GET",
        },
        resultMapper: data => ({
            name: data.name,
            email: data.email,
            link: data.link
        }),
        searchDataExtractor: $elem => ([
                $elem.find(".name").html()
        ])
    };

    // via jquery plugin
    let $search = $("#avSearchBar").avSearchBar(config);

    // or via constructor
    let search = new AvSearchBar($("#avSearchBar"), config);

    // add extra results from some other source (only useful for instantSearch.type = RESULTS)
    search.addResults(arrayOfResults, showNow);
});
```

## Configuration
| Key | Default Value | Description |
| --- | --- | --- |
| placehosderText | Search | Text shown in the serch box when empty |
| selector.button | .search-button | CSS selector for the search "Go" button |
| selector.box | .search-box | CSS selector for the div containing both the bar and results contianer |
| selector.input | .search-input | CSS selector for the search input field |
| selector.resultsContainer | .search-results | CSS selector for the div contianing search related gubbins results |
| selector.results | .results | CSS selector for  the div that actually contains results |
| selector.result | .result | CSS selector for an individual result |
| selector.template | .result-template | CSS selector for the div contianing the template used te build the results list |
| request.url | "" | The url to post a request to for api search calls | 
| request.method | post | The request method to use for making api calls |
| request.bodyTemplate | { search: "avSearchBoxTermHere" } | Template of how to send body data to the api, at least one field must contian the text "avSearchBokTermHere" that will be replaced with the given search term before making the request |
| instantSearch.enabled | false | TODO: |
| instantSearch.searchType | SearchType.API | The search type to perform API/RESULTS |
| instantSearch.minSearchLen | 2 | Minimum number of characters that must be typed before performing a search |
| instantSearch.keyTimeout | 500 | Timeout between keyup and performing the search |
| resultMapper | (data) => ({ ...data }) | function to map the api response to replacement object in the template |
| resultExtractor | (data) => ([ ...(data.searchResults ?? []) ]) | function to extract the results array from the api response |
| searchDataExtractor | ($elem) => ([ $elem.html ]) | function to extract searchable terms from dom when using RESULTS search type |
| onLoadComplete | null | callback function to run on load complete |

