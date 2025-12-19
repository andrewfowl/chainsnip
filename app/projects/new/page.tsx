"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Maximize2, X, Rocket } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProjectAsset {
  id: string
  title: string
  description: string
  imageUrl: string
  category: string
  aspectRatio: string
}

// Enhanced project ideas with refined descriptions and proper image paths
const projectIdeas: ProjectAsset[] = [
  {
    id: "proj1",
    title: "Abstract Data Visualization",
    description:
      "Transform complex datasets into elegant, flowing visuals that reveal hidden patterns and insights with stunning clarity.",
    imageUrl: "/generated/abstract-data-flow.png",
    category: "Data Art",
    aspectRatio: "aspect-[3/4]",
  },
  {
    id: "proj2",
    title: "Interactive Particle Nebula",
    description:
      "Create a responsive cosmic system where particles react to user gestures and audio input, forming ever-changing celestial patterns.",
    imageUrl: "/generated/interactive-nebula.png",
    category: "Generative Art",
    aspectRatio: "aspect-video",
  },
  {
    id: "proj3",
    title: "Procedural Alien Landscape",
    description:
      "Generate infinite, otherworldly terrains with unique atmospheric conditions and exotic flora that evolve in real-time.",
    imageUrl: "/generated/procedural-landscape.png",
    category: "World Building",
    aspectRatio: "aspect-square",
  },
  {
    id: "proj4",
    title: "Kinetic Typography Story",
    description:
      "Craft narratives where typography becomes a dynamic character, with words that morph, flow, and express emotion through movement.",
    imageUrl: "/generated/kinetic-typography-story.png",
    category: "Motion Design",
    aspectRatio: "aspect-[16/10]",
  },
  {
    id: "proj5",
    title: "AI-Powered Dream Weaver",
    description:
      "Harness machine learning to transform written prompts into surreal, evolving dreamscapes that blend reality with imagination.",
    imageUrl: "/generated/ai-dreamscape.png",
    category: "AI Art",
    aspectRatio: "aspect-[2/3]",
  },
  {
    id: "proj6",
    title: "Sound Reactive Visualizer",
    description:
      "Design sophisticated visual compositions that respond to audio frequencies, creating perfect harmony between sound and sight.",
    imageUrl: "/generated/sound-visualizer.png",
    category: "Music Tech",
    aspectRatio: "aspect-video",
  },
  {
    id: "proj7",
    title: "Bio-Luminescent Flora Garden",
    description:
      "Cultivate an interactive ecosystem of fantastical plants that respond to proximity and touch with mesmerizing light patterns.",
    imageUrl: "/generated/bioluminescent-garden.png",
    category: "Interactive Art",
    aspectRatio: "aspect-[7/8]",
  },
  {
    id: "proj8",
    title: "Architectural Flow Study",
    description:
      "Explore the intersection of organic forms and precision engineering in conceptual architectural designs that defy convention.",
    imageUrl: "/generated/fluid-architecture.png",
    category: "Architecture",
    aspectRatio: "aspect-square",
  },
  {
    id: "proj9",
    title: "Celestial Clockwork Orrery",
    description:
      "Craft an intricate 3D model of a fantastical solar system with orbiting celestial bodies that follow precise mathematical patterns.",
    imageUrl: "/generated/celestial-orrery.png",
    category: "3D Modeling",
    aspectRatio: "aspect-[4/3]",
  },
  {
    id: "proj10",
    title: "Interactive Storybook Adventure",
    description:
      "Create an immersive narrative experience where readers shape the story through choices, with animations that bring each page to life.",
    imageUrl: "/generated/interactive-storybook.png",
    category: "Digital Publishing",
    aspectRatio: "aspect-video",
  },
  {
    id: "proj11",
    title: "Generative Abstract Patterns",
    description:
      "Develop algorithms that produce infinite variations of complex patterns, perfect for textiles, wallpapers, or digital backgrounds.",
    imageUrl: "/generated/generative-patterns.png",
    category: "Generative Design",
    aspectRatio: "aspect-square",
  },
  {
    id: "proj12",
    title: "Virtual Reality Art Gallery",
    description:
      "Design an immersive VR space where digital artworks can be experienced in three dimensions, with interactive elements throughout.",
    imageUrl: "/generated/vr-gallery.png",
    category: "VR/AR",
    aspectRatio: "aspect-[16/9]",
  },
  {
    id: "proj13",
    title: "Augmented Reality Product Visualizer",
    description:
      "Build a tool that seamlessly places virtual products in real environments, allowing users to visualize items in their space before purchasing.",
    imageUrl: "/generated/ar-visualizer.png",
    category: "AR/UX",
    aspectRatio: "aspect-[3/4]",
  },
  {
    id: "proj14",
    title: "AI Music Composition Assistant",
    description:
      "Develop an intelligent system that analyzes musical patterns and suggests harmonies, melodies, and rhythms to enhance the creative process.",
    imageUrl: "/generated/ai-music.png",
    category: "AI Music",
    aspectRatio: "aspect-video",
  },
  {
    id: "proj15",
    title: "Data-Driven Narrative Generator",
    description:
      "Create a sophisticated engine that transforms raw data into compelling stories, automatically generating narratives that reveal insights.",
    imageUrl: "/generated/data-narrative.png",
    category: "AI Storytelling",
    aspectRatio: "aspect-[4/3]",
  },
]

export default function NewProjectPage() {
  const [selectedAsset, setSelectedAsset] = useState<ProjectAsset | null>(null)
  const [columns, setColumns] = useState(3)

  useEffect(() => {
    const updateColumns = () => {
      if (window.innerWidth < 768)
        setColumns(1) // md breakpoint for 1 column
      else if (window.innerWidth < 1280)
        setColumns(2) // xl breakpoint for 2 columns
      else setColumns(3)
    }
    updateColumns()
    window.addEventListener("resize", updateColumns)
    return () => window.removeEventListener("resize", updateColumns)
  }, [])

  const handleAssetClick = (asset: ProjectAsset) => {
    if (selectedAsset && selectedAsset.id === asset.id) {
      setSelectedAsset(null)
    } else {
      setSelectedAsset(asset)
    }
  }

  // Distribute items into columns for masonry layout
  // This algorithm tries to balance column heights better
  const distributedItems = Array.from({ length: columns }, () => [] as ProjectAsset[])

  // Estimate heights based on aspect ratio to create more balanced columns
  const getEstimatedHeight = (aspectRatio: string) => {
    if (aspectRatio === "aspect-square") return 1
    if (aspectRatio === "aspect-video") return 0.5625 // 16:9
    if (aspectRatio === "aspect-[3/4]") return 1.33
    if (aspectRatio === "aspect-[2/3]") return 1.5
    if (aspectRatio === "aspect-[4/3]") return 0.75
    if (aspectRatio === "aspect-[16/10]") return 0.625
    if (aspectRatio === "aspect-[7/8]") return 1.14
    return 1 // Default
  }

  // Track estimated column heights
  const columnHeights = Array(columns).fill(0)

  // Place each item in the shortest column
  projectIdeas.forEach((item) => {
    const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights))
    distributedItems[shortestColumnIndex].push(item)
    columnHeights[shortestColumnIndex] += getEstimatedHeight(item.aspectRatio)
  })

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedAsset) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
    return () => {
      document.body.style.overflow = "auto" // Cleanup on unmount
    }
  }, [selectedAsset])

  return (
    <div className="relative min-h-screen text-foreground">
      <main className="relative z-10">
        <div
          className={cn(
            "fixed inset-0 bg-flow-bg-dark/70 backdrop-blur-md transition-opacity duration-300 ease-in-out z-20",
            selectedAsset ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
          )}
          onClick={() => setSelectedAsset(null)}
        />

        <div className="container mx-auto px-2 sm:px-4 py-8 sm:py-12">
          <div className="text-center mb-10 sm:mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg text-foreground">
              Project Genesis: <span className="text-primary">Select Your Blueprint</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose your starting point. Each blueprint is a launchpad for innovation, designed to accelerate your
              journey from concept to creation.
            </p>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-4`}>
            {distributedItems.map((columnItems, colIndex) => (
              <div key={colIndex} className="flex flex-col gap-2 sm:gap-4">
                {columnItems.map((asset) => (
                  <div
                    key={asset.id}
                    className={cn(
                      "relative rounded-lg overflow-hidden shadow-lg cursor-pointer group transition-all duration-300 ease-in-out",
                      selectedAsset && selectedAsset.id !== asset.id ? "opacity-30 scale-95 blur-[2px]" : "opacity-100",
                      selectedAsset && selectedAsset.id === asset.id
                        ? "z-30 scale-105 shadow-2xl ring-4 ring-primary"
                        : "hover:scale-[1.02] hover:shadow-xl",
                      asset.aspectRatio,
                    )}
                    onClick={() => handleAssetClick(asset)}
                  >
                    <Image
                      src={asset.imageUrl || "/placeholder.svg"}
                      alt={asset.title}
                      fill
                      sizes={columns === 1 ? "100vw" : columns === 2 ? "50vw" : "33vw"}
                      className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                      priority={projectIdeas.indexOf(asset) < columns * 2} // Prioritize images in the first two visible rows
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out flex flex-col justify-end p-4 transform translate-y-4 group-hover:translate-y-0">
                      <h3 className="text-lg font-semibold text-white drop-shadow-md">{asset.title}</h3>
                      <p className="text-xs text-neutral-300 drop-shadow-sm">{asset.category}</p>
                    </div>
                    {selectedAsset && selectedAsset.id === asset.id && (
                      <div className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white backdrop-blur-sm">
                        <Maximize2 size={18} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {selectedAsset && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
            <div
              className="relative bg-popover/95 backdrop-blur-xl p-4 sm:p-6 rounded-xl shadow-2xl max-w-2xl w-full border border-accent/50 max-h-[90vh] overflow-y-auto flex flex-col transform transition-all duration-300 ease-out scale-100 opacity-100"
              onClick={(e) => e.stopPropagation()}
              style={{ animation: "modal-appear 0.3s ease-out" }}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-popover-foreground">{selectedAsset.title}</h2>
                  <p className="text-sm text-muted-foreground mb-2 sm:mb-4">{selectedAsset.category}</p>
                </div>
                <button
                  onClick={() => setSelectedAsset(null)}
                  className="p-2 text-muted-foreground hover:text-accent transition-colors rounded-full hover:bg-accent/20"
                  aria-label="Close project details"
                >
                  <X size={24} />
                </button>
              </div>

              <div className={`relative w-full ${selectedAsset.aspectRatio} rounded-md overflow-hidden mb-4 shrink-0`}>
                <Image
                  src={selectedAsset.imageUrl || "/placeholder.svg"}
                  alt={selectedAsset.title}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 90vw, 50vw" // Sizes for modal image
                />
              </div>
              <div className="overflow-y-auto grow">
                <p className="text-popover-foreground/90 mb-6 text-sm sm:text-base leading-relaxed">
                  {selectedAsset.description}
                </p>
              </div>
              <Button
                size="lg"
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold mt-auto shrink-0 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg"
              >
                <Rocket className="w-5 h-5 mr-2" />
                Launch with This Blueprint
              </Button>
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
  @keyframes modal-appear {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`}</style>
    </div>
  )
}
