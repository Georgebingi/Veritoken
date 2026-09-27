/**
 * verify-manifest.test.ts — Regression tests for parseManifestEntries and requireEnv
 *
 * Covers whitespace-only contract labels slipping into verification output,
 * and missing environment variables producing errors without enough context
 * to identify what the operator needs to set.
 */

import { describe, it, expect, afterEach } from "vitest";
import { parseManifestEntries, requireEnv } from "./verify-manifest.ts";

const ENTRY = {
  contract_id: "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
  wasm_hash: "abc123",
  deployed_at: "2026-01-01T00:00:00Z",
  network: "testnet",
};

describe("parseManifestEntries", () => {
  it("returns entries with trimmed labels", () => {
    expect(parseManifestEntries({ " kyc-registry ": ENTRY })).toEqual([
      ["kyc-registry", ENTRY],
    ]);
  });

  it("rejects a whitespace-only label", () => {
    expect(() =>
      parseManifestEntries({ "kyc-registry": ENTRY, "   ": ENTRY })
    ).toThrow(/blank contract label/);
  });
});

describe("requireEnv", () => {
  const KEY = "MANIFEST_FILE";
  const original = process.env[KEY];

  afterEach(() => {
    if (original === undefined) delete process.env[KEY];
    else process.env[KEY] = original;
  });

  it("returns the value when set", () => {
    process.env[KEY] = "./manifests/local-dev.json";
    expect(requireEnv(KEY)).toBe("./manifests/local-dev.json");
  });

  it("names the missing variable and the verify-manifest context", () => {
    delete process.env[KEY];
    expect(() => requireEnv(KEY)).toThrow(
      /verify-manifest: required environment variable MANIFEST_FILE \(path to the deployment manifest/
    );
  });
});
