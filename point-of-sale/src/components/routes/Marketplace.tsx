import React, { FC } from 'react';
import BigNumber from 'bignumber.js';
import { useMediaQuery } from 'react-responsive';
import { FullscreenButton } from '../buttons/FullscreenButton';
import { GenerateButton } from '../buttons/GenerateButton';
import { TransactionsLink } from '../buttons/TransactionsLink';
import { Listing } from '../sections/Listing';
import { NumPad } from '../sections/NumPad';
import { PoweredBy } from '../sections/PoweredBy';
import { Summary } from '../sections/Summary';
import * as css from './NewRoute.module.pcss';
import { PublicKey } from '@solana/web3.js';

import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import { experimentalStyled as styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { usePayment } from '../../hooks/usePayment';

// const Item = styled(Paper)(({ theme }) => ({
//     ...theme.typography.body2,
//     padding: theme.spacing(2),
//     textAlign: 'center',
//     color: theme.palette.text.secondary,
//   }));

interface NftAsset {
    id: string;
    name: string;
    url: string;
}

const allAssets: NftAsset[] = [
    { id: "sportsarni1", name: "Sports Arni #1", url: "https://drive.google.com/uc?id=1Wxo4T-QeNiSorsHdtgfLZG654GxFeRdH" },
    { id: "sportsarni2", name: "Sports Arni #2", url: "https://drive.google.com/uc?id=1Wxo4T-QeNiSorsHdtgfLZG654GxFeRdH" },
    { id: "sportsarni3", name: "Sports Arni #3", url: "https://drive.google.com/uc?id=1Wxo4T-QeNiSorsHdtgfLZG654GxFeRdH" },
    { id: "sportsarni4", name: "Sports Arni #4", url: "https://drive.google.com/uc?id=1Wxo4T-QeNiSorsHdtgfLZG654GxFeRdH" },
    { id: "sportsarni5", name: "Sports Arni #5", url: "https://drive.google.com/uc?id=1Wxo4T-QeNiSorsHdtgfLZG654GxFeRdH" },
    { id: "sportsarni6", name: "Sports Arni #6", url: "https://drive.google.com/uc?id=1Wxo4T-QeNiSorsHdtgfLZG654GxFeRdH" },
    { id: "sportsarni7", name: "Sports Arni #7", url: "https://drive.google.com/uc?id=1Wxo4T-QeNiSorsHdtgfLZG654GxFeRdH" },
    { id: "sportsarni8", name: "Sports Arni #8", url: "https://drive.google.com/uc?id=1Wxo4T-QeNiSorsHdtgfLZG654GxFeRdH" },
    { id: "sportsarni9", name: "Sports Arni #9", url: "https://drive.google.com/uc?id=1Wxo4T-QeNiSorsHdtgfLZG654GxFeRdH" },
    { id: "sportsarni10", name: "Sports Arni #10", url: "https://drive.google.com/uc?id=1Wxo4T-QeNiSorsHdtgfLZG654GxFeRdH" }
];

export const Marketplace: FC = () => {
    const phone = useMediaQuery({ query: '(max-width: 767px)' });

    const { setAmount, generate, setMessage, setMemo, setRaffleRef } = usePayment();
    const handleBuy = (id: string) => {
        setAmount(new BigNumber(0.01));
        setMessage(`Buy your shiba ${id}`);
        setRaffleRef(new PublicKey('4AgY3XGwYL3PGhEeVktLUn16PCjmH2NaXkoN8CsFaXXN'));
        generate();
    };

    return phone ? (
        <div className={css.root}>
            <div className={css.top}>
                <FullscreenButton />
                <TransactionsLink />
            </div>
            <div className={css.body}>
                <NumPad />
                <GenerateButton />
            </div>
            <PoweredBy />
        </div>
    ) : (
        <div className={css.root}>
            <div className={css.main}>
                <div className={css.top}>
                    <FullscreenButton />
                </div>
                <div className={css.body}>
                    <Container fixed maxWidth="md" sx={{paddingTop: "24px"}}>
                        <Typography gutterBottom variant="h2" component="div" sx={{textAlign: "center"}}>
                            NFT Vending Machine
                        </Typography>
                        <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                            {allAssets.map((nft, index) => (
                                <Grid item xs={2} sm={4} md={4} key={index}>
                                    <Listing id={nft.id} name={nft.name} url={nft.url} onBuy={handleBuy} />
                                </Grid>
                            ))}
                        </Grid>
                    </Container>
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
