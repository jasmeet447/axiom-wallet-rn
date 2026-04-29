/**
 * WDK Configuration
 *
 * Defines the network configuration passed to WdkAppProvider and the
 * BaseAsset definitions used by useBalance / useAccount.
 *
 * Network: Ethereum (ERC-4337 account abstraction via Safe protocol)
 *
 * For production you MUST replace the public RPC/bundler URLs with keys
 * from a provider such as Alchemy, Infura, or Pimlico.
 */

import { BaseAsset } from '@tetherto/wdk-react-native-core';
import type { WdkConfigs } from '@tetherto/wdk-react-native-core';

// ─── Network (Ethereum Sepolia testnet by default) ────────────────────────────
// Switch chainId to 1 and update provider/bundlerUrl for mainnet.
//
// Public Sepolia endpoints – rate-limited; replace with dedicated keys
// for production use.
const SEPOLIA_CHAIN_ID = 11155111;
const PUBLIC_SEPOLIA_RPC = 'https://rpc.sepolia.org';
const PUBLIC_SEPOLIA_BUNDLER =
  'https://public.stackup.sh/api/v1/node/ethereum-sepolia';

// ERC-4337 EntryPoint v0.6 (deployed on every EVM testnet/mainnet)
const ENTRY_POINT_ADDRESS = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789';
const SAFE_MODULES_VERSION = '0.3.0';

export const wdkConfigs: WdkConfigs = {
  // bundle: require('../../../.wdk-bundle/wdk-worklet.bundle'), // generated bundle
  networks: {
    ethereum: {
      blockchain: 'ethereum',
      config: {
        chainId: SEPOLIA_CHAIN_ID,
        provider: PUBLIC_SEPOLIA_RPC,
        bundlerUrl: PUBLIC_SEPOLIA_BUNDLER,
        entryPointAddress: ENTRY_POINT_ADDRESS,
        safeModulesVersion: SAFE_MODULES_VERSION,
        // useNativeCoins: true means ETH pays gas (no paymaster/USDT fees)
        useNativeCoins: true,
      },
    },
  },
};

// ─── Asset definitions ────────────────────────────────────────────────────────
// Pass these to useBalance({ accountIndex, asset }) or useAccount.getBalance()

/** Native ETH asset on the configured EVM network. */
export const ETH_ASSET = new BaseAsset({
  id: 'eth',
  network: 'ethereum',
  symbol: 'ETH',
  name: 'Ethereum',
  decimals: 18,
  isNative: true,
});

/** All assets recognised by this wallet (extend for ERC-20 tokens). */
export const SUPPORTED_ASSETS = [ETH_ASSET];
