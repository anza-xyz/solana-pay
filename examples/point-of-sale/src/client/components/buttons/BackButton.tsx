import React, { FC, HTMLAttributes, MouseEventHandler, ReactNode, useCallback, useState } from 'react';
import { BackIcon } from '../images/BackIcon';
import css from './BackButton.module.css';

export interface BackButtonProps {
    children: ReactNode;
    onClick: HTMLAttributes<HTMLButtonElement>['onClick'];
}

export const BackButton: FC<BackButtonProps> = ({ children, onClick }) => {
    const [disabled, setDisabled] = useState(false);
    const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
        (event) => {
            setDisabled(true);
            if (onClick) onClick(event);
        },
        [onClick]
    );

    return (
        <button className={css.button} type="button" onClick={handleClick} disabled={disabled}>
            <BackIcon />
            {children}
        </button>
    );
};
