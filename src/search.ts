import { Config, defaultConfig, SearchType } from './config';

export default class AvSearchBar
{
    public static TYPE = SearchType;

    private keyTimeout: any;
    private config: Config;

    private $element: JQuery<HTMLElement>;
    private $button: JQuery<HTMLElement>;
    private $box: JQuery<HTMLElement>;
    private $input: JQuery<HTMLElement>;
    private $resultsContainer: JQuery<HTMLElement>;
    private $results: JQuery<HTMLElement>;
    private $template: JQuery<HTMLElement>;


    public constructor($element: JQuery, config: Config)
    {
        this.keyTimeout = null;
        this.$element = $element;
        this.config = {
            ...defaultConfig, 
            ...config,
            instantSearch: {
                ...defaultConfig.instantSearch,
                ...config.instantSearch
            },
            request: {
                ...defaultConfig.request,
                ...config.request
            },
            selector: {
                ...defaultConfig.selector,
                ...config.selector
            }
        };

        this.assignElements();
        this.tryFindErrors();
        this.setupBinds();
        this.resetSearchBar();
    }

    public addResults(data: any, show: boolean = false): void
    {
        this.processSearchResults(data);

        if (show) {

            this.$results.show();
            this.$resultsContainer.find(this.config.selector.result).show();

            this.$results.find(".no-results, .loading").hide();
        }
    }

    private assignElements(): void
    {
        this.$button = this.$element.find(this.config.selector.button);
        this.$box = this.$element.find(this.config.selector.box);
        this.$input = this.$element.find(this.config.selector.input);
        this.$resultsContainer = this.$element.find(this.config.selector.resultsContainer);
        this.$results = this.$element.find(this.config.selector.results);
        this.$template = this.$element.find(this.config.selector.template);
    }

    private tryFindErrors(): void
    {
        if (
            this.config.instantSearch.enabled 
            && SearchType.API == this.config.instantSearch.searchType
            && !this.config.request.url
        ) {
            console.error("avSearchBar: Instnt serach enabled without api url");
        }
    }

    private processSearchResults(data: any): void
    {
        let $noResults = $(".no-results", this.$element);
        $noResults.show();

        let results = this.config.resutExtractor(data);

        $.each(results, (key, val) => {
            $noResults.hide();
            this.addSearchResult(this.config.resultMapper(val));
        });
    }

    private addSearchResult(data: any): void
    {
        let template = this.$template.html();

        $.each(data, (key: string, val: string) => {
            let regexp = new RegExp(`\\$${key}`, "g");
            template = template.toString().replace(regexp, val);
        });
    
        this.$resultsContainer.append(template);
    }

    private resetSearchResult(keepExisting: boolean = false): void
    {
        $(".no-results", this.$element).hide();
        this.$results.find(".loading").show();

        if (!keepExisting) {
            this.clearSearchResults();
        }
    }

    private showAllResults(): void
    {
        let $entries = this.$resultsContainer.find(this.config.selector.result);

        this.$results.find(".loading").hide();

        if ($entries.length) {
            $entries.show();
            this.$results.find(".no-results").hide();
        } else {
            this.$results.find(".no-results").show();
        }
    }

    private clearSearchResults(): void
    {
        this.$resultsContainer.html('');
    }

    private resetSearchBar(): void
    {
        this.$input.val(this.config.placeholderText);
    }

    private setupBinds(): void
    {
        this.$button.on("click", () => {
                this.$box.toggle();

                if (this.$input.is(":visible")) {
                    this.$input.focus();
                }
            }
        );

        this.$element.on({
            keyup: (e: KeyboardEvent) => {
                if (~[38, 40].indexOf(e.keyCode)) {
                    e.preventDefault();
                    e.stopPropagation();
                } else {
                    return;
                }

                let $results = $(this.config.selector.result, this.$element);
                if (!$results.length) {
                    return;
                }

                let i = -1;
                // get index
                $results.each(function(index: number) {
                    if ($(this).is(":focus")) {
                        i = index;
                    }
                });

                i += e.keyCode === 40 ? 1 : -1;

                if (i >= $results.length) {
                    i = 0;
                }

                $($results[i]).focus();
            }
        });

        this.$input.on({
            focus: () => {
                if (this.$input.val() === this.config.placeholderText) {
                    this.$input.val("");
                }
            },
            blur: () => {
                // if ("" === this.config.placeholderText) {
                //     this.$input.val(this.config.placeholderText);
                // }
            },
            keyup: (e: KeyboardEvent) => {
                if (!this.config.instantSearch.enabled) {
                    return;
                }

                if (null !== this.keyTimeout) {
                    clearTimeout(this.keyTimeout);
                    this.keyTimeout = null;
                }

                // on enter
                if (~[13, 38, 40].indexOf(e.keyCode)) {
                    return;
                }

                this.keyTimeout = setTimeout((e: Event) => {
                    this.runInstantSearch(this.$input.val());
                }, this.config.instantSearch.keyTimeout);
            }
        });

    }

    private runInstantSearch(query: any): void
    {
        if (query.length <= this.config.instantSearch.minSearchLen) {
            if (AvSearchBar.TYPE.RESULTS == this.config.instantSearch.searchType) {
                this.showAllResults();
            } else {
                this.$results.hide();
            }
            return;
        }

        switch (this.config.instantSearch.searchType) {
            case SearchType.API:
                this.runApiDrivenSearch(this.$results, query);
                break;

            case SearchType.RESULTS:
                this.runLocalDataDrivenSearch(this.$results, query);
                break;
        }
    }

    private runApiDrivenSearch($results: JQuery<HTMLElement>, query: any): void
    {
        let params = { ...this.config.request.bodyTemplate };
        $.each(params, (index: string, val: any) => {
            if ("avSearchBoxTermHere" === val.toString()) {
                params[index] = query;
            }
        });

        let qs = "?";
        let body;
        if ("GET" === this.config.request.method.toUpperCase()) {
            qs += $.param(params);
        } else {
            body = new FormData;
            for (let key in params) {
                body.append(key, params[key]);
            }
        }

        $results.show();
        this.resetSearchResult();

        fetch(this.config.request.url + qs, { 
            method: this.config.request.method, 
            body
        }).then((response: Response) => {
            return response.json();
        }).then((json: any) => {
            $(".loading", $results).hide();
            this.clearSearchResults();
            this.processSearchResults(json);
        }).then(() => {
            if (!this.config.onLoadComplete) {
                return;
            }

            this.config.onLoadComplete();
        });
    }

    private runLocalDataDrivenSearch($results: JQuery<HTMLElement>, query: any)
    {
        $results.show();
        this.resetSearchResult(true);

        let count = 0;
        $results.find(this.config.selector.resultsContainer).find(this.config.selector.result).each((_, elem) => {
            let $elem = $(elem);
            let data = this.config.searchDataExtractor($elem);
            let match = false;

            if (!query) {
                return;
            }

            for (let i in data) {
                if (data[i] && ~data[i].toLowerCase().indexOf(query.toLowerCase())) {
                    match = true;
                    break;
                }
            }

            if (match) {
                count++;
                $elem.show();
            } else {
                $elem.hide();
            }
        });

        $results.find(".loading").hide();
        
        if (!count) {
            $results.find(".no-results").show();
        }
    }
}
