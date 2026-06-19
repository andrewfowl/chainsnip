"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { getCurrentUser } from "@/app/actions/auth"
import type { User } from "@/lib/auth"
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
  groupArchivesByPortfolio,
  type Archive,
  type CustomExplorer,
  type Portfolio,
  getUserUsageStats,
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
  ChevronDown,
  ChevronRight,
  Wallet,
  FolderOpen,
  MoreHorizontal,
  RefreshCw,
  Pause,
  XCircle,
  History,
  CalendarClock,
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
  const [filterStatus, setFilterStatus] = useState<string>("all")
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
  const [expandedPortfolios, setExpandedPortfolios] = useState<Set<string>>(new Set())
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
          router.push("/auth/login")
          return
        }
        setUser(currentUser)
        const userArchives = await getArchives(currentUser.id)
        setArchives(userArchives)
        const userExplorers = await getCustomExplorers(currentUser.id)
        setCustomExplorers(userExplorers)
        setIsLoading(false)
        setNewArchiveSnapshotDate(format(new Date(), "yyyy-MM-dd"))
        
        // Expand first portfolio by default if there are archives
        if (userArchives.length > 0) {
          const portfolios = groupArchivesByPortfolio(userArchives)
          if (portfolios.length > 0) {
            setExpandedPortfolios(new Set([portfolios[0].name]))
          }
        }
      } catch (error) {
        console.error("Dashboard load error:", error)
        setIsLoading(false)
      }
    }
    loadUser()
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

    const usageStats = await getUserUsageStats(user.id)
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

    const allExplorers = await getAllExplorers(user.id)
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

      const newArchive = await saveArchive({
        userId: user.id,
        url: newArchiveUrl,
        title,
        content: `Archived explorer snapshot from ${newArchiveUrl}`,
        snapshotDate: getMonthEndDate().toISOString(),
        scheduleInterval: enableMonthlyCapture ? "monthly" : null,
        clientName: newArchiveClient || undefined,
      })

      setArchives([newArchive, ...archives])
      setCaptureProgress("Capturing screenshot and HTML...")

      const captureResponse = await fetch("/api/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: newArchiveUrl,
          archiveId: newArchive.id,
          userId: user.id,
        }),
      })

      const captureResult = await captureResponse.json()

      if (captureResponse.ok && captureResult.success) {
        updateArchive(newArchive.id, {
          screenshotUrl: captureResult.screenshotUrl,
          htmlUrl: captureResult.htmlUrl,
          proofHash: captureResult.proofHash,
          captureStatus: "completed",
        })

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
          description: `Successfully captured snapshot from ${url.hostname}`,
        })
        
        // Expand the portfolio this was added to
        const portfolioName = newArchiveClient || "Uncategorized"
        setExpandedPortfolios(prev => new Set([...prev, portfolioName]))
      } else {
        updateArchive(newArchive.id, {
          captureStatus: "failed",
          captureError: captureResult.error || "Capture failed",
        })

        setArchives((prev) =>
          prev.map((a) =>
            a.id === newArchive.id
              ? {
                  ...a,
                  captureStatus: "failed" as const,
                  captureError: captureResult.error || "Capture failed",
                }
              : a,
          ),
        )

        toast({
          title: "Capture Failed",
          description: captureResult.error || "Could not capture the page. You can retry later.",
          variant: "destructive",
        })
      }

      setNewArchiveUrl("")
      setEnableMonthlyCapture(false)
      setIsDialogOpen(false)
      setNewArchiveClient("")
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

  const handleDeleteArchive = async (id: string, keepHistory: boolean = false) => {
    if (!keepHistory) {
      // Actual delete
      await deleteArchive(id)
      setArchives(archives.filter((a) => a.id !== id))
      toast({ title: "Deleted", description: "Snapshot deleted successfully." })
    } else {
      // Mark as discontinued but keep history
      await updateArchive(id, { scheduleInterval: null, status: "pending" })
      setArchives(prev => prev.map(a => 
        a.id === id ? { ...a, scheduleInterval: undefined, status: "pending" as const } : a
      ))
      toast({ title: "Wallet Discontinued", description: "Future captures stopped. Historical data preserved." })
    }
    setDeleteConfirmId(null)
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
          userId: archive.userId,
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
          captureError: captureResult.error || "Capture failed",
        })

        setArchives((prev) =>
          prev.map((a) =>
            a.id === archive.id ? { ...a, captureStatus: "failed" as const, captureError: captureResult.error || "Capture failed" } : a,
          ),
        )

        toast({ title: "Failed", description: captureResult.error || "Capture failed", variant: "destructive" })
      }
    } catch (error) {
      updateArchive(archive.id, {
        captureStatus: "failed",
        captureError: "Network error",
      })

      setArchives((prev) =>
        prev.map((a) =>
          a.id === archive.id ? { ...a, captureStatus: "failed" as const, captureError: "Network error" } : a,
        ),
      )

      toast({ title: "Error", description: "Network error occurred", variant: "destructive" })
    }
  }

  const handleCancelCapture = async (archive: Archive) => {
    // Mark as failed/cancelled
    await updateArchive(archive.id, { captureStatus: "failed", captureError: "Cancelled by user" })
    setArchives(prev => prev.map(a => 
      a.id === archive.id ? { ...a, captureStatus: "failed" as const, captureError: "Cancelled by user" } : a
    ))
    toast({ title: "Cancelled", description: "Capture job cancelled." })
  }

  const handleAddCustomExplorer = async () => {
    if (!newCustomExplorer.name || !newCustomExplorer.domain) {
      toast({
        title: "Missing Fields",
        description: "Please provide a name and domain.",
        variant: "destructive",
      })
      return
    }

    const domain = newCustomExplorer.domain
      .replace(/^https?:\/\//, "")
      .replace(/\/.*$/, "")
      .toLowerCase()

    const explorer = await saveCustomExplorer({ userId: user!.id, name: newCustomExplorer.name, domain })
    setCustomExplorers([...customExplorers, explorer])
    setNewCustomExplorer({ name: "", domain: "" })
    setIsCustomExplorerDialogOpen(false)
    toast({
      title: "Explorer Added",
      description: `${newCustomExplorer.name} has been added.`,
    })

    if (pendingExplorerUrl) {
      setNewArchiveUrl(pendingExplorerUrl)
      setPendingExplorerUrl(null)
      setIsDialogOpen(true)
    }
  }

  const exportToJSON = () => {
    const data = filteredArchives.map((a) => ({
      client: a.clientName || "Uncategorized",
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
    link.download = `chainsnip-export-${format(new Date(), "yyyy-MM-dd")}.json`
    link.click()
    URL.revokeObjectURL(link.href)

    toast({ title: "Export Complete", description: `Exported ${data.length} snapshots to JSON` })
  }

  const togglePortfolio = (name: string) => {
    setExpandedPortfolios(prev => {
      const next = new Set(prev)
      if (next.has(name)) {
        next.delete(name)
      } else {
        next.add(name)
      }
      return next
    })
  }

  // Filter archives
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
    
    const matchesStatus = filterStatus === "all" || archive.captureStatus === filterStatus

    return matchesSearch && matchesStatus
  })

  // Group by portfolio
  const portfolios = groupArchivesByPortfolio(filteredArchives)
  
  // Compute stats
  const totalWallets = new Set(archives.map(a => `${a.walletAddress}-${a.chain}`)).size
  const totalPortfolios = new Set(archives.map(a => a.clientName || "Uncategorized")).size
  const scheduledCount = archives.filter(a => a.scheduleInterval).length
  const capturingCount = archives.filter(a => a.captureStatus === "capturing").length
  const failedCount = archives.filter(a => a.captureStatus === "failed").length

  if (isLoading) {
    return null // loading.tsx handles this
  }

  if (!user) return null

  const limits = PLAN_LIMITS[user.plan]

  // Empty state
  if (archives.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Wallet Portfolios</h1>
            <p className="text-sm text-muted-foreground">Track and capture blockchain wallet balances</p>
          </div>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <Wallet className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Capture your first wallet snapshot</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Start tracking wallet balances by capturing snapshots from blockchain explorers. 
              Organize wallets by client or entity for easy reporting.
            </p>
            
            <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
              <p className="text-xs font-medium text-muted-foreground mb-3">How it works:</p>
              <ol className="text-sm space-y-2">
                <li className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium shrink-0">1</span>
                  <span>Paste a blockchain explorer URL showing a wallet address</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium shrink-0">2</span>
                  <span>Assign to a client/portfolio for organization</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium shrink-0">3</span>
                  <span>We capture a timestamped screenshot with proof hash</span>
                </li>
              </ol>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg">
                  <Camera className="mr-2 h-4 w-4" />
                  Capture First Snapshot
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
                            <span className="text-amber-600">Unknown explorer</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client">Portfolio / Client Name</Label>
                    <Input
                      id="client"
                      placeholder="e.g., Acme Corp, Client ABC..."
                      value={newArchiveClient}
                      onChange={(e) => setNewArchiveClient(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Group snapshots by client for easier reporting</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="snapshot-date">Snapshot Date</Label>
                    <Input
                      id="snapshot-date"
                      type="date"
                      value={newArchiveSnapshotDate}
                      onChange={(e) => setNewArchiveSnapshotDate(e.target.value)}
                    />
                  </div>
                  <div className={cn(
                    "flex items-center justify-between rounded-lg border p-4",
                    !limits.monthlyAutoSave && "opacity-60"
                  )}>
                    <div className="space-y-0.5">
                      <Label className={!limits.monthlyAutoSave ? "text-muted-foreground" : ""}>
                        Auto Month-End Capture
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {limits.monthlyAutoSave 
                          ? "Automatically capture on the last day of each month"
                          : (
                            <>
                              <Link href="/#pricing" className="text-amber-600 underline underline-offset-2 hover:text-amber-700">
                                Upgrade to Professional
                              </Link>
                              {" to enable scheduled captures"}
                            </>
                          )
                        }
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!limits.monthlyAutoSave && (
                        <Link href="/#pricing">
                          <Badge variant="outline" className="text-xs text-amber-600 border-amber-300 bg-amber-50 cursor-pointer hover:bg-amber-100">
                            Pro
                          </Badge>
                        </Link>
                      )}
                      <Switch
                        checked={enableMonthlyCapture}
                        onCheckedChange={setEnableMonthlyCapture}
                        disabled={!limits.monthlyAutoSave}
                      />
                    </div>
                  </div>
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
                        Capture
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Wallet Portfolios</h1>
          <p className="text-sm text-muted-foreground">Track and capture blockchain wallet balances</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/historical-balance")}>
            <History className="mr-2 h-4 w-4" />
            Historical Balances
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Snapshot
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
                  <Label htmlFor="client">Portfolio / Client Name</Label>
                  <Select value={newArchiveClient} onValueChange={setNewArchiveClient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select or type new..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Uncategorized</SelectItem>
                      {[...new Set(archives.map(a => a.clientName).filter(Boolean))].map((client) => (
                        <SelectItem key={client} value={client!}>
                          {client}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Or enter new portfolio name..."
                    value={newArchiveClient}
                    onChange={(e) => setNewArchiveClient(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="snapshot-date">Snapshot Date</Label>
                  <Input
                    id="snapshot-date"
                    type="date"
                    value={newArchiveSnapshotDate}
                    onChange={(e) => setNewArchiveSnapshotDate(e.target.value)}
                  />
                </div>
                <div className={cn(
                  "flex items-center justify-between rounded-lg border p-4",
                  !limits.monthlyAutoSave && "opacity-60"
                )}>
                  <div className="space-y-0.5">
                    <Label className={!limits.monthlyAutoSave ? "text-muted-foreground" : ""}>
                      Auto Month-End Capture
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {limits.monthlyAutoSave 
                        ? "Automatically capture on the last day of each month"
                        : (
                          <>
                            <Link href="/#pricing" className="text-amber-600 underline underline-offset-2 hover:text-amber-700">
                              Upgrade to Professional
                            </Link>
                            {" to enable scheduled captures"}
                          </>
                        )
                      }
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!limits.monthlyAutoSave && (
                      <Link href="/#pricing">
                        <Badge variant="outline" className="text-xs text-amber-600 border-amber-300 bg-amber-50 cursor-pointer hover:bg-amber-100">
                          Pro
                        </Badge>
                      </Link>
                    )}
                    <Switch
                      checked={enableMonthlyCapture}
                      onCheckedChange={setEnableMonthlyCapture}
                      disabled={!limits.monthlyAutoSave}
                    />
                  </div>
                </div>
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
                      Capture
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center gap-6 py-3 px-4 bg-muted/30 rounded-lg mb-6 text-sm overflow-x-auto">
        <div className="flex items-center gap-2 whitespace-nowrap">
          <Wallet className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{totalWallets}</span>
          <span className="text-muted-foreground">Wallets</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-2 whitespace-nowrap">
          <FolderOpen className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{totalPortfolios}</span>
          <span className="text-muted-foreground">Portfolios</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-2 whitespace-nowrap">
          <CalendarClock className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{scheduledCount}</span>
          <span className="text-muted-foreground">Scheduled</span>
        </div>
        {capturingCount > 0 && (
          <>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2 whitespace-nowrap text-blue-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="font-medium">{capturingCount}</span>
              <span>Capturing</span>
            </div>
          </>
        )}
        {failedCount > 0 && (
          <>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2 whitespace-nowrap text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">{failedCount}</span>
              <span>Failed</span>
            </div>
          </>
        )}
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={exportToJSON}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Dialog open={isCustomExplorerDialogOpen} onOpenChange={setIsCustomExplorerDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings2 className="h-4 w-4 mr-1" />
                Explorers
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Custom Explorers</DialogTitle>
                <DialogDescription>
                  Add blockchain explorers that are not in our default list.
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
                    placeholder="e.g., explorer.mychain.io"
                    value={newCustomExplorer.domain}
                    onChange={(e) => {
                      let value = e.target.value
                      if (value.includes("://")) {
                        try {
                          const url = new URL(value)
                          value = url.hostname
                        } catch {
                          // Keep original
                        }
                      }
                      setNewCustomExplorer({ ...newCustomExplorer, domain: value })
                    }}
                  />
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
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search wallets, chains, or portfolios..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="capturing">Capturing</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active Jobs Section */}
      {capturingCount > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Active Captures</h2>
          <div className="space-y-2">
            {archives.filter(a => a.captureStatus === "capturing").map(archive => (
              <div key={archive.id} className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <div>
                    <p className="text-sm font-medium truncate max-w-[300px]">
                      {archive.walletAddress !== "Unknown wallet" 
                        ? `${archive.walletAddress.slice(0, 8)}...${archive.walletAddress.slice(-6)}`
                        : archive.explorer}
                    </p>
                    <p className="text-xs text-muted-foreground">{archive.chain} - {archive.clientName || "Uncategorized"}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleCancelCapture(archive)}>
                  <XCircle className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Portfolio Sections */}
      <div className="space-y-4">
        {portfolios.map((portfolio) => (
          <Collapsible 
            key={portfolio.name} 
            open={expandedPortfolios.has(portfolio.name)}
            onOpenChange={() => togglePortfolio(portfolio.name)}
          >
            <div className="border rounded-lg">
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  {expandedPortfolios.has(portfolio.name) ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <FolderOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{portfolio.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {portfolio.wallets.length} wallet{portfolio.wallets.length !== 1 ? "s" : ""}
                  </Badge>
                  {portfolio.scheduledCount > 0 && (
                    <Badge variant="outline" className="text-xs">
                      <CalendarClock className="h-3 w-3 mr-1" />
                      {portfolio.scheduledCount} scheduled
                    </Badge>
                  )}
                  {portfolio.activeCaptures > 0 && (
                    <Badge variant="outline" className="text-xs text-blue-600 border-blue-600/30">
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      {portfolio.activeCaptures} capturing
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{portfolio.totalCaptures} snapshots</span>
                  <span>Last: {formatDistanceToNow(new Date(portfolio.lastActivity), { addSuffix: true })}</span>
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div className="border-t">
                  <div className="divide-y">
                    {archives
                      .filter(a => (a.clientName || "Uncategorized") === portfolio.name)
                      .filter(a => filteredArchives.includes(a))
                      .map((archive) => (
                        <div 
                          key={archive.id} 
                          className={`flex items-center justify-between p-4 hover:bg-muted/30 transition-colors ${
                            archive.captureStatus === "failed" ? "border-l-2 border-l-red-500" :
                            archive.captureStatus === "capturing" ? "border-l-2 border-l-blue-500" :
                            archive.scheduleInterval ? "border-l-2 border-l-amber-500" :
                            archive.captureStatus === "completed" ? "border-l-2 border-l-green-500" :
                            ""
                          }`}
                        >
                          <div className="flex items-center gap-4 min-w-0 flex-1">
                            <div className="w-8 h-8 rounded bg-muted flex items-center justify-center shrink-0">
                              <span className="text-[10px] font-bold text-muted-foreground">
                                {archive.chain.slice(0, 2).toUpperCase()}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <code className="text-sm font-mono truncate max-w-[200px]">
                                  {archive.walletAddress !== "Unknown wallet" 
                                    ? `${archive.walletAddress.slice(0, 10)}...${archive.walletAddress.slice(-8)}`
                                    : "Unknown wallet"}
                                </code>
                                {archive.captureStatus === "completed" && (
                                  <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />
                                )}
                                {archive.captureStatus === "capturing" && (
                                  <Loader2 className="h-3 w-3 text-blue-500 animate-spin shrink-0" />
                                )}
                                {archive.captureStatus === "failed" && (
                                  <AlertCircle className="h-3 w-3 text-red-500 shrink-0" />
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                <span>{archive.chain}</span>
                                <span>-</span>
                                <span>{archive.explorer}</span>
                                {archive.scheduleInterval && (
                                  <>
                                    <span>-</span>
                                    <span className="text-amber-600">Monthly capture</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 shrink-0">
                            <div className="text-right text-xs text-muted-foreground hidden sm:block">
                              <p>{format(new Date(archive.snapshotDate), "MMM d, yyyy")}</p>
                              <p className="text-[10px]">Added {formatDistanceToNow(new Date(archive.archivedAt), { addSuffix: true })}</p>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              {archive.captureStatus === "completed" && (
                                <>
                                  {archive.screenshotUrl && (
                                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                      <a href={archive.screenshotUrl} target="_blank" rel="noopener noreferrer" title="View Screenshot">
                                        <ImageIcon className="h-4 w-4" />
                                      </a>
                                    </Button>
                                  )}
                                  {archive.htmlUrl && (
                                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                      <a href={archive.htmlUrl} target="_blank" rel="noopener noreferrer" title="View HTML Archive">
                                        <FileCode className="h-4 w-4" />
                                      </a>
                                    </Button>
                                  )}
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8"
                                    onClick={() => router.push(`/dashboard/archive/${archive.id}`)}
                                    title="View Details"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              {archive.captureStatus === "failed" && (
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-amber-600"
                                  onClick={() => handleRetryCapture(archive)}
                                  title="Retry Capture"
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                              )}
                              {archive.captureStatus === "capturing" && (
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={() => handleCancelCapture(archive)}
                                  title="Cancel"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              )}
                              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                <a href={archive.url} target="_blank" rel="noopener noreferrer" title="Open Explorer">
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleRetryCapture(archive)}>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Recapture Now
                                  </DropdownMenuItem>
                                  {archive.scheduleInterval && (
                                    <DropdownMenuItem onClick={() => handleDeleteArchive(archive.id, true)}>
                                      <Pause className="h-4 w-4 mr-2" />
                                      Stop Scheduled Captures
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => setDeleteConfirmId(archive.id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Snapshot
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Snapshot</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this snapshot? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => deleteConfirmId && handleDeleteArchive(deleteConfirmId, true)}
            >
              <Pause className="h-4 w-4 mr-2" />
              Keep history, stop future captures
              <span className="ml-auto text-xs text-muted-foreground">Recommended</span>
            </Button>
            <Button 
              variant="destructive" 
              className="w-full justify-start"
              onClick={() => deleteConfirmId && handleDeleteArchive(deleteConfirmId, false)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete permanently
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
