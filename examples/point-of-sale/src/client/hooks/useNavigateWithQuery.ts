import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { createURLWithQuery } from '../utils/createURLWithQuery';

export interface NavigateOptions {
    replace: boolean;
}

export function useNavigateWithQuery() {
    const router = useRouter();
    const { query } = router;

    return useCallback(
        (pathname: string, replace = false) => {
            const origin = window.location.protocol + '//' + window.location.host;
            const url = String(createURLWithQuery(pathname, origin, query));
            if (replace) {
                router.replace(url);
            } else {
                router.push(url);
            }
        },
        [query, router]
    );
}
