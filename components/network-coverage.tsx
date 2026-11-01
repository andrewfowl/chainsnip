import Image from "next/image"

type Network = { name: string; logo?: string }

type NetworkGroup = {
  family: string
  capabilities: string
  networks: Network[]
}

const GROUPS: NetworkGroup[] = [
  {
    family: "EVM",
    capabilities: "Snapshots + historical balances from archive nodes",
    networks: [
      { name: "Ethereum", logo: "ethereum" },
      { name: "Polygon", logo: "polygon" },
      { name: "BNB Chain", logo: "bnb-chain" },
      { name: "Arbitrum", logo: "arbitrum" },
      { name: "Optimism", logo: "optimism" },
      { name: "Base", logo: "base" },
      { name: "Avalanche", logo: "avalanche" },
      { name: "Arc" },
      { name: "Monad" },
    ],
  },
  {
    family: "Solana",
    capabilities: "Snapshots + balances for SOL and SPL tokens",
    networks: [{ name: "Solana", logo: "solana" }],
  },
  {
    family: "Cosmos",
    capabilities: "Snapshots + balances on the main IBC chains",
    networks: [
      { name: "Cosmos Hub", logo: "cosmos" },
      { name: "Osmosis" },
      { name: "Celestia" },
      { name: "Injective" },
      { name: "dYdX" },
      { name: "Noble" },
      { name: "Neutron" },
      { name: "Akash" },
      { name: "Axelar" },
      { name: "Stargaze" },
    ],
  },
  {
    family: "More explorers",
    capabilities: "Month-end explorer snapshots",
    networks: [
      { name: "Bitcoin", logo: "bitcoin" },
      { name: "XRP Ledger", logo: "xrp" },
      { name: "Hedera", logo: "hedera" },
      { name: "Linea" },
      { name: "zkSync Era" },
    ],
  },
]

export const NETWORK_COUNT = GROUPS.reduce((total, group) => total + group.networks.length, 0)

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
                {NETWORK_COUNT} networks, one evidence trail
              </h2>
            </div>
            <p className="max-w-sm text-sm text-muted-foreground leading-relaxed text-pretty">
              Paste a link from any supported explorer, or look up a balance directly on the chains your clients
              actually hold.
            </p>
          </div>

          <div className="mt-12 border-t border-border">
            {GROUPS.map((group) => (
              <div
                key={group.family}
                className="grid gap-4 border-b border-border py-6 md:grid-cols-[14rem_1fr] md:gap-8"
              >
                <div>
                  <h3 className="text-base font-semibold text-foreground">{group.family}</h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{group.capabilities}</p>
                </div>
                <ul className="flex flex-wrap content-start items-start gap-2" aria-label={`${group.family} networks`}>
                  {group.networks.map((network) => (
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
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
