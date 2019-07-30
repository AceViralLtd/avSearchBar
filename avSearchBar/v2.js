(function($) {
    $.fn.avSearchBar = function(config) {
        const defaultConfig = {
            selector: {
                button: "search-button",
                box: "search-box",
                input: "search-input",
                resultsContainer: "results",
                result: "search-result",
                template: "result-template"
            },
            request: {
                url: "",
                method: "post",
                bodyTemplate: {
                    search: "avSearchBoxTermHere"
                }
            },

            instantSearch: {
                enabled: false,
                minSearchLen: 2,
                keyTimeout: 500,
            },
        
            resultMapper: data => ({
                ...data
            }),
            resutExtractor: data => {
                return data.searchResults ? [ ...data.SearchResults ] : [];
            }
        };

        class AvSearchBar
        {
            construct($element, config) {
                this.keyTimeout = null;
                this.config = $.extend({}, defaultConfig, config);
                this.$element = $element;
            }

            tryFindErrors() {
                if (this.config.instantSearch.enabled && !this.config.request.url) {
                    console.error("avSearchBox: Instant search enabled BUT no URL given!");
                }
            }

            setupListeners() {
            }

            runInstantSearch() {
            }
            resetSearchBar() {
            }
            resetSearchResults() {
            }
            addSearchResult() {
            }

            processSearchResults(data) {
                $(".no-results", this.$element).show();

                let results = this.config.resultExtractor(data);

                for (let key in 
            }
        }

        // do pass the original selector to all children
        let $original = this;
        return this.each(() => {
            let $this = $(this);
            $this.selector = $original.selector;
            new AvSearchBar($this, config);
        });
    };
})(jQuery);
