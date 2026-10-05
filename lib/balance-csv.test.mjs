// Run with Node 22.6+: node --experimental-strip-types --test lib/balance-csv.test.mjs
import assert from "node:assert/strict"
import test from "node:test"
import { historicalBalancesCSV } from "./balance-csv.ts"

const query = Object.freeze({
  id: "query-1",
  network: "ethereum",
  networkName: "Ethereum",
  walletAddress: "0x1234",
  contractAddress: null,
  symbol: "ETH",
  balance: "1234.567890",
  balanceRaw: "1234567890",
  decimals: 18,
  blockNumber: 12345,
  blockDate: "2026-09-30T00:00:00.000Z",
  queriedAt: "2026-10-01T00:00:00.000Z",
  clientName: 'Acme, "Treasury"',
})

test("historical CSV neutralizes malicious token symbols and client names", () => {
  const payloads = [
    '=HYPERLINK("https://example.invalid","click")',
    "+SUM(1,2)",
    "-1+2",
    "@SUM(1,2)",
    "  =1+2",
    "\t=1+2",
    "\r=1+2",
    "\n=1+2",
    "\u0000=1+2",
  ]
  for (const payload of payloads) {
    const malicious = Object.freeze({ ...query, symbol: payload, clientName: payload })
    const csv = historicalBalancesCSV([malicious])
    const protectedCell = `"'${payload.replace(/"/g, '""')}"`
    assert.equal(csv.slice(csv.indexOf("\n") + 1), [
      protectedCell, '"Ethereum"', '"0x1234"', protectedCell, '"Native"',
      '"1234.567890"', '"18"', '"12345"',
      '"2026-09-30T00:00:00.000Z"', '"2026-10-01T00:00:00.000Z"',
    ].join(","), payload)
    assert.equal(malicious.symbol, payload)
    assert.equal(malicious.clientName, payload)
  }
})

test("historical CSV preserves ordinary values, quoting, and empty clients", () => {
  const csv = historicalBalancesCSV([query, { ...query, clientName: undefined }])
  assert.equal(csv, [
    '"Client","Network","Wallet Address","Token","Contract Address","Balance","Decimals","Block Number","Block Date","Queried At"',
    '"Acme, ""Treasury""","Ethereum","0x1234","ETH","Native","1234.567890","18","12345","2026-09-30T00:00:00.000Z","2026-10-01T00:00:00.000Z"',
    '"","Ethereum","0x1234","ETH","Native","1234.567890","18","12345","2026-09-30T00:00:00.000Z","2026-10-01T00:00:00.000Z"',
  ].join("\n"))
})
