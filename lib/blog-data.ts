import type { BlogPost } from "@/types/blog"
import { slugify } from "./utils" // Import slugify

// Add more diverse tags
const commonTags = [
  "creativity",
  "digital-art",
  "workflow",
  "design",
  "innovation",
  "color-theory",
  "ux-design",
  "3d",
  "web-development",
  "immersive",
  "inspiration",
  "collaboration",
  "digital-tools",
  "tutorials",
  "case-studies",
  "future-of-design",
  "ai-creativity",
  "motion-design",
  "3d-artistry",
  "ui-ux-trends",
  "brand-storytelling",
  "interactive-media",
  "generative-art",
  "sound-design",
  "virtual-reality",
  "augmented-reality",
  "creative-coding",
  "mind-mapping",
  "concept-development",
  "project-management-creative",
]

function getRandomTags(count = 3): string[] {
  const shuffled = [...commonTags].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "The Art of Creative Flow: Finding Your Digital Rhythm",
    slug: slugify("The Art of Creative Flow: Finding Your Digital Rhythm"),
    content:
      "In the digital age, creativity flows like liquid inspiration through our minds. Understanding how to harness this flow is essential for any creative professional. When we allow our ideas to merge and blend naturally, we discover new possibilities that emerge from the intersection of different concepts. This post explores techniques to enter and maintain a state of creative flow, optimizing your digital workspace, and leveraging tools that enhance your natural rhythm. We'll delve into the psychology behind flow states and provide actionable tips to make your creative process more fluid and productive.",
    excerpt:
      "Discover how to harness your creative flow and find your unique digital rhythm in the modern creative landscape.",
    author: "Maya Chen",
    publishedAt: "2024-01-15",
    tags: ["creativity", "digital-art", "workflow", "productivity", "inspiration"],
    category: "Creative Process",
    readTime: 6,
    featured: true,
  },
  {
    id: "2",
    title: "Fluid Design Principles: When Ideas Merge",
    slug: slugify("Fluid Design Principles: When Ideas Merge"),
    content:
      "Design is not static—it's a living, breathing entity that evolves through the merger of concepts. Like blobs in a lava lamp, our design ideas should flow together, creating something greater than the sum of their parts. This organic approach to design thinking opens up new avenues for innovation. We'll examine case studies where fluid design led to groundbreaking products and experiences, and discuss how to foster a collaborative environment where ideas can merge seamlessly. Learn practical methods for visual brainstorming and iterative design that embrace fluidity.",
    excerpt:
      "Explore how fluid design principles can transform your creative process through the natural merger of ideas.",
    author: "Alex Rivera",
    publishedAt: "2024-01-12",
    tags: ["design-principles", "innovation", "collaboration", "visual-thinking", ...getRandomTags(1)],
    category: "Design Theory",
    readTime: 7,
    featured: false,
  },
  {
    id: "3",
    title: "The Psychology of Color Transitions in Digital Media",
    slug: slugify("The Psychology of Color Transitions in Digital Media"),
    content:
      "Color transitions in digital media aren't just aesthetic choices—they're psychological tools that guide user experience. When colors blend and merge seamlessly, they create emotional responses that can enhance engagement and create memorable experiences. Understanding this psychology is crucial for modern designers. This article breaks down how different color combinations and transition speeds affect user perception and mood. We'll also cover accessibility considerations for color transitions and provide best practices for implementing them effectively in your projects.",
    excerpt: "Understand how color transitions affect user psychology and enhance digital experiences.",
    author: "Dr. Sarah Kim",
    publishedAt: "2024-01-10",
    tags: ["color-theory", "psychology", "ux-design", "visual-design", "accessibility", ...getRandomTags(1)],
    category: "User Experience",
    readTime: 6,
    featured: true,
  },
  {
    id: "4",
    title: "Building Immersive 3D Experiences for the Web",
    slug: slugify("Building Immersive 3D Experiences for the Web"),
    content:
      "The web is evolving into a three-dimensional space where users can explore and interact with content in new ways. Creating immersive 3D experiences requires understanding both technical implementation and user psychology. The key is making complex interactions feel natural and intuitive. This guide covers popular frameworks like Three.js and React Three Fiber, performance optimization techniques for web-based 3D, and design considerations for creating engaging and accessible immersive environments. We'll also look at emerging trends in web 3D.",
    excerpt: "Learn the fundamentals of creating engaging 3D web experiences that captivate and inspire users.",
    author: "Jordan Park",
    publishedAt: "2024-01-08",
    tags: ["3d-web", "webgl", "react-three-fiber", "immersive-tech", "performance", ...getRandomTags(1)],
    category: "Technology",
    readTime: 8,
    featured: false,
  },
  {
    id: "5",
    title: "Generative Art: Where Code Meets Creative Flow",
    slug: slugify("Generative Art: Where Code Meets Creative Flow"),
    content:
      "Generative art is a fascinating intersection of programming and artistic expression. By defining rules and algorithms, artists can create ever-evolving, unique visual pieces. This post explores the tools and techniques behind generative art, from p5.js to custom shaders. We'll discuss how embracing randomness and systemic design can unlock new forms of creative flow, and showcase inspiring examples of generative art projects. Learn how to start your own journey into this exciting field where logic and imagination merge.",
    excerpt: "Dive into the world of generative art and discover how code can become a medium for fluid creativity.",
    author: "Casey Lee",
    publishedAt: "2024-02-01",
    tags: ["generative-art", "creative-coding", "p5js", "algorithms", "digital-art", ...getRandomTags(1)],
    category: "Digital Art",
    readTime: 7,
    featured: true,
  },
  {
    id: "6",
    title: "Mind Mapping Your Way to Innovative Solutions",
    slug: slugify("Mind Mapping Your Way to Innovative Solutions"),
    content:
      "Mind mapping is a powerful technique for visualizing connections between ideas and fostering innovative thinking. This article explores various digital and analog mind mapping tools and methodologies. We'll show you how to use mind maps to break down complex problems, brainstorm new concepts, and structure creative projects. Discover how this visual approach can enhance your creative flow, improve collaboration, and lead to more innovative solutions by allowing ideas to merge and diverge organically.",
    excerpt:
      "Unlock your creative potential by mastering the art of mind mapping for brainstorming and problem-solving.",
    author: "Devon Quinn",
    publishedAt: "2024-02-05",
    tags: ["mind-mapping", "brainstorming", "innovation", "problem-solving", "productivity", ...getRandomTags(1)],
    category: "Creative Techniques",
    readTime: 5,
    featured: false,
  },
]
