import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { NextPage } from 'next';
import React, { useMemo } from 'react';
import { useMediaQuery } from 'react-responsive';
import { IS_MERCHANT_POS, MERCHANT_IMAGE_PATH } from '../../utils/env';
import { useConfig } from '../../hooks/useConfig';
import { FullscreenButton } from '../buttons/FullscreenButton';
import { GenerateButton } from '../buttons/GenerateButton';
import { TransactionsLink } from '../buttons/TransactionsLink';
import { NumPad } from '../sections/NumPad';
import { PoweredBy } from '../sections/PoweredBy';
import { Summary } from '../sections/Summary';
import Image from 'next/image';
import css from './NewPage.module.css';
import { SolflareWalletName } from '@solana/wallet-adapter-solflare';

const NewPage: NextPage = () => {
    const { id } = useConfig();
    const { publicKey, select, wallet } = useWallet();
    const phone = useMediaQuery({ query: '(max-width: 767px)' }) || !IS_MERCHANT_POS;
    const merchantImageSrc = MERCHANT_IMAGE_PATH + id + '.png';

    if (!IS_MERCHANT_POS) {
        setTimeout(() => select(SolflareWalletName), 100);
    }

    // TODO : Add translation
    return phone ? (
        <div className={css.root}>
            <div className={css.top}>
                <FullscreenButton />
                <TransactionsLink />
            </div>
            {!IS_MERCHANT_POS && !publicKey ? (
                <div className={css.body}>
                    <div className={css.row}>
                        <Image src={merchantImageSrc} alt="Merchant Logo" height={250} width={250} />
                    </div>
                    <div className={css.row}>
                        <WalletMultiButton>
                            {wallet ? 'Connexion à ' + wallet.adapter.name : 'Choisir son portefeuille'}
                        </WalletMultiButton>
                    </div>
                </div>
            ) : (
                <div className={css.body}>
                    <NumPad />
                    <GenerateButton />
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
                    <GenerateButton />
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
