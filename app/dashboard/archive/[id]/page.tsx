"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCurrentUser } from "@/app/actions/auth"
import { getArchives, type Archive } from "@/lib/archives"
import {
  ArrowLeft,
  ExternalLink,
  Calendar,
  Clock,
  Copy,
  CheckCircle2,
  Wallet,
  Shield,
  FileText,
  ImageIcon,
  FileCode,
  AlertCircle,
  Maximize2,
  Download,
} from "lucide-react"
import { format } from "date-fns"

export default function ArchiveViewerPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const [archive, setArchive] = useState<Archive | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("screenshot")
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const loadArchive = async () => {
      const user = await getCurrentUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      const archives = getArchives(user.id)
      const found = archives.find((a) => a.id === id)

      if (!found) {
        router.push("/dashboard")
        return
      }

      setArchive(found)
      if (found.screenshotUrl) {
        setActiveTab("screenshot")
      } else if (found.htmlUrl) {
        setActiveTab("html")
      }
      setIsLoading(false)
    }
    loadArchive()
  }, [id, router])

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadScreenshot = () => {
    if (archive?.screenshotUrl) {
      const link = document.createElement("a")
      link.href = archive.screenshotUrl
      link.download = `chainship-${archive.id.slice(0, 8)}-${format(new Date(archive.archivedAt), "yyyy-MM-dd")}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleDownloadHtml = () => {
    if (archive?.htmlUrl) {
      const link = document.createElement("a")
      link.href = archive.htmlUrl
      link.download = `chainship-${archive.id.slice(0, 8)}-${format(new Date(archive.archivedAt), "yyyy-MM-dd")}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Skeleton className="h-8 w-48 mb-8" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    )
  }

  if (!archive) return null

  const hasScreenshot = !!archive.screenshotUrl
  const hasHtml = !!archive.htmlUrl
  const hasContent = hasScreenshot || hasHtml

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <div className="flex gap-2">
          {hasScreenshot && (
            <Button variant="outline" onClick={handleDownloadScreenshot}>
              <ImageIcon className="mr-2 h-4 w-4" />
              Download Screenshot
            </Button>
          )}
          {hasHtml && (
            <Button variant="outline" onClick={handleDownloadHtml}>
              <FileCode className="mr-2 h-4 w-4" />
              Download HTML
            </Button>
          )}
          <Button variant="outline" asChild>
            <a href={archive.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              View Original
            </a>
          </Button>
        </div>
      </div>

      {/* Proof Banner */}
      <Card className="mb-6 border-green-500/30 bg-green-500/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-green-500/10">
              <Shield className="h-5 w-5 text-green-500" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-green-600">Verified Snapshot</p>
              <p className="text-sm text-muted-foreground">
                Captured on {format(new Date(archive.archivedAt), "MMMM d, yyyy 'at' h:mm:ss a z")}
              </p>
            </div>
            <Badge variant="outline" className="border-green-500/30 text-green-600">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Authenticated
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Snapshot Metadata */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Snapshot Details</CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline">{archive.chain}</Badge>
              <Badge variant="secondary">{archive.explorer}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Wallet className="h-3 w-3" /> Wallet Address
              </p>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono bg-muted px-2 py-1 rounded truncate max-w-[180px]">
                  {archive.walletAddress}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={() => handleCopy(archive.walletAddress)}
                >
                  {copied ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Accounting Period
              </p>
              <p className="text-sm font-medium">{format(new Date(archive.snapshotDate), "MMMM d, yyyy")}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> Capture Time
              </p>
              <p className="text-sm font-medium">{format(new Date(archive.archivedAt), "h:mm:ss a")}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <FileText className="h-3 w-3" /> Source URL
              </p>
              <a
                href={archive.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline truncate block max-w-[200px]"
              >
                {archive.url}
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Captured Content */}
      {hasContent ? (
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Captured Content</CardTitle>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="screenshot" className="gap-2" disabled={!hasScreenshot}>
                    <ImageIcon className="h-4 w-4" />
                    Screenshot
                    {!hasScreenshot && <span className="text-xs opacity-50">(N/A)</span>}
                  </TabsTrigger>
                  <TabsTrigger value="html" className="gap-2" disabled={!hasHtml}>
                    <FileCode className="h-4 w-4" />
                    HTML Archive
                    {!hasHtml && <span className="text-xs opacity-50">(N/A)</span>}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {activeTab === "screenshot" && hasScreenshot && (
              <div className="relative">
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  <Button variant="secondary" size="sm" onClick={handleDownloadScreenshot}>
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setIsFullscreen(true)}>
                    <Maximize2 className="h-4 w-4 mr-1" />
                    Fullscreen
                  </Button>
                </div>
                <div className="overflow-auto max-h-[800px] bg-muted/30">
                  <Image
                    src={archive.screenshotUrl! || "/placeholder.svg"}
                    alt={`Screenshot of ${archive.explorer} for wallet ${archive.walletAddress}`}
                    width={1920}
                    height={4000}
                    className="w-full h-auto"
                    unoptimized
                  />
                </div>
              </div>
            )}
            {activeTab === "screenshot" && !hasScreenshot && (
              <div className="p-12 text-center">
                <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Screenshot not available for this archive.</p>
                {hasHtml && (
                  <Button variant="outline" className="mt-4 bg-transparent" onClick={() => setActiveTab("html")}>
                    View HTML Archive Instead
                  </Button>
                )}
              </div>
            )}
            {activeTab === "html" && hasHtml && (
              <div className="relative">
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  <Button variant="secondary" size="sm" onClick={handleDownloadHtml}>
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => window.open(archive.htmlUrl!, "_blank")}>
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Open in New Tab
                  </Button>
                </div>
                <iframe
                  src={archive.htmlUrl}
                  className="w-full h-[800px] border-0"
                  title={`Archived HTML of ${archive.explorer}`}
                  sandbox="allow-same-origin allow-scripts"
                />
              </div>
            )}
            {activeTab === "html" && !hasHtml && (
              <div className="p-12 text-center">
                <FileCode className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">HTML archive not available.</p>
                <p className="text-xs text-muted-foreground">
                  This explorer uses client-side rendering, so only screenshot capture is supported.
                </p>
                {hasScreenshot && (
                  <Button variant="outline" className="mt-4 bg-transparent" onClick={() => setActiveTab("screenshot")}>
                    View Screenshot Instead
                  </Button>
                )}
              </div>
            )}

            {/* Proof Footer */}
            <div className="p-4 bg-muted/30 border-t">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span>Snapshot ID: {archive.id.slice(0, 8)}</span>
                  {archive.proofHash && (
                    <>
                      <span>•</span>
                      <span className="font-mono">SHA-256: {archive.proofHash.slice(0, 32)}...</span>
                    </>
                  )}
                </div>
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  ChainShip Verified
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="p-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
          <h3 className="text-lg font-medium mb-2">Capture Not Complete</h3>
          <p className="text-muted-foreground mb-4">
            {archive.captureStatus === "failed"
              ? `The capture failed: ${archive.captureError || "Unknown error"}`
              : "The snapshot is still being captured. Please check back later."}
          </p>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </Card>
      )}

      {/* Fullscreen Modal */}
      {isFullscreen && hasScreenshot && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setIsFullscreen(false)}
        >
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-4 right-4"
            onClick={() => setIsFullscreen(false)}
          >
            Close
          </Button>
          <Image
            src={archive.screenshotUrl! || "/placeholder.svg"}
            alt={`Screenshot of ${archive.explorer}`}
            width={1920}
            height={4000}
            className="max-w-full max-h-full object-contain"
            unoptimized
          />
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground text-center mt-6">
        This snapshot represents the wallet balance as displayed on {archive.explorer} at the time of capture. The
        original source URL, captured content, and cryptographic hash are preserved for audit purposes.
      </p>
    </div>
  )
}
