"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { getCurrentUser, type User } from "@/lib/auth"
import {
  getArchives,
  saveArchive,
  deleteArchive,
  updateArchive,
  PLAN_LIMITS,
  getAllExplorers,
  saveCustomExplorer,
  getCustomExplorers,
  deleteCustomExplorer,
  detectChainFromUrl,
  type Archive,
  type CustomExplorer,
  getUserUsageStats, // Import usage stats functions
  getMonthEndDate,
} from "@/lib/archives"
import {
  Plus,
  Trash2,
  ExternalLink,
  Clock,
  Calendar,
  Search,
  Loader2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Settings2,
  Camera,
  ImageIcon,
  FileCode,
  Download,
  Users,
  ChevronDown,
} from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [archives, setArchives] = useState<Archive[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingArchive, setIsAddingArchive] = useState(false)
  const [captureProgress, setCaptureProgress] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterChain, setFilterChain] = useState<string>("all")
  const [filterClient, setFilterClient] = useState<string>("all")
  const [groupBy, setGroupBy] = useState<"none" | "client" | "chain" | "wallet">("none")
  const [newArchiveUrl, setNewArchiveUrl] = useState("")
  const [newArchiveSnapshotDate, setNewArchiveSnapshotDate] = useState("")
  const [enableMonthlyCapture, setEnableMonthlyCapture] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCustomExplorerDialogOpen, setIsCustomExplorerDialogOpen] = useState(false)
  const [customExplorers, setCustomExplorers] = useState<CustomExplorer[]>([])
  const [newCustomExplorer, setNewCustomExplorer] = useState({ name: "", domain: "" })
  const [urlPreview, setUrlPreview] = useState<{ chain: string; explorer: string } | null>(null)
  const [pendingExplorerUrl, setPendingExplorerUrl] = useState<string | null>(null)
  const [newArchiveClient, setNewArchiveClient] = useState("")

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push("/auth/login")
      return
    }
    setUser(currentUser)
    setArchives(getArchives(currentUser.id))
    setCustomExplorers(getCustomExplorers())
    setIsLoading(false)

    setNewArchiveSnapshotDate(format(new Date(), "yyyy-MM-dd"))
  }, [router])

  useEffect(() => {
    if (newArchiveUrl) {
      const detected = detectChainFromUrl(newArchiveUrl)
      setUrlPreview(detected)
    } else {
      setUrlPreview(null)
    }
  }, [newArchiveUrl])

  const handleAddArchive = async () => {
    if (!user || !newArchiveUrl) return

    const usageStats = getUserUsageStats(user.id)
    const limits = PLAN_LIMITS[user.plan]

    if (usageStats.totalCapturesEver >= limits.maxSnapshots) {
      toast({
        title: "Limit Reached",
        description: `You've reached the lifetime limit of ${limits.maxSnapshots} snapshots on the ${user.plan} plan. Please upgrade to continue capturing.`,
        variant: "destructive",
      })
      return
    }

    if (enableMonthlyCapture && !limits.monthlyAutoSave) {
      toast({
        title: "Upgrade Required",
        description: "Monthly auto-capture is only available on Professional and Firm plans.",
        variant: "destructive",
      })
      return
    }

    const allExplorers = getAllExplorers()
    const isSupported = allExplorers.some((e) => newArchiveUrl.toLowerCase().includes(e.url.toLowerCase()))

    if (!isSupported) {
      try {
        const url = new URL(newArchiveUrl)
        const domain = url.hostname
        setNewCustomExplorer({ name: "", domain })
        setPendingExplorerUrl(newArchiveUrl)
        setIsCustomExplorerDialogOpen(true)
      } catch {
        // Invalid URL
      }
      toast({
        title: "Unsupported Explorer",
        description: "This explorer is not recognized. Add it as a custom explorer to continue.",
        variant: "destructive",
      })
      return
    }

    setIsAddingArchive(true)
    setCaptureProgress("Creating archive record...")

    try {
      const url = new URL(newArchiveUrl)
      const title = `${url.hostname}${url.pathname.slice(0, 30)}...`

      // First, create the archive record
      const newArchive = saveArchive({
        userId: user.id,
        url: newArchiveUrl,
        title,
        content: `Archived explorer snapshot from ${newArchiveUrl}`,
        snapshotDate: getMonthEndDate().toISOString(),
        scheduleInterval: enableMonthlyCapture ? "monthly" : null,
        clientName: newArchiveClient || undefined,
      })

      // Update local state immediately with pending status
      setArchives([newArchive, ...archives])

      setCaptureProgress("Capturing screenshot and HTML...")

      // Now call the capture API
      const captureResponse = await fetch("/api/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: newArchiveUrl,
          archiveId: newArchive.id,
        }),
      })

      const captureResult = await captureResponse.json()

      if (captureResponse.ok && captureResult.success) {
        // Update archive with captured URLs
        updateArchive(newArchive.id, {
          screenshotUrl: captureResult.screenshotUrl,
          htmlUrl: captureResult.htmlUrl,
          proofHash: captureResult.proofHash,
          captureStatus: "completed",
        })

        // Update local state
        setArchives((prev) =>
          prev.map((a) =>
            a.id === newArchive.id
              ? {
                  ...a,
                  screenshotUrl: captureResult.screenshotUrl,
                  htmlUrl: captureResult.htmlUrl,
                  proofHash: captureResult.proofHash,
                  captureStatus: "completed" as const,
                }
              : a,
          ),
        )

        toast({
          title: "Snapshot Captured",
          description: `Successfully captured ${captureResult.screenshotUrl ? "screenshot" : ""}${captureResult.screenshotUrl && captureResult.htmlUrl ? " and " : ""}${captureResult.htmlUrl ? "HTML" : ""} from ${url.hostname}`,
        })
      } else {
        // Mark as failed but keep the record
        updateArchive(newArchive.id, {
          captureStatus: "failed",
          captureError: captureResult.error || "Unknown error",
        })

        setArchives((prev) =>
          prev.map((a) =>
            a.id === newArchive.id
              ? {
                  ...a,
                  captureStatus: "failed" as const,
                  captureError: captureResult.error || "Unknown error",
                }
              : a,
          ),
        )

        toast({
          title: "Capture Partially Failed",
          description: captureResult.error || "Could not capture the page. You can retry later.",
          variant: "destructive",
        })
      }

      setNewArchiveUrl("")
      setEnableMonthlyCapture(false)
      setIsDialogOpen(false)
      setNewArchiveClient("") // Reset client field after save
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to capture snapshot",
        variant: "destructive",
      })
    }

    setIsAddingArchive(false)
    setCaptureProgress("")
  }

  const handleDeleteArchive = (id: string) => {
    deleteArchive(id)
    setArchives(archives.filter((a) => a.id !== id))
    toast({ title: "Deleted", description: "Snapshot deleted successfully." })
  }

  const handleRetryCapture = async (archive: Archive) => {
    toast({ title: "Retrying", description: "Attempting to capture snapshot again..." })

    updateArchive(archive.id, { captureStatus: "capturing" })
    setArchives((prev) => prev.map((a) => (a.id === archive.id ? { ...a, captureStatus: "capturing" as const } : a)))

    try {
      const captureResponse = await fetch("/api/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: archive.url,
          archiveId: archive.id,
        }),
      })

      const captureResult = await captureResponse.json()

      if (captureResponse.ok && captureResult.success) {
        updateArchive(archive.id, {
          screenshotUrl: captureResult.screenshotUrl,
          htmlUrl: captureResult.htmlUrl,
          proofHash: captureResult.proofHash,
          captureStatus: "completed",
          captureError: undefined,
        })

        setArchives((prev) =>
          prev.map((a) =>
            a.id === archive.id
              ? {
                  ...a,
                  screenshotUrl: captureResult.screenshotUrl,
                  htmlUrl: captureResult.htmlUrl,
                  proofHash: captureResult.proofHash,
                  captureStatus: "completed" as const,
                  captureError: undefined,
                }
              : a,
          ),
        )

        toast({ title: "Success", description: "Snapshot captured successfully!" })
      } else {
        updateArchive(archive.id, {
          captureStatus: "failed",
          captureError: captureResult.error,
        })

        setArchives((prev) =>
          prev.map((a) =>
            a.id === archive.id ? { ...a, captureStatus: "failed" as const, captureError: captureResult.error } : a,
          ),
        )

        toast({ title: "Failed", description: captureResult.error, variant: "destructive" })
      }
    } catch (error) {
      updateArchive(archive.id, {
        captureStatus: "failed",
        captureError: error instanceof Error ? error.message : "Unknown error",
      })

      setArchives((prev) =>
        prev.map((a) =>
          a.id === archive.id ? { ...a, captureStatus: "failed" as const, captureError: "Network error" } : a,
        ),
      )

      toast({ title: "Error", description: "Network error occurred", variant: "destructive" })
    }
  }

  const handleAddCustomExplorer = () => {
    if (!newCustomExplorer.name || !newCustomExplorer.domain) {
      toast({
        title: "Missing Fields",
        description: "Please provide a name and domain.",
        variant: "destructive",
      })
      return
    }

    // Clean up domain - remove protocol and paths
    const domain = newCustomExplorer.domain
      .replace(/^https?:\/\//, "")
      .replace(/\/.*$/, "")
      .toLowerCase()

    const explorer = saveCustomExplorer({ name: newCustomExplorer.name, domain })
    setCustomExplorers([...customExplorers, explorer])
    setNewCustomExplorer({ name: "", domain: "" })
    setIsCustomExplorerDialogOpen(false)
    toast({
      title: "Explorer Added",
      description: `${newCustomExplorer.name} has been added. You can now capture snapshots from ${domain}`,
    })

    if (pendingExplorerUrl) {
      setNewArchiveUrl(pendingExplorerUrl)
      setPendingExplorerUrl(null)
      setIsDialogOpen(true)
    }
  }

  const uniqueChains = [...new Set(archives.map((a) => a.chain))]
  const uniqueClients = [...new Set(archives.map((a) => a.clientName).filter(Boolean))] as string[]

  const filteredArchives = archives.filter((archive) => {
    const walletAddress = archive.walletAddress || ""
    const url = archive.url || ""
    const chain = archive.chain || ""
    const clientName = archive.clientName || ""

    const matchesSearch =
      walletAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clientName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesChainFilter = filterChain === "all" || chain === filterChain
    const matchesClientFilter = filterClient === "all" || clientName === filterClient

    return matchesSearch && matchesChainFilter && matchesClientFilter
  })

  const groupedArchives = () => {
    if (groupBy === "none") return { "All Snapshots": filteredArchives }

    return filteredArchives.reduce(
      (groups, archive) => {
        let key: string
        switch (groupBy) {
          case "client":
            key = archive.clientName || "Unassigned"
            break
          case "chain":
            key = archive.chain || "Unknown"
            break
          case "wallet":
            key = archive.walletAddress
              ? `${archive.walletAddress.slice(0, 8)}...${archive.walletAddress.slice(-6)}`
              : "Unknown"
            break
          default:
            key = "All"
        }
        if (!groups[key]) groups[key] = []
        groups[key].push(archive)
        return groups
      },
      {} as Record<string, Archive[]>,
    )
  }

  const exportToJSON = () => {
    const data = filteredArchives.map((a) => ({
      client: a.clientName || null,
      chain: a.chain,
      explorer: a.explorer,
      walletAddress: a.walletAddress,
      snapshotDate: a.snapshotDate,
      capturedAt: a.archivedAt,
      status: a.captureStatus,
      url: a.url,
      screenshotUrl: a.screenshotUrl || null,
      proofHash: a.proofHash || null,
    }))

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `chainship-report-${format(new Date(), "yyyy-MM-dd")}.json`
    link.click()
    URL.revokeObjectURL(link.href)

    toast({ title: "Export Complete", description: `Exported ${filteredArchives.length} snapshots to JSON` })
  }

  const getCaptureStatusBadge = (archive: Archive) => {
    switch (archive.captureStatus) {
      case "completed":
        return (
          <Badge variant="outline" className="text-green-600 border-green-600/30">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Captured
          </Badge>
        )
      case "capturing":
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-600/30">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Capturing
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="outline" className="text-red-600 border-red-600/30">
            <AlertCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-amber-600 border-amber-600/30">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) return null

  const usageStats = getUserUsageStats(user.id)
  const limits = PLAN_LIMITS[user.plan]
  const usagePercent = Math.round((usageStats.totalCapturesEver / limits.maxSnapshots) * 100)

  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Manage your blockchain explorer snapshots for accounting records.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCustomExplorerDialogOpen} onOpenChange={setIsCustomExplorerDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings2 className="mr-2 h-4 w-4" />
                Custom Explorers
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Custom Explorer</DialogTitle>
                <DialogDescription>
                  Add any blockchain explorer by entering its domain. Just paste any URL from the explorer and we'll
                  extract the domain automatically.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Explorer Name</Label>
                  <Input
                    placeholder="e.g., MyChain Explorer"
                    value={newCustomExplorer.name}
                    onChange={(e) => setNewCustomExplorer({ ...newCustomExplorer, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Domain or URL</Label>
                  <Input
                    placeholder="e.g., explorer.mychain.io or paste full URL"
                    value={newCustomExplorer.domain}
                    onChange={(e) => {
                      // Auto-extract domain from pasted URL
                      let value = e.target.value
                      if (value.includes("://")) {
                        try {
                          const url = new URL(value)
                          value = url.hostname
                        } catch {
                          // Keep original value if URL parsing fails
                        }
                      }
                      setNewCustomExplorer({ ...newCustomExplorer, domain: value })
                    }}
                  />
                  <p className="text-xs text-muted-foreground">You can paste a full URL and we'll extract the domain</p>
                </div>
                <Button onClick={handleAddCustomExplorer} className="w-full">
                  Add Explorer
                </Button>

                {customExplorers.length > 0 && (
                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm font-medium mb-2">Your Custom Explorers</p>
                    <div className="space-y-2">
                      {customExplorers.map((explorer) => (
                        <div key={explorer.id} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div>
                            <p className="text-sm font-medium">{explorer.name}</p>
                            <p className="text-xs text-muted-foreground">{explorer.domain}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              deleteCustomExplorer(explorer.id)
                              setCustomExplorers(customExplorers.filter((e) => e.id !== explorer.id))
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Capture Snapshot
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Capture Explorer Snapshot</DialogTitle>
                <DialogDescription>
                  Enter a blockchain explorer URL showing the wallet address you want to archive.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="url">Explorer URL</Label>
                  <Input
                    id="url"
                    placeholder="https://etherscan.io/address/0x..."
                    value={newArchiveUrl}
                    onChange={(e) => setNewArchiveUrl(e.target.value)}
                  />
                  {urlPreview && (
                    <div className="flex items-center gap-2 text-xs">
                      {urlPreview.chain !== "Unknown" ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          <span className="text-green-600">
                            Detected: {urlPreview.explorer} ({urlPreview.chain})
                          </span>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-3 w-3 text-amber-500" />
                          <span className="text-amber-600">Unknown explorer - </span>
                          <button
                            type="button"
                            className="text-primary underline hover:no-underline text-xs"
                            onClick={() => {
                              try {
                                const url = new URL(newArchiveUrl)
                                setNewCustomExplorer({ name: "", domain: url.hostname })
                                setPendingExplorerUrl(newArchiveUrl)
                                setIsDialogOpen(false)
                                setIsCustomExplorerDialogOpen(true)
                              } catch {
                                setIsCustomExplorerDialogOpen(true)
                              }
                            }}
                          >
                            Add it now
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client">Client Name (Optional)</Label>
                  <Input
                    id="client"
                    placeholder="e.g., Acme Corp, Client ABC..."
                    value={newArchiveClient}
                    onChange={(e) => setNewArchiveClient(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Organize snapshots by client for easier reporting</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="snapshot-date">Snapshot Date</Label>
                  <Input
                    id="snapshot-date"
                    type="date"
                    value={newArchiveSnapshotDate}
                    onChange={(e) => setNewArchiveSnapshotDate(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">The accounting period date this snapshot represents</p>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label>Auto Month-End Capture</Label>
                    <p className="text-xs text-muted-foreground">Automatically capture on the last day of each month</p>
                  </div>
                  <Switch
                    checked={enableMonthlyCapture}
                    onCheckedChange={setEnableMonthlyCapture}
                    disabled={!limits.monthlyAutoSave}
                  />
                </div>
                {!limits.monthlyAutoSave && (
                  <p className="text-xs text-amber-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Upgrade to Professional for auto month-end captures
                  </p>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddArchive} disabled={isAddingArchive || !newArchiveUrl}>
                  {isAddingArchive ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {captureProgress || "Capturing..."}
                    </>
                  ) : (
                    <>
                      <Camera className="mr-2 h-4 w-4" />
                      Capture Snapshot
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Snapshots</CardDescription>
            <CardTitle className="text-3xl">{archives.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {limits.maxSnapshots === Number.POSITIVE_INFINITY
                ? "Unlimited"
                : `${usageStats.totalCapturesEver} / ${limits.maxSnapshots} lifetime captures used`}
            </div>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: `${Math.min(usagePercent, 100)}%` }} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Unique Wallets</CardDescription>
            <CardTitle className="text-3xl">{new Set(archives.map((a) => a.walletAddress)).size}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">Across {uniqueChains.length} chains</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Scheduled Captures</CardDescription>
            <CardTitle className="text-3xl">{archives.filter((a) => a.scheduleInterval).length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">Monthly auto-captures enabled</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Current Plan</CardDescription>
            <CardTitle className="text-3xl capitalize">{user.plan}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="link" className="p-0 h-auto text-xs" onClick={() => router.push("/#pricing")}>
              {user.plan === "enterprise" ? "Contact support" : "Upgrade plan"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by wallet, URL, chain, or client..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={filterChain} onValueChange={setFilterChain}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="All Chains" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Chains</SelectItem>
              {uniqueChains.map((chain) => (
                <SelectItem key={chain} value={chain}>
                  {chain}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterClient} onValueChange={setFilterClient}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="All Clients" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              {uniqueClients.map((client) => (
                <SelectItem key={client} value={client}>
                  {client}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2">
            <Label className="text-sm text-muted-foreground whitespace-nowrap">Group by:</Label>
            <Select value={groupBy} onValueChange={(v) => setGroupBy(v as typeof groupBy)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Grouping</SelectItem>
                <SelectItem value="client">Client</SelectItem>
                <SelectItem value="chain">Chain</SelectItem>
                <SelectItem value="wallet">Wallet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" className="gap-2 bg-transparent" onClick={exportToJSON}>
            <Download className="h-4 w-4" />
            Export JSON
          </Button>
        </div>
      </div>

      {Object.entries(groupedArchives()).map(([groupName, groupArchives]) => (
        <Collapsible key={groupName} defaultOpen className="mb-6">
          {groupBy !== "none" && (
            <CollapsibleTrigger className="flex items-center gap-2 w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors mb-4">
              <ChevronDown className="h-4 w-4 transition-transform [[data-state=closed]_&]:-rotate-90" />
              <span className="font-medium">{groupName}</span>
              <Badge variant="secondary" className="ml-auto">
                {groupArchives.length}
              </Badge>
            </CollapsibleTrigger>
          )}
          <CollapsibleContent>
            {groupArchives.length === 0 ? (
              <Card className="p-12 text-center">
                <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold mb-2">No snapshots yet</h3>
                <p className="text-muted-foreground mb-4">Capture your first blockchain explorer snapshot</p>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {groupArchives.map((archive) => (
                  <Card key={archive.id} className="group hover:border-primary/50 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-primary">
                              {archive.chain.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <CardTitle className="text-sm truncate">{archive.explorer}</CardTitle>
                            <CardDescription className="text-xs truncate">{archive.chain}</CardDescription>
                          </div>
                        </div>
                        {getCaptureStatusBadge(archive)}
                      </div>
                      {archive.clientName && (
                        <Badge variant="outline" className="mt-2 text-xs w-fit">
                          <Users className="w-3 h-3 mr-1" />
                          {archive.clientName}
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Wallet Address</p>
                        <code className="text-xs font-mono bg-muted px-2 py-1 rounded block truncate">
                          {archive.walletAddress}
                        </code>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{format(new Date(archive.snapshotDate), "MMM d, yyyy")}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{formatDistanceToNow(new Date(archive.archivedAt), { addSuffix: true })}</span>
                        </div>
                      </div>
                      {archive.scheduleInterval && (
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          Monthly capture
                        </Badge>
                      )}
                      {archive.captureStatus === "completed" && (
                        <div className="flex gap-2">
                          {archive.screenshotUrl && (
                            <Badge variant="outline" className="text-xs">
                              <ImageIcon className="w-3 h-3 mr-1" />
                              Screenshot
                            </Badge>
                          )}
                          {archive.htmlUrl && (
                            <Badge variant="outline" className="text-xs">
                              <FileCode className="w-3 h-3 mr-1" />
                              HTML
                            </Badge>
                          )}
                        </div>
                      )}
                      {archive.captureStatus === "failed" && archive.captureError && (
                        <p className="text-xs text-red-500 truncate" title={archive.captureError}>
                          {archive.captureError}
                        </p>
                      )}
                      <div className="flex gap-2 pt-2">
                        {archive.captureStatus === "completed" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-transparent"
                            onClick={() => router.push(`/dashboard/archive/${archive.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        ) : archive.captureStatus === "failed" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-transparent"
                            onClick={() => handleRetryCapture(archive)}
                          >
                            <Camera className="h-4 w-4 mr-1" />
                            Retry
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" className="flex-1 bg-transparent" disabled>
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            Capturing
                          </Button>
                        )}
                        <Button variant="outline" size="sm" asChild>
                          <a href={archive.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteArchive(archive.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  )
}
