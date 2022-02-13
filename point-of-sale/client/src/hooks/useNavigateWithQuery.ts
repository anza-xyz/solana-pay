import { useCallback } from 'react';
import { NavigateOptions } from 'react-router';
import { useLocation, useNavigate } from 'react-router-dom';

export function useNavigateWithQuery() {
    const navigate = useNavigate();
    const { search } = useLocation();
    return useCallback(
        (pathname: string, options?: NavigateOptions) => navigate({ pathname, search }, options),
        [navigate, search]
    );
}
