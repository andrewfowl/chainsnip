import Image from "next/image"

type Network = { name: string; logo?: string }

const NETWORKS: Network[] = [
  { name: "Ethereum", logo: "ethereum" },
  { name: "Bitcoin", logo: "bitcoin" },
  { name: "Solana", logo: "solana" },
  { name: "Polygon", logo: "polygon" },
  { name: "BNB Chain", logo: "bnb-chain" },
  { name: "Arbitrum", logo: "arbitrum" },
  { name: "Optimism", logo: "optimism" },
  { name: "Base", logo: "base" },
  { name: "Avalanche", logo: "avalanche" },
  { name: "Cosmos Hub", logo: "cosmos" },
  { name: "XRP Ledger", logo: "xrp" },
  { name: "Hedera", logo: "hedera" },
  { name: "Arc" },
  { name: "Monad" },
  { name: "Osmosis" },
  { name: "Celestia" },
  { name: "Injective" },
  { name: "dYdX" },
  { name: "Noble" },
  { name: "Neutron" },
  { name: "Akash" },
  { name: "Axelar" },
  { name: "Stargaze" },
  { name: "Linea" },
  { name: "zkSync Era" },
]

export const NETWORK_COUNT = NETWORKS.length

function NetworkMark({ network }: { network: Network }) {
  if (network.logo) {
    return (
      <Image
        src={`/networks/${network.logo}.svg`}
        alt=""
        width={20}
        height={20}
        unoptimized
        className="h-5 w-5 shrink-0 object-contain"
      />
    )
  }
  return (
    <span
      aria-hidden="true"
      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-foreground font-mono text-[9px] font-semibold uppercase text-background"
    >
      {network.name.slice(0, 2)}
    </span>
  )
}

export function NetworkCoverage() {
  return (
    <section id="networks" aria-labelledby="networks-heading" className="border-b border-border scroll-mt-20">
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Network coverage
              </span>
              <h2 id="networks-heading" className="mt-3 text-3xl sm:text-4xl text-foreground uppercase text-balance">
                {NETWORK_COUNT} supported networks
              </h2>
            </div>
            <p className="max-w-sm text-sm text-muted-foreground leading-relaxed text-pretty">
              Paste a link from any supported explorer, or look up a balance directly on the chains your clients
              actually hold.
            </p>
          </div>

          <ul className="mt-12 flex flex-wrap gap-2" aria-label="Supported networks">
            {NETWORKS.map((network) => (
              <li
                key={network.name}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card py-1.5 pl-1.5 pr-3.5 text-sm text-foreground"
              >
                <NetworkMark network={network} />
                {network.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
