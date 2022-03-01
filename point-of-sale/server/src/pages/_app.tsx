import { AppProps } from 'next/app';
import { FC } from 'react';
import { useRouter } from 'next/router';
import { FullscreenProvider } from '../components/contexts/FullscreenProvider';
import { ThemeProvider } from '../components/contexts/ThemeProvider';
import SolanaPayLogo from '../images/SolanaPayLogo.svg';
import css from './_app.module.css';
import '../index.css';

const App: FC<AppProps> = ({ Component, pageProps }) => {
    const { query } = useRouter();
    const recipient = query.recipient as string;
    const label = query.label as string;

    console.log({ recipient })

    return (
        <ThemeProvider>
            <FullscreenProvider>
                {recipient && label ? (
                    <Component {...pageProps} />
                ) : (
                    <div className={css.logo}>
                        <SolanaPayLogo width={240} height={88} />
                    </div>
                )}
            </FullscreenProvider>
        </ThemeProvider>
    )
};

export default App;
