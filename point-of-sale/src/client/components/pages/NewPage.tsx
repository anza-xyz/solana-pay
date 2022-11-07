import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { NextPage } from 'next';
import React, { useCallback, useMemo } from 'react';
import { useMediaQuery } from 'react-responsive';
import { IS_MERCHANT_POS, MERCHANT_IMAGE_PATH } from '../../utils/env';
import { useConfig } from '../../hooks/useConfig';
import { FullscreenButton } from '../buttons/FullscreenButton';
import { GenerateButton } from '../buttons/GenerateButton';
import { TransactionsLink } from '../buttons/TransactionsLink';
import { NumPad } from '../sections/NumPad';
import { PoweredBy } from '../sections/PoweredBy';
import { Summary } from '../sections/Summary';
import css from './NewPage.module.css';
import { SolflareWalletName } from '@solana/wallet-adapter-solflare';
import { BackButton } from '../buttons/BackButton';
import { useRouter } from 'next/router';
import { Merchant } from '../sections/Merchant';

const NewPage: NextPage = () => {
    const { id, label, recipient, maxValue } = useConfig();
    const { publicKey, select, wallet } = useWallet();
    const phone = useMediaQuery({ query: '(max-width: 767px)' }) || !IS_MERCHANT_POS;
    const generateText = 'Payer';
    const router = useRouter();
    const { baseURL } = useConfig();
    const merchant = { index: id as number, address: recipient.toString(), company: label, maxValue };

    // if (!IS_MERCHANT_POS && !wallet) {
    // setTimeout(() => select(SolflareWalletName), 100);
    // }

    // TODO : Add translation
    return phone ? (
        <div className={css.root}>
            <div className={css.top}>
                {!IS_MERCHANT_POS ? (
                    <BackButton onClick={() => router.push(baseURL)}>Changer de Marchand</BackButton>
                ) : null}

                <FullscreenButton />
                <TransactionsLink />
            </div>
            {!IS_MERCHANT_POS && !publicKey ? (
                <div className={css.body}>
                    <Merchant index={merchant.index} company={merchant.company} />
                    <div className={css.row}>
                        <WalletMultiButton className={css.button}>
                            {wallet ? 'Connexion à ' + wallet.adapter.name + '...' : 'Se connecter'}
                        </WalletMultiButton>
                    </div>
                </div>
            ) : (
                <div className={css.body}>
                    <NumPad />
                    <GenerateButton>{generateText}</GenerateButton>
                    <PoweredBy />
                </div>
            )}
        </div>
    ) : (
        <div className={css.root}>
            <div className={css.main}>
                <div className={css.top}>
                    <FullscreenButton />
                </div>
                <div className={css.body}>
                    <NumPad />
                </div>
                <PoweredBy />
            </div>
            <div className={css.side}>
                <div className={css.summary}>
                    <Summary />
                    <GenerateButton>{generateText}</GenerateButton>
                </div>
                <div className={css.bottom}>
                    <TransactionsLink />
                </div>
            </div>
        </div>
    );
};

export default NewPage;

export function getServerSideProps() {
    // Required so getInitialProps re-runs on the server-side
    // If it runs on client-side then there's no req and the URL reading doesn't work
    // See https://nextjs.org/docs/api-reference/data-fetching/get-initial-props
    return {
        props: {},
    };
}
