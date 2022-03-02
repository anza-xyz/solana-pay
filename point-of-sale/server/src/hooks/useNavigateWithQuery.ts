import { useCallback } from 'react';
import { useRouter } from 'next/router';
import { makeUrlWithQuery } from './useLinkWithQuery';
import { useConfig } from './useConfig';

export interface TransitionOptions {
    shallow?: boolean;
}

export function useNavigateWithQuery() {
    const router = useRouter();
    const { query } = router
    const { baseUrl } = useConfig()

    return useCallback(
        (pathname: string, options?: TransitionOptions) => {
            const url = makeUrlWithQuery(pathname, baseUrl, query)
            router.push(url.toString(), undefined, options)
        },
        [baseUrl, query, router]
    )
}
