import { ParsedUrlQuery } from 'querystring';

export function createURLWithQuery(path: string | URL, query: ParsedUrlQuery): URL {
    const url = getBaseURL(path);

    for (const [key, value] of Object.entries(query)) {
        if (value) {
            if (Array.isArray(value)) {
                for (const v of value) {
                    url.searchParams.append(key, v);
                }
            } else {
                url.searchParams.append(key, value);
            }
        }
    }

    return url;
}

export function createURLWithParams(path: string | URL, query: URLSearchParams): URL {
    const url = getBaseURL(path);
    url.search = query.toString();

    return url;
}

function getBaseURL(path: string | URL) {
    return new URL(path, window.location.protocol + '//' + window.location.host);
}