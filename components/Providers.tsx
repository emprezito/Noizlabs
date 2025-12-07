'use client';

import { FC, ReactNode } from 'react';
import { WalletContextProvider } from './WalletProvider';
import '@solana/wallet-adapter-react-ui/styles.css';

export const Providers: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <WalletContextProvider>
      {children}
    </WalletContextProvider>
  );
};
