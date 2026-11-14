// Etherscan-family explorers sit behind a Cloudflare bot check that screenshot
// services cannot pass. Blockscout serves the same on-chain data with matching
// URL paths and no bot wall, so captures are taken from it when a mirror exists.
const BLOCKSCOUT_MIRRORS: Record<string, string> = {
  "etherscan.io": "eth.blockscout.com",
  "sepolia.etherscan.io": "eth-sepolia.blockscout.com",
  "holesky.etherscan.io": "eth-holesky.blockscout.com",
  "optimistic.etherscan.io": "optimism.blockscout.com",
  "basescan.org": "base.blockscout.com",
  "sepolia.basescan.org": "base-sepolia.blockscout.com",
  "arbiscan.io": "arbitrum.blockscout.com",
  "polygonscan.com": "polygon.blockscout.com",
  "gnosisscan.io": "gnosis.blockscout.com",
  "era.zksync.network": "zksync.blockscout.com",
}

const EVM_ADDRESS = /^0x[a-f0-9]{40}$/i

const SHARED_PATH = /^\/(address|tx|token|block)\/[^/]+\/?$/i

const TAB_BY_FRAGMENT: Record<string, string> = {
  tokentxns: "token_transfers",
  tokentxnsErc721: "token_transfers",
  tokentxnsErc1155: "token_transfers",
  internaltx: "internal_txns",
  code: "contract",
  asset_multichain: "tokens",
}

// Explorers without a Blockscout instance that also sit behind Cloudflare.
// Each maps the source path onto an equivalent page on an unwalled explorer.
const OTHER_MIRRORS: Record<string, (path: string) => string | null> = {
  "bscscan.com": (path) => (SHARED_PATH.test(path) ? `https://bsctrace.com${path}` : null),
  "lineascan.build": (path) => (SHARED_PATH.test(path) ? `https://www.oklink.com/linea${path}` : null),
  "monadscan.com": (path) => (SHARED_PATH.test(path) ? `https://monadvision.com${path}` : null),
  "xrpscan.com": (path) => {
    const match = path.match(/^\/(account|tx|ledger)\/([^/]+)\/?$/i)
    if (!match) return null
    const section = { account: "accounts", tx: "transactions", ledger: "ledgers" }[match[1].toLowerCase()]
    return `https://livenet.xrpl.org/${section}/${match[2]}`
  },
}

export function getCaptureUrl(sourceUrl: string): string {
  let url: URL
  try {
    url = new URL(sourceUrl)
  } catch {
    return sourceUrl
  }

  const host = url.hostname.toLowerCase().replace(/^www\./, "")
  const otherMirror = OTHER_MIRRORS[host]?.(url.pathname.replace(/\/$/, ""))
  if (otherMirror) return otherMirror

  const mirror = BLOCKSCOUT_MIRRORS[host]
  if (!mirror || !SHARED_PATH.test(url.pathname)) return sourceUrl

  // Etherscan's /token/{contract}?a={wallet} shows one wallet's balance for a
  // token. Blockscout has no such per-token view; the wallet's Tokens tab lists
  // each token's quantity and value, which is the balance evidence users need.
  const tokenMatch = url.pathname.match(/^\/token\/(0x[a-f0-9]{40})\/?$/i)
  const holder = url.searchParams.get("a")
  if (tokenMatch && holder && EVM_ADDRESS.test(holder)) {
    const holderUrl = new URL(`https://${mirror}/address/${holder}`)
    holderUrl.searchParams.set("tab", "tokens")
    return holderUrl.toString()
  }

  const captureUrl = new URL(`https://${mirror}${url.pathname.replace(/\/$/, "")}`)
  const tab = TAB_BY_FRAGMENT[url.hash.slice(1)]
  if (tab) captureUrl.searchParams.set("tab", tab)
  return captureUrl.toString()
}
