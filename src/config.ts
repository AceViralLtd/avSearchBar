export interface Config {
    placeholderText: string;
    selector?: {
        button?: string;
        box?: string;
        input?: string;
        resultsContainer?: string;
        results?: string;
        result?: string;
        template?: string;
    };

    request?: {
        url?: string;
        method?: string;
        bodyTemplate?: object;
    };

    instantSearch?: {
        enabled?: boolean;
        minSearchLen?: number;
        keyTimeout?: number
    };

    resultMapper?: Function;
    resutExtractor: Function;
}

export const defaultConfig: Config = {
    placeholderText: "Search",
    selector: {
        button: ".search-button",
        box: ".search-box",
        input: ".search-input",
        resultsContainer: ".results",
        results: ".search-results",
        result: ".result",
        template: ".result-template"
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
        return data.searchResults ? [ ...data.searchResults ] : [];
    }
};
