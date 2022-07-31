import interpolate from 'color-interpolate';
import React, { FC, useMemo } from 'react';
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { PaymentStatus, usePayment } from '../../hooks/usePayment';
import css from './Progress.module.css';

export const Progress: FC = () => {
    // TODO : Add translation
    const complete = 'Validé';
    const { status, progress } = usePayment();
    const [value, text] = useMemo(() => {
        switch (status) {
            case PaymentStatus.Finalized:
                return [1, complete];
            case PaymentStatus.Confirmed:
            case PaymentStatus.Valid:
                return progress >= 1 ? [1, complete] : [progress, Math.floor(progress * 100) + '%'];
            default:
                return [0, status];
        }
    }, [status, progress]);

    const interpolated = useMemo(() => interpolate(['#8752f3', '#5497d5', '#43b4ca', '#28e0b9', '#19fb9b']), []);
    const styles = useMemo(
        () =>
            buildStyles({
                pathTransitionDuration: 3,
                pathColor: interpolated(value),
                trailColor: 'rgba(0,0,0,.1)',
            }),
        [interpolated, value]
    );

    return (
        <div className={css.root}>
            <CircularProgressbar maxValue={1} value={value} styles={styles} />
            <div className={css.text}>{text}</div>
        </div>
    );
};
