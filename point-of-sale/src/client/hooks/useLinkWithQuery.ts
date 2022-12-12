import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { createURLWithQuery } from '../utils/createURLWithQuery';

export function useLinkWithQuery(pathname: string) {
    const { query } = useRouter();

    return useMemo(() => String(createURLWithQuery(pathname, query)), [pathname, query]);
}
