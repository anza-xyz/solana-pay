import { useContext } from 'react';
import { ConfigContext, ConfigContextState } from '../components/contexts/ConfigProvider';

export function useConfig(): ConfigContextState {
    return useContext(ConfigContext);
}
