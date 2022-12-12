import { ParsedUrlQuery } from 'querystring';

export function createURLWithQuery(path: string | URL, query: ParsedUrlQuery): URL {
    const url = new URL(path, window.location.protocol + '//' + window.location.host);

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
