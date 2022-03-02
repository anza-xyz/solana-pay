import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import React, { useEffect } from 'react';
import { useConfig } from '../../hooks/useConfig';
import { usePayment } from '../../hooks/usePayment';
import { BackButton } from '../../components/buttons/BackButton';
import { Amount } from '../../components/sections/Amount';
import { PoweredBy } from '../../components/sections/PoweredBy';
import { QRCode } from '../../components/sections/QRCode';
import css from './pending.module.css';

export default function PendingRoute() {
    const { symbol, connectWallet } = useConfig();
    const { amount, reset } = usePayment();
    const { publicKey } = useWallet();
    const { setVisible } = useWalletModal();

    useEffect(() => {
        if (connectWallet && !publicKey) {
            setVisible(true);
        }
    }, [connectWallet, publicKey, setVisible]);

    return (
        <div className={css.root}>
            <div className={css.header}>
                <BackButton onClick={reset}>Cancel</BackButton>
                {connectWallet ? <WalletMultiButton /> : null}
            </div>
            <div className={css.main}>
                <div className={css.amount}>
                    <Amount amount={amount} />
                </div>
                <div className={css.symbol}>{symbol}</div>
                <div className={css.code}>
                    <QRCode />
                </div>
                <div className={css.scan}>Scan this code with your Solana Pay wallet</div>
                <div className={css.confirm}>You'll be asked to approve the transaction</div>
            </div>
            <div className={css.footer}>
                <PoweredBy />
            </div>
        </div>
    );
};
