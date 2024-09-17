import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

import {
  ConnectProvider,
  OKXConnector,
  UnisatConnector,
  BitgetConnector
} from '@particle-network/btc-connectkit';
import { Base, BaseSepolia ,MerlinTestnet,BSquaredTestnet} from '@particle-network/chains';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
      <ConnectProvider
      options={{
        projectId: "1a5f466e-400e-4d83-95a2-991a38275601",
        clientKey: "cgpu1uZM7pxhLTkqBfonZW0PpfSTNdBmGyFCEORs",
        appId: "7aa615b3-5e7d-4311-82d7-b8534b073c44",
        aaOptions: {
          accountContracts: {
            BTC: [
              {
                chainIds: [BSquaredTestnet.id],
                version: '2.0.0',
              }
            ]
          }
        },
        walletOptions: {
          visible: false
        }
      }}
      connectors={[new UnisatConnector(), new OKXConnector(), new BitgetConnector()]}
    >
    <App />
    </ConnectProvider>
  </React.StrictMode>
);

