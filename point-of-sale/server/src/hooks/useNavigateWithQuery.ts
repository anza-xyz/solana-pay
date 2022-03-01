import { useCallback } from 'react';
import { useRouter } from 'next/router';

export interface TransitionOptions {
    shallow?: boolean;
}

export function useNavigateWithQuery() {
    const router = useRouter();
    const query = router.query

    return useCallback(
        (pathname: string, options?: TransitionOptions) => {
            const url = new URL(pathname, window.location.href);
            for (const [key, value] of Object.entries(query)) {
                if (value) {
                    if (Array.isArray(value)) {
                        value.forEach(v => url.searchParams.append(key, v));
                    } else {
                        url.searchParams.append(key, value);
                    }
                }
            }

            router.push(url.toString(), undefined, options)
        },
        [query, router]
    )
}
