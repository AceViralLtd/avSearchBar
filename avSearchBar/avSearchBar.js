/**
 * TODO: Write header
 *
 * @author Timothy Wilson 2018 <https://github.com/Altrozeo>
 *
 * Thanks to; http://stefangabos.ro/jquery/jquery-plugin-boilerplate-oop/
 */

(function ($) {

    $.fn.avSearchBar = function (options) {
        function AvSearchBar(el, options) {
            /**
             * Default settings, can be overridden on creation
             *
             * @type {{instantSearchPullSearchResults: (function(*): Array), instantSearchKeyTimeoutLength: number, instantSearchUrl: string, boxClass: string, instantSearchMethod: string, instantSearchResultTemplate: string, instantSearchResults: string, instantSearchMapResultToTemplate: (function(*): {sub: (*|((typedArray: (Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array), index: number, value: number) => number)|(() => string)), link: (*|((url: string) => string)|string), term: *}), buttonClass: string, inputClass: string, instantSearchKeysIgnore: number, defaultSearchText: string, instantSearch: boolean, instantSearchBody: {search: string}, instantSearchResultClass: string}}
             */
            let defaults = {
                defaultSearchText: 'search here', // Default text to appear in the search box when nothing else to display
                buttonClass: 'search-button', // Default class of the search button (used for toggling search
                boxClass: 'search-box', // The class of the search form
                inputClass: 'search-input', // The class of the input field, used to fetch the term in instantSearch

                instantSearch: false, // Should we use instant search?
                instantSearchKeysIgnore: 2, // After how many keys should we try to instant search?
                instantSearchKeyTimeoutLength: 500, // How long after a key stroke should we try to instant search? in MS
                instantSearchUrl: '', // URL to throw instant search request at
                instantSearchMethod: 'post', // Method of submitting the data
                instantSearchBody: { search: 'avSearchBoxTermHere' }, // The post data you want to send. alSearchBoxTermHere will be replaced with the search term
                instantSearchResultClass: 'search-results', // The class to hold loading, results and messages returned from search
                instantSearchResults: 'results', // The class to put a search result in
                instantSearchResultTemplate: 'result-template', // The default template to use
                // Replace this if your API doesn't return the results within the SearchResults key
                instantSearchPullSearchResults: function (data) {
                    let results = [];

                    if (data.searchResults) {
                        $.each(data.searchResults, function (key, val) {
                            results.push(val);
                        });
                    }

                    return results;
                },
                // Use this to map the results to the template
                instantSearchMapResultToTemplate: function (data) {
                    return {
                        'term': data.term,
                        'sub': data.sub,
                        'link': data.link
                    };
                }
            };
            /**
             *  Holder for the setTimeout hook
             * @type {null}
             */
            let instantSearchKeyTimeout = null;

            let plugin = this;

            plugin.settings = {};

            /**
             * Setup function
             */
            let init = function () {
                plugin.settings = $.extend({}, defaults, options);
                plugin.el = el;

                tryFindErrors();
                setUpListeners();
                resetSearchBar();
            };

            /**
             * Try and spot errors with the settings
             */
            let tryFindErrors = function () {
                // Check that instant search looks like it's configured correctly
                if (
                    plugin.settings.instantSearch
                    && !plugin.settings.instantSearchUrl
                ) {
                    console.log('avSearchBox: Instant search enabled BUT no URL given!');
                }
            };

            /**
             * Setup various listeners
             * Including for instantSearch
             */
            let setUpListeners = function () {
                // Search button show and hide input
                $(`${plugin.el.selector} .${plugin.settings.buttonClass}`).click(function () {
                    $(`${plugin.el.selector} .${plugin.settings.boxClass}`).toggle();

                    if ($(`.${plugin.settings.inputClass}`).is(":visible")) {
                        $(`.${plugin.settings.inputClass}`).focus();
                    }
                });

                $(`${plugin.el.selector} .${plugin.settings.inputClass}`).focus(function () {
                    if ($(this).val() === plugin.settings.defaultSearchText) {
                        $(this).val('');
                    }
                }).blur(function () {
                    if ($(this).val() === '') {
                        $(this).val(plugin.settings.defaultSearchText);
                    }
                }).keyup(function () {
                    if (plugin.settings.instantSearch) {
                        if (instantSearchKeyTimeout != null) {
                            clearTimeout(instantSearchKeyTimeout);
                        }

                        instantSearchKeyTimeout = setTimeout(
                            function (event) {
                                runInstantSearch($(plugin.el.selector + ' .' + plugin.settings.inputClass).val());
                            },
                            plugin.settings.instantSearchKeyTimeoutLength
                        );
                    }
                });
            };

            /**
             * Run an instant search based on a term
             * @param term
             */
            let runInstantSearch = function (term) {
                // Is the term long enough to search?
                if (term.length <= plugin.settings.instantSearchKeysIgnore) {
                    $(`${plugin.el.selector} .${plugin.settings.instantSearchResultClass}`).hide();
                    return;
                }

                // Build request body based on parameters
                let requestParams = plugin.settings.instantSearchBody;
                $.each(requestParams, function (index, value) {
                    if (value.toString() == 'avSearchBoxTermHere') {
                        requestParams[index] = term;
                    }
                });

                let qs = "?";
                let postBody;
                if ("GET" === plugin.settings.instantSearchMethod || "get" === plugin.settings.instantSearchMethod) {
                    qs += $.param(requestParams);
                } else {
                    postBody = new FormData;
                    for (let key in requestParams) {
                        postBody.append(key, requestParams[key]);
                    }
                }

                // Show the search results box
                $(`${plugin.el.selector} .${plugin.settings.instantSearchResultClass}`).show();
                resetSearchResults();

                // Fetch results
                fetch(`${plugin.settings.instantSearchUrl}${qs}`, {
                    method: plugin.settings.instantSearchMethod,
                    body: postBody
                }).then(function (response) {
                    return response.json();
                }).then(function (data) {
                    $(`${plugin.el.selector} .${plugin.settings.instantSearchResultClass} .loading`).hide();
                    processSearchResults(data);
                });
            };

            let resetSearchBar = function () {
                $(`${plugin.el.selector} .${plugin.settings.inputClass}`).val(plugin.settings.defaultSearchText);
            };

            let resetSearchResults = function () {
                $(`${plugin.el.selector} .no-results`).hide();
                $(`${plugin.el.selector} .${plugin.settings.instantSearchResultClass} .loading`).show();

                $(`${plugin.el.selector} .${plugin.settings.instantSearchResults}`).html('');
            };

            /**
             * Display a result
             *
             * @param result Array of results
             */
            let addSearchResult = function (result) {
                let html = $(`${plugin.el.selector} .${plugin.settings.instantSearchResultTemplate}`).html();

                $.each(result, function (key, val) {
                    html = html.toString().replace(`$${key}`, val);
                });

                $(`${plugin.el.selector} .${plugin.settings.instantSearchResults}`).append(html);
            };

            /**
             * Loop over returned results and if possible show them
             *
             * @param data Array of results
             */
            let processSearchResults = function (data) {
                $(`${plugin.el.selector} .no-results`).show();

                let results = plugin.settings.instantSearchPullSearchResults(data);

                $.each(results, function (key, val) {
                    $(`${plugin.el.selector} .no-results`).hide();
                    addSearchResult(plugin.settings.instantSearchMapResultToTemplate(val));
                });
            };

            init();
        }


        return this.each(function () {
            new AvSearchBar($(this), options);
        });
    };
})(jQuery);
