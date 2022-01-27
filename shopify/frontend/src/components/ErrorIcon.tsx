import React, { FC } from 'react';

export const ErrorIcon: FC = () => {
  return (
    <svg width="44" height="22" viewBox="0 0 44 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect y="9" width="4" height="4" rx="2" fill="#E4E4E7" />
      <rect x="40" y="9" width="4" height="4" rx="2" fill="#E4E4E7" />
      <rect x="11" width="22" height="22" rx="11" fill="#FF6058" />
      <path d="M25 8L19 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 8L25 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
