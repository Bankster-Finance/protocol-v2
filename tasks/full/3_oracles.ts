import { task } from 'hardhat/config';
import { getParamPerNetwork } from '../../helpers/contracts-helpers';
import { deployAaveOracle, deployLendingRateOracle } from '../../helpers/contracts-deployments';
import { setInitialMarketRatesInRatesOracleByHelper } from '../../helpers/oracles-helpers';
import { ICommonConfiguration, eNetwork, SymbolMap } from '../../helpers/types';
import { waitForTx, notFalsyOrZeroAddress } from '../../helpers/misc-utils';
import {
  ConfigNames,
  loadPoolConfig,
  getGenesisPoolAdmin,
  getLendingRateOracles,
  getQuoteCurrency,
} from '../../helpers/configuration';
import {
  getAaveOracle,
  getLendingPoolAddressesProvider,
  getLendingRateOracle,
  getPairsTokenAggregator,
} from '../../helpers/contracts-getters';
import { AaveOracle, LendingRateOracle } from '../../types';

task('full:deploy-oracles', 'Deploy oracles for dev enviroment')
  .addFlag('verify', 'Verify contracts at Etherscan')
  .addParam('pool', `Pool name to retrieve configuration, supported: ${Object.values(ConfigNames)}`)
  .setAction(async ({ verify, pool }, DRE) => {
    try {
      console.log('GOING TO DEPLOY ORACLES1');
      await DRE.run('set-DRE');
      console.log('GOING TO DEPLOY ORACLES2');
      const network = <eNetwork>DRE.network.name;
      console.log('GOING TO DEPLOY ORACLES3');
      const poolConfig = loadPoolConfig(pool);
      console.log('GOING TO DEPLOY ORACLES4');
      const {
        ProtocolGlobalParams: { UsdAddress },
        ReserveAssets,
        FallbackOracle,
        ChainlinkAggregator,
      } = poolConfig as ICommonConfiguration;
      console.log('GOING TO DEPLOY ORACLES5');
      const lendingRateOracles = getLendingRateOracles(poolConfig);
      console.log('GOING TO DEPLOY ORACLES6');
      const addressesProvider = await getLendingPoolAddressesProvider();
      console.log('GOING TO DEPLOY ORACLES7');
      const admin = await getGenesisPoolAdmin(poolConfig);
      console.log('GOING TO DEPLOY ORACLES8');
      const aaveOracleAddress = getParamPerNetwork(poolConfig.AaveOracle, network);
      console.log('GOING TO DEPLOY ORACLES9');
      const lendingRateOracleAddress = getParamPerNetwork(poolConfig.LendingRateOracle, network);
      console.log('GOING TO DEPLOY ORACLES10');
      const fallbackOracleAddress = await getParamPerNetwork(FallbackOracle, network);
      console.log('GOING TO DEPLOY ORACLES11');
      const reserveAssets = await getParamPerNetwork(ReserveAssets, network);
      console.log('GOING TO DEPLOY ORACLES12');
      const chainlinkAggregators = await getParamPerNetwork(ChainlinkAggregator, network);
      console.log('after getParamPerNetwork for chainlinkAggregators');

      const tokensToWatch: SymbolMap<string> = {
        ...reserveAssets,
        USD: UsdAddress,
      };
      console.log('after tokensToWatch');
      const [tokens, aggregators] = getPairsTokenAggregator(
        tokensToWatch,
        chainlinkAggregators,
        poolConfig.OracleQuoteCurrency
      );

      console.log('after getPairsTokenAggregator');
      let aaveOracle: AaveOracle;
      let lendingRateOracle: LendingRateOracle;

      if (notFalsyOrZeroAddress(aaveOracleAddress)) {
        aaveOracle = await getAaveOracle(aaveOracleAddress);
        await waitForTx(await aaveOracle.setAssetSources(tokens, aggregators));
      } else {
        aaveOracle = await deployAaveOracle(
          [
            tokens,
            aggregators,
            fallbackOracleAddress,
            await getQuoteCurrency(poolConfig),
            poolConfig.OracleQuoteUnit,
          ],
          verify
        );
        console.log('after deployAaveOracle');
        await waitForTx(await aaveOracle.setAssetSources(tokens, aggregators));
        console.log('after deployAaveOracle setAssetSources');
      }

      if (notFalsyOrZeroAddress(lendingRateOracleAddress)) {
        lendingRateOracle = await getLendingRateOracle(lendingRateOracleAddress);
      } else {
        lendingRateOracle = await deployLendingRateOracle(verify);
        const { USD, ...tokensAddressesWithoutUsd } = tokensToWatch;
        await setInitialMarketRatesInRatesOracleByHelper(
          lendingRateOracles,
          tokensAddressesWithoutUsd,
          lendingRateOracle,
          admin
        );
      }

      console.log('Aave Oracle: %s', aaveOracle.address);
      console.log('Lending Rate Oracle: %s', lendingRateOracle.address);

      // Register the proxy price provider on the addressesProvider
      await waitForTx(await addressesProvider.setPriceOracle(aaveOracle.address));
      await waitForTx(await addressesProvider.setLendingRateOracle(lendingRateOracle.address));
    } catch (error) {
      if (DRE.network.name.includes('tenderly')) {
        const transactionLink = `https://dashboard.tenderly.co/${DRE.config.tenderly.username}/${
          DRE.config.tenderly.project
        }/fork/${DRE.tenderly.network().getFork()}/simulation/${DRE.tenderly.network().getHead()}`;
        console.error('Check tx error:', transactionLink);
      }
      throw error;
    }
  });
