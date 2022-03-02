import { useCallback } from 'react';
import { useRouter } from 'next/router';
import { makeUrlWithQuery } from './useLinkWithQuery';
import { useConfig } from './useConfig';

export interface NavigateOptions {
    replace: boolean;
}

export function useNavigateWithQuery() {
    const router = useRouter();
    const { query } = router
    const { baseUrl } = useConfig()

    return useCallback(
        (pathname: string, options: NavigateOptions) => {
            const url = makeUrlWithQuery(pathname, baseUrl, query)
            if (options.replace) {
                router.replace(url.toString())
            } else {
                router.push(url.toString())
            }
        },
        [baseUrl, query, router]
    )
}
