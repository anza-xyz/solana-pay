import { Keypair } from '@solana/web3.js';
import React, { FC } from 'react';
import { NumPad } from './components/NumPad';
import { QRCode } from './components/QRCode';
import { InputProvider } from './hooks/useInput';
import { ConfigProvider } from './hooks/useConfig';
import { ThemeProvider } from './hooks/useTheme';

export const App: FC = () => {
    return (
        <div className="App">
            <ThemeProvider>
                <ConfigProvider
                    account={Keypair.generate().publicKey}
                    token={Keypair.generate().publicKey}
                    decimals={9}
                    label="Starbucks"
                >
                    <InputProvider>
                        <NumPad />
                        <QRCode references={[Keypair.generate().publicKey]} />
                    </InputProvider>
                </ConfigProvider>
            </ThemeProvider>
        </div>
    );
};
