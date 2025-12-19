"use client"

import { useCallback, useState } from "react"
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type OnConnect,
  BackgroundVariant,
} from "reactflow"
import "reactflow/dist/style.css"
import { Button } from "@/components/ui/button"
import { Lightbulb, Share2, PlusCircle, Copy, X } from "lucide-react"

// --- Initial Data with Updated "Stark" Theme Colors ---
const initialNodes: Node[] = [
  {
    id: "1",
    type: "input",
    position: { x: 50, y: 50 },
    data: { label: "Core Idea: Fluid Creativity" },
    style: {
      background: "hsl(var(--primary))",
      color: "hsl(var(--primary-foreground))",
      border: "none",
      borderRadius: "8px",
      padding: "10px 15px",
      fontSize: "1.1em",
    },
  },
  {
    id: "2",
    position: { x: 50, y: 200 },
    data: { label: "Visual Design System" },
    style: {
      background: "hsl(var(--card))",
      color: "hsl(var(--card-foreground))",
      border: "1px solid hsl(var(--border))",
      borderRadius: "8px",
      padding: "10px",
    },
  },
  {
    id: "3",
    position: { x: 300, y: 120 },
    data: { label: "Interactive 3D Background" },
    style: {
      background: "hsl(var(--card))",
      color: "hsl(var(--card-foreground))",
      border: "1px solid hsl(var(--border))",
      borderRadius: "8px",
      padding: "10px",
    },
  },
  {
    id: "4",
    position: { x: 300, y: 280 },
    data: { label: "Blog Merging Feature" },
    style: {
      background: "hsl(var(--card))",
      color: "hsl(var(--card-foreground))",
      border: "1px solid hsl(var(--border))",
      borderRadius: "8px",
      padding: "10px",
    },
  },
  {
    id: "5",
    type: "output",
    position: { x: 550, y: 200 },
    data: { label: "Creative Flow Studio" },
    style: {
      background: "hsl(var(--accent))",
      color: "hsl(var(--accent-foreground))",
      border: "none",
      borderRadius: "8px",
      padding: "10px 15px",
      fontSize: "1.1em",
    },
  },
  {
    id: "6",
    position: { x: 150, y: 380 },
    data: { label: "Generative Art Module" },
    style: {
      background: "hsl(var(--secondary))",
      color: "hsl(var(--secondary-foreground))",
      borderRadius: "8px",
      padding: "10px",
    },
  },
]

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", animated: true, style: { stroke: "hsl(var(--primary))" } },
  { id: "e1-3", source: "1", target: "3", animated: true, style: { stroke: "hsl(var(--primary))" } },
  { id: "e2-5", source: "2", target: "5", type: "smoothstep", style: { stroke: "hsl(var(--border))" } },
  { id: "e3-5", source: "3", target: "5", type: "smoothstep", style: { stroke: "hsl(var(--border))" } },
  { id: "e4-5", source: "4", target: "5", type: "smoothstep", style: { stroke: "hsl(var(--border))" } },
  { id: "e1-4", source: "1", target: "4", animated: true, style: { stroke: "hsl(var(--primary))" } },
  {
    id: "e4-6",
    source: "4",
    target: "6",
    type: "step",
    animated: true,
    style: { stroke: "hsl(var(--secondary))" },
  },
  { id: "e6-5", source: "6", target: "5", type: "smoothstep", style: { stroke: "hsl(var(--secondary))" } },
]

// --- Share Modal Component ---
const ShareModal = ({ onClose }: { onClose: () => void }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
        className="bg-popover border border-border rounded-lg shadow-2xl p-6 w-full max-w-sm transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 id="share-modal-title" className="text-popover-foreground font-semibold">
            Share Your Flow
          </h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-muted">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Share this creative map with your team or the world.</p>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={window.location.href}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground"
            />
            <Button onClick={handleCopy} size="sm" className="shrink-0">
              <Copy className="w-4 h-4 mr-2" />
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// --- Main Showcase Page Component ---
export default function ShowcasePage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

  const onConnect: OnConnect = useCallback(
    (params) =>
      setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: "hsl(var(--primary))" } }, eds)),
    [setEdges],
  )

  const onSparkInspiration = () => {
    const newNode: Node = {
      id: `spark-${nodes.length + 1}`,
      position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
      data: { label: "Your New Big Idea" },
      style: {
        background: "hsl(var(--card))",
        color: "hsl(var(--card-foreground))",
        borderRadius: "8px",
        padding: "10px",
        border: "1px solid hsl(var(--accent))",
      },
    }
    setNodes((nds) => nds.concat(newNode))
  }

  return (
    <div className="relative min-h-screen text-foreground">
      <main className="relative z-10 container mx-auto px-4 py-12 sm:py-16">
        <div className="text-center mb-10 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg text-foreground">
            The Cartographer's Compass: <span className="text-primary">Mapping Innovation</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Visualize the invisible threads of creation. Chart complex relationships, connect disparate concepts, and
            illuminate the pathways to breakthrough.
          </p>
        </div>

        <div className="h-[500px] sm:h-[600px] md:h-[700px] rounded-xl shadow-2xl overflow-hidden border bg-card/85 backdrop-blur-sm relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            attributionPosition="bottom-left"
            className="react-flow-stark-theme"
          >
            <MiniMap nodeColor={(node) => (node.style?.background as string) || "#333"} nodeStrokeWidth={3} />
            <Controls />
            <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="hsl(var(--muted))" />
          </ReactFlow>
        </div>

        <div className="mt-10 sm:mt-12 text-center space-y-6">
          <p className="text-muted-foreground text-md">
            Drag nodes, zoom in/out, and connect ideas to build your own creative constellation.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button onClick={onSparkInspiration} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Lightbulb className="w-5 h-5 mr-2" /> Spark Inspiration
            </Button>
            <Button
              onClick={() => setIsShareModalOpen(true)}
              variant="outline"
              className="border-secondary text-secondary hover:bg-secondary/20 hover:text-foreground"
            >
              <Share2 className="w-5 h-5 mr-2" /> Share Your Flow Map
            </Button>
            <Button
              onClick={() =>
                onNodesChange([
                  {
                    type: "add",
                    item: {
                      id: `new-${nodes.length + 1}`,
                      position: { x: Math.random() * 400, y: Math.random() * 400 },
                      data: { label: "New Idea" },
                      style: {
                        background: "hsl(var(--card))",
                        color: "hsl(var(--card-foreground))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        padding: "10px",
                      },
                    },
                  },
                ])
              }
              variant="outline"
              className="border text-muted-foreground hover:bg-muted"
            >
              <PlusCircle className="w-5 h-5 mr-2" /> Add New Idea Node
            </Button>
          </div>
        </div>
      </main>
      {isShareModalOpen && <ShareModal onClose={() => setIsShareModalOpen(false)} />}
    </div>
  )
}
