import React, { FC, useEffect, useState } from 'react';

const INTERVAL = 250;
const DOTS = 5;

export const SendingIndicator: FC = () => {
  const [highlighted, setHighlighted] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setHighlighted(i => ++i > DOTS ? 0 : i), INTERVAL);
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    }
  }, []);

  return (
    <svg width={10 * DOTS + 4} height="4" fill="none" xmlns="http://www.w3.org/2000/svg">
      {[...Array(DOTS).keys()].map(
        i => <rect key={i} x={i * 10} width="4" height="4" rx="2"
          fill={highlighted === i ? "#533EC5" : "#E4E4E7"}
        />)}
    </svg>
  )
};
