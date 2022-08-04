import React, { FC, ReactNode, useCallback, useState } from 'react';
import { ErrorContext } from '../../hooks/useError';
import { PaymentStatus } from '../../hooks/usePayment';

export interface ErrorProviderProps {
    children: ReactNode;
}

export const ErrorProvider: FC<ErrorProviderProps> = ({ children }) => {
    const [errorMessage, setErrorMessage] = useState<string>();
    const processError = useCallback((error?: object) => {
        if (error) {
            console.error(error);
        }
        setErrorMessage(error ? error.toString() : undefined);
    }, []);

    return <ErrorContext.Provider value={{ errorMessage, processError }}>{children}</ErrorContext.Provider>;
};
