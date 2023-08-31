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
    ZO_ZO: strategyZOZO,
    BKS: strategyBKS,
  },
  ReserveAssets: {
    [eOpBNBNetwork.opbnb]: {
      WBNB: '0x4200000000000000000000000000000000000006',
      ZO_ZO: '0xa41b3067ec694dbec668c389550ba8fc589e5797',
      BKS: '0x5FbDB2315678afecb367f032d93F642f64180aa3', //@pedro
    },
  },
};

export default OpBNBConfig;
