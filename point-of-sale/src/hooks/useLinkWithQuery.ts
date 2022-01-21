import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export function useLinkWithQuery(pathname: string) {
    const { search } = useLocation();
    return useMemo(() => ({ pathname, search }), [pathname, search]);
}
