import interpolate from 'color-interpolate';
import React, { FC, useMemo } from 'react';
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useConfig } from '../hooks/useConfig';
import { PaymentStatus, usePayment } from '../hooks/usePayment';
import * as styles from './Progress.module.css';

export const Progress: FC = () => {
    const { requiredConfirmations } = useConfig();
    const { status, confirmations } = usePayment();
    const [value, text] = useMemo(() => {
        switch (status) {
            case PaymentStatus.Finalized:
                return [1, 'Complete'];
            case PaymentStatus.Confirmed:
            case PaymentStatus.Valid:
                return confirmations >= requiredConfirmations
                    ? [1, 'Complete']
                    : [
                          confirmations / requiredConfirmations,
                          Math.floor((confirmations / requiredConfirmations) * 100) + '%',
                      ];
            default:
                return [0, status];
        }
    }, [status, confirmations, requiredConfirmations]);

    const interpolated = useMemo(() => interpolate(['#8752f3', '#5497d5', '#43b4ca', '#28e0b9', '#19fb9b']), []);
    const pathColor = useMemo(() => interpolated(value), [interpolated, value]);

    return (
        <div className={styles.root}>
            <CircularProgressbar
                maxValue={1}
                value={value}
                styles={buildStyles({
                    pathTransitionDuration: 0.5,
                    pathColor,
                    trailColor: 'rgba(0,0,0,.1)',
                })}
            />
            <div className={styles.text}>{text}</div>
        </div>
    );
};
