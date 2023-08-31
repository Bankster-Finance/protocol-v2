import { oneRay, ZERO_ADDRESS } from '../../helpers/constants';
import { IOpBNBConfiguration, eEthereumNetwork, eOpBNBNetwork } from '../../helpers/types';

import { CommonsConfig } from './commons';
import { strategyWBNB, strategyZOZO, strategyBKS } from './reservesConfigs';

// ----------------
// POOL--SPECIFIC PARAMS
// ----------------

export const OpBNBConfig: IOpBNBConfiguration = {
  ...CommonsConfig,
  MarketId: 'Aave genesis market',
  ProviderId: 4,
  ReservesConfig: {
    WBNB: strategyWBNB,
    // ZO_ZO: strategyZOZO,
    // BKS: strategyBKS,
  },
  ReserveAssets: {
    [eOpBNBNetwork.opbnb]: {
      WBNB: '0x4200000000000000000000000000000000000006',
      // ZO_ZO: '0x4200000000000000000000000000000000000006', //TODO change this @pedro
      // BKS: '0x4200000000000000000000000000000000000006', //TODO change this @pedro
    },
  },
};

export default OpBNBConfig;
