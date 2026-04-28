/**
 * Minimal EVM legacy-transaction signer.
 *
 * Signs EIP-155 type-0 transactions entirely on-device using the crypto
 * primitives already in the dependency tree:
 *   @noble/curves — secp256k1 ECDSA signing
 *   @noble/hashes — keccak-256 hashing
 *
 * Private keys accepted here are NEVER stored, logged, or transmitted.
 * The caller is responsible for zeroing the buffer after the call returns.
 *
 * Only plain ETH transfers are targeted (data = empty).  ERC-20
 * calldata can be added by populating the `data` field.
 */

import { secp256k1 } from '@noble/curves/secp256k1.js';
import { keccak_256 } from '@noble/hashes/sha3';

// ─── RLP encoding (minimal, covers EVM tx field types) ───────────────────────

function hexToBytes(hex: string): Uint8Array {
  const h = hex.startsWith('0x') ? hex.slice(2) : hex;
  const padded = h.length % 2 === 0 ? h : '0' + h;
  const out = new Uint8Array(padded.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(padded.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function concat(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((s, a) => s + a.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const a of arrays) {
    out.set(a, offset);
    offset += a.length;
  }
  return out;
}

/** Convert a bigint to its minimal big-endian byte representation. */
function bigintToBytes(n: bigint): Uint8Array {
  if (n === 0n) return new Uint8Array(0);
  let hex = n.toString(16);
  if (hex.length % 2 !== 0) hex = '0' + hex;
  return hexToBytes(hex);
}

function rlpLengthPrefix(data: Uint8Array, baseOffset: number): Uint8Array {
  if (data.length < 56) {
    const out = new Uint8Array(1 + data.length);
    out[0] = baseOffset + data.length;
    out.set(data, 1);
    return out;
  }
  const lenBytes = bigintToBytes(BigInt(data.length));
  const out = new Uint8Array(1 + lenBytes.length + data.length);
  out[0] = baseOffset + 55 + lenBytes.length;
  out.set(lenBytes, 1);
  out.set(data, 1 + lenBytes.length);
  return out;
}

/** RLP-encode a byte string. */
function rlpBytes(data: Uint8Array): Uint8Array {
  if (data.length === 1 && data[0] < 0x80) return data; // single low byte
  return rlpLengthPrefix(data, 0x80);
}

/** RLP-encode an unsigned integer (bigint). */
function rlpUint(n: bigint): Uint8Array {
  if (n === 0n) return new Uint8Array([0x80]); // RLP zero = empty string
  return rlpBytes(bigintToBytes(n));
}

/** RLP-encode a list of already-encoded items. */
function rlpList(items: Uint8Array[]): Uint8Array {
  const body = concat(...items);
  return rlpLengthPrefix(body, 0xc0);
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EvmTxParams {
  /** Account nonce from `eth_getTransactionCount`. */
  nonce: bigint;
  /** Gas price in Wei (e.g. 20 * 1e9 for 20 Gwei). */
  gasPriceWei: bigint;
  /** Gas limit (21 000 for a plain ETH transfer). */
  gasLimit: bigint;
  /** Recipient address \u2014 checksummed or lowercase, with 0x prefix. */
  to: string;
  /** Value in Wei. */
  valueWei: bigint;
  /** Optional calldata; empty Uint8Array for plain ETH sends. */
  data?: Uint8Array;
  /**
   * EIP-155 chain ID for replay protection.
   *   1        = Ethereum mainnet
   *   11155111 = Sepolia testnet
   */
  chainId: bigint;
}

// ─── Signer ───────────────────────────────────────────────────────────────────

/**
 * Sign an EVM legacy transaction and return the serialised signed-tx hex
 * ready for `eth_sendRawTransaction` / `broadcastRawTx`.
 *
 * @param params  Transaction fields.
 * @param privKey Raw 32-byte secp256k1 private key derived on-device from the
 *                BIP-44 mnemonic.  The CALLER must zero this buffer after the
 *                function returns \u2014 it is not zeroed here.
 * @returns       `"0x"` prefixed hex string of the signed transaction.
 */
export function signEvmTransaction(
  params: EvmTxParams,
  privKey: Uint8Array,
): string {
  const {
    nonce,
    gasPriceWei,
    gasLimit,
    to,
    valueWei,
    data = new Uint8Array(0),
    chainId,
  } = params;

  const toBytes = hexToBytes(to); // 20 address bytes

  // EIP-155 pre-image: RLP([nonce, gasPrice, gasLimit, to, value, data, chainId, 0, 0])
  const preimage = rlpList([
    rlpUint(nonce),
    rlpUint(gasPriceWei),
    rlpUint(gasLimit),
    rlpBytes(toBytes),
    rlpUint(valueWei),
    rlpBytes(data),
    rlpUint(chainId),
    rlpUint(0n),
    rlpUint(0n),
  ]);

  const hash = keccak_256(preimage);

  // @noble/curves v2.x: sign with format:'recovered' returns 65 bytes:
  //   bytes[0..31]  = r (32 bytes)
  //   bytes[32..63] = s (32 bytes)
  //   bytes[64]     = recovery bit (0 or 1)
  // lowS:true enforces the canonical low-S convention required by EVM.
   
  const sigBytes: Uint8Array = (secp256k1.sign as any)(hash, privKey, {
    format: 'recovered',
    lowS: true,
  });

  const recovery: number = sigBytes[64] ?? 0;

  // EIP-155 v = chainId * 2 + 35 + recovery
  const v = chainId * 2n + 35n + BigInt(recovery);

  const rBytes = sigBytes.slice(0, 32);
  const sBytes = sigBytes.slice(32, 64);

  const signed = rlpList([
    rlpUint(nonce),
    rlpUint(gasPriceWei),
    rlpUint(gasLimit),
    rlpBytes(toBytes),
    rlpUint(valueWei),
    rlpBytes(data),
    rlpUint(v),
    rlpBytes(rBytes),
    rlpBytes(sBytes),
  ]);

  return '0x' + bytesToHex(signed);
}
