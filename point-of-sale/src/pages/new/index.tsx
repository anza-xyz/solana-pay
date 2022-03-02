import React from 'react';
import { useMediaQuery } from 'react-responsive';
import { FullscreenButton } from '../../components/buttons/FullscreenButton';
import { GenerateButton } from '../../components/buttons/GenerateButton';
import { TransactionsLink } from '../../components/buttons/TransactionsLink';
import { NumPad } from '../../components/sections/NumPad';
import { PoweredBy } from '../../components/sections/PoweredBy';
import { Summary } from '../../components/sections/Summary';
import css from './new.module.css';

export default function NewRoute() {
  const phone = useMediaQuery({ query: '(max-width: 767px)' });

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
