/**
 * verify-manifest.test.ts — Regression tests for verifyManifest
 *
 * Covers blank or whitespace-only contract IDs, which must be rejected
 * before any RPC verification call is attempted.
 */

import { describe, it, expect, vi } from "vitest";
import type { SorobanRpc } from "@stellar/stellar-sdk";
import { verifyManifest, type Manifest } from "./verify-manifest.ts";

function manifestWith(contractId: string): Manifest {
  return {
    schema_version: 1,
    git_sha: "abc123",
    network: "testnet",
    deployed_at: "2026-01-01T00:00:00Z",
    contracts: {
      "kyc-registry": {
        contract_id: contractId,
        wasm_hash: "hash",
        deployed_at: "2026-01-01T00:00:00Z",
        network: "testnet",
      },
    },
  };
}

function stubServer() {
  return {
    getLedgerEntries: vi.fn(),
    getAccount: vi.fn(),
    simulateTransaction: vi.fn(),
  };
}

describe("verifyManifest", () => {
  it.each(["", "   ", "\t\n"])(
    "rejects blank contract_id %j before calling the RPC",
    async (contractId) => {
      const server = stubServer();
      await expect(
        verifyManifest(
          manifestWith(contractId),
          server as unknown as SorobanRpc.Server
        )
      ).rejects.toThrow(/empty contract_id/);
      expect(server.getLedgerEntries).not.toHaveBeenCalled();
      expect(server.simulateTransaction).not.toHaveBeenCalled();
    }
  );
});
