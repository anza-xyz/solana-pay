import { useState, useEffect} from 'react';

export function useIsOnline():boolean {
    const [online, setOnlineStatus] = useState(false);
    useEffect(() => {
        const isOnline = navigator.onLine;
        setOnlineStatus(isOnline);
    });
   return online;
}
