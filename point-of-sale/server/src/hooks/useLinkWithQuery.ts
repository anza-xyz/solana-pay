import { useContext, useMemo } from 'react';
import { useRouter } from 'next/router';
import { ParsedUrlQuery } from 'querystring';
import { useConfig } from './useConfig';

export function makeUrlWithQuery(pathName: string, baseUrl: string, query: ParsedUrlQuery): URL {
    const url = new URL(pathName, baseUrl);
    for (const [key, value] of Object.entries(query)) {
        if (value) {
            if (Array.isArray(value)) {
                value.forEach(v => url.searchParams.append(key, v));
            } else {
                url.searchParams.append(key, value);
            }
        }
    }
    return url
}

export function useLinkWithQuery(pathname: string) {
    const { query } = useRouter()
    const { baseUrl } = useConfig()

    return useMemo(() => {
        const url = makeUrlWithQuery(pathname, baseUrl, query)
        return url.toString()
    }, [pathname, baseUrl, query]);
}
