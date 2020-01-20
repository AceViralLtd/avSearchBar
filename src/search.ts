import { Config, defaultConfig } from './config';

export default class AvSearchBar
{
    private keyTimeout: any;
    private $element: JQuery;
    private config: Config;

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

        this.tryFindErrors();
        this.setupBinds();
        this.resetSearchBar();
    }

    private tryFindErrors(): void
    {
        if (this.config.instantSearch.enabled && !this.config.request.url) {
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
        let template = $(this.config.selector.template, this.$element).html();

        $.each(data, (key: string, val: string) => {
            let regexp = new RegExp(`\\$${key}`, "g");
            template = template.toString().replace(regexp, val);
        });
    
        $(this.config.selector.resultsContainer).append(template);
    }

    private resetSearchResult(): void
    {
        $(".no-results", this.$element).hide();
        $(this.config.selector.results + " .loading", this.$element).show();
        $(this.config.selector.resultsContainer, this.$element).html('');
    }

    private resetSearchBar(): void
    {
        $(this.config.selector.input, this.$element).val(this.config.placeholderText);
    }

    private setupBinds(): void
    {
        let $button = $(this.config.selector.button, this.$element);
        let $box = $(this.config.selector.box, this.$element);
        let $input = $(this.config.selector.input, this.$element);

        $button.on("click", () => {
                $box.toggle();

                if ($input.is(":visible")) {
                    $input.focus();
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

        $input.on({
            focus: () => {
                if ($input.val() === this.config.placeholderText) {
                    $input.val("");
                }
            },
            blur: () => {
                if ("" === this.config.placeholderText) {
                    $input.val(this.config.placeholderText);
                }
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
                    this.runInstantSearch($input.val());
                }, this.config.instantSearch.keyTimeout);
            }
        });

    }

    private runInstantSearch(query: any): void
    {
        let $results = $(this.config.selector.results, this.$element);

        if (query.length <= this.config.instantSearch.minSearchLen) {
            $results.hide();
            return;
        }

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
            this.processSearchResults(json);
        });
    }
}
