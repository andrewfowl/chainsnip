import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUserFromSession } from "@/lib/auth"

export const runtime = "nodejs"
export const maxDuration = 60

const REALISTIC_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

function getTimezone(request?: NextRequest): string {
  try {
    const timezone = request?.headers.get("x-vercel-ip-timezone")
    if (timezone) return timezone
    return "UTC"
  } catch {
    return "UTC"
  }
}

async function addWatermarkToScreenshot(
  imageBuffer: Buffer,
  timestamp: string,
  timezone: string,
  sourceUrl: string,
  archiveId: string,
): Promise<Buffer> {
  try {
    const { Jimp } = await import("jimp")

    const image = await Jimp.read(imageBuffer)
    const width = image.width
    const height = image.height
    const bannerHeight = 60

    const newImage = new Jimp({ width, height: height + bannerHeight, color: 0x09090bff })

    // Copy original image
    newImage.composite(image, 0, 0)

    // Draw blue accent line at top of banner (3px)
    for (let x = 0; x < width; x++) {
      for (let y = height; y < height + 3; y++) {
        newImage.setPixelColor(0x0079daff, x, y)
      }
    }

    // Simple 5x7 bitmap font for uppercase letters, numbers, and basic punctuation
    const charMap: Record<string, number[][]> = {
      A: [
        [0, 1, 1, 1, 0],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
      ],
      B: [
        [1, 1, 1, 1, 0],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 1, 1, 1, 0],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 1, 1, 1, 0],
      ],
      C: [
        [0, 1, 1, 1, 0],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 0],
        [1, 0, 0, 0, 0],
        [1, 0, 0, 0, 0],
        [1, 0, 0, 0, 1],
        [0, 1, 1, 1, 0],
      ],
      D: [
        [1, 1, 1, 1, 0],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 1, 1, 1, 0],
      ],
      E: [
        [1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0],
        [1, 0, 0, 0, 0],
        [1, 1, 1, 1, 0],
        [1, 0, 0, 0, 0],
        [1, 0, 0, 0, 0],
        [1, 1, 1, 1, 1],
      ],
      F: [
        [1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0],
        [1, 0, 0, 0, 0],
        [1, 1, 1, 1, 0],
        [1, 0, 0, 0, 0],
        [1, 0, 0, 0, 0],
        [1, 0, 0, 0, 0],
      ],
      G: [
        [0, 1, 1, 1, 0],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 0],
        [1, 0, 1, 1, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [0, 1, 1, 1, 0],
      ],
      H: [
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
      ],
      I: [
        [1, 1, 1, 1, 1],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [1, 1, 1, 1, 1],
      ],
      J: [
        [0, 0, 1, 1, 1],
        [0, 0, 0, 1, 0],
        [0, 0, 0, 1, 0],
        [0, 0, 0, 1, 0],
        [1, 0, 0, 1, 0],
        [1, 0, 0, 1, 0],
        [0, 1, 1, 0, 0],
      ],
      K: [
        [1, 0, 0, 0, 1],
        [1, 1, 0, 1, 1],
        [1, 0, 1, 0, 1],
        [1, 1, 0, 0, 0],
        [1, 0, 1, 0, 0],
        [1, 0, 0, 1, 0],
        [1, 0, 0, 0, 1],
      ],
      L: [
        [1, 0, 0, 0, 0],
        [1, 0, 0, 0, 0],
        [1, 0, 0, 0, 0],
        [1, 0, 0, 0, 0],
        [1, 0, 0, 0, 0],
        [1, 0, 0, 0, 0],
        [1, 1, 1, 1, 1],
      ],
      M: [
        [1, 0, 0, 0, 1],
        [1, 1, 0, 1, 1],
        [1, 0, 1, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
      ],
      N: [
        [1, 0, 0, 0, 1],
        [1, 1, 0, 0, 1],
        [1, 0, 1, 0, 1],
        [1, 0, 0, 1, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
      ],
      O: [
        [0, 1, 1, 1, 0],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [0, 1, 1, 1, 0],
      ],
      P: [
        [1, 1, 1, 1, 0],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 1, 1, 1, 0],
        [1, 0, 0, 0, 0],
        [1, 0, 0, 0, 0],
        [1, 0, 0, 0, 0],
      ],
      Q: [
        [0, 1, 1, 1, 0],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 1, 0, 1],
        [1, 0, 0, 1, 0],
        [0, 1, 1, 0, 1],
      ],
      R: [
        [1, 1, 1, 1, 0],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 1, 1, 1, 0],
        [1, 0, 1, 0, 0],
        [1, 0, 0, 1, 0],
        [1, 0, 0, 0, 1],
      ],
      S: [
        [0, 1, 1, 1, 0],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 0],
        [0, 1, 1, 1, 0],
        [0, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [0, 1, 1, 1, 0],
      ],
      T: [
        [1, 1, 1, 1, 1],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
      ],
      U: [
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [0, 1, 1, 1, 0],
      ],
      V: [
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [0, 1, 0, 1, 0],
        [0, 1, 0, 1, 0],
        [0, 0, 1, 0, 0],
      ],
      W: [
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 1, 0, 1],
        [1, 0, 1, 0, 1],
        [1, 1, 0, 1, 1],
        [1, 0, 0, 0, 1],
      ],
      X: [
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [0, 1, 0, 1, 0],
        [0, 0, 1, 0, 0],
        [0, 1, 0, 1, 0],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
      ],
      Y: [
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [0, 1, 0, 1, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
      ],
      Z: [
        [1, 1, 1, 1, 1],
        [0, 0, 0, 0, 1],
        [0, 0, 0, 1, 0],
        [0, 0, 1, 0, 0],
        [0, 1, 0, 0, 0],
        [1, 0, 0, 0, 0],
        [1, 1, 1, 1, 1],
      ],
      "0": [
        [0, 1, 1, 1, 0],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 1, 1],
        [1, 0, 1, 0, 1],
        [1, 1, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [0, 1, 1, 1, 0],
      ],
      "1": [
        [0, 0, 1, 0, 0],
        [0, 1, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 1, 1, 1, 0],
      ],
      "2": [
        [0, 1, 1, 1, 0],
        [1, 0, 0, 0, 1],
        [0, 0, 0, 0, 1],
        [0, 0, 0, 1, 0],
        [0, 0, 1, 0, 0],
        [1, 0, 0, 0, 1],
        [1, 1, 1, 1, 1],
      ],
      "3": [
        [0, 1, 1, 1, 0],
        [1, 0, 0, 0, 1],
        [0, 0, 0, 0, 1],
        [0, 0, 1, 1, 0],
        [0, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [0, 1, 1, 1, 0],
      ],
      "4": [
        [0, 0, 0, 1, 0],
        [0, 0, 1, 1, 0],
        [0, 1, 0, 1, 0],
        [1, 0, 0, 1, 0],
        [1, 1, 1, 1, 1],
        [0, 0, 0, 1, 0],
        [0, 0, 0, 1, 0],
      ],
      "5": [
        [1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0],
        [1, 1, 1, 1, 0],
        [0, 0, 0, 0, 1],
        [0, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [0, 1, 1, 1, 0],
      ],
      "6": [
        [0, 1, 1, 1, 0],
        [1, 0, 0, 0, 0],
        [1, 0, 0, 0, 0],
        [1, 1, 1, 1, 0],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [0, 1, 1, 1, 0],
      ],
      "7": [
        [1, 1, 1, 1, 1],
        [0, 0, 0, 0, 1],
        [0, 0, 0, 1, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
      ],
      "8": [
        [0, 1, 1, 1, 0],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [0, 1, 1, 1, 0],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [0, 1, 1, 1, 0],
      ],
      "9": [
        [0, 1, 1, 1, 0],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [0, 1, 1, 1, 1],
        [0, 0, 0, 0, 1],
        [0, 0, 0, 0, 1],
        [0, 1, 1, 1, 0],
      ],
      ":": [
        [0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 0, 0, 0],
      ],
      "/": [
        [0, 0, 0, 0, 1],
        [0, 0, 0, 0, 1],
        [0, 0, 0, 1, 0],
        [0, 0, 1, 0, 0],
        [0, 1, 0, 0, 0],
        [1, 0, 0, 0, 0],
        [1, 0, 0, 0, 0],
      ],
      ".": [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 1, 1, 0, 0],
        [0, 1, 1, 0, 0],
      ],
      ",": [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 1, 0, 0, 0],
      ],
      "-": [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
      ],
      "(": [
        [0, 0, 1, 0, 0],
        [0, 1, 0, 0, 0],
        [1, 0, 0, 0, 0],
        [1, 0, 0, 0, 0],
        [1, 0, 0, 0, 0],
        [0, 1, 0, 0, 0],
        [0, 0, 1, 0, 0],
      ],
      ")": [
        [0, 0, 1, 0, 0],
        [0, 0, 0, 1, 0],
        [0, 0, 0, 0, 1],
        [0, 0, 0, 0, 1],
        [0, 0, 0, 0, 1],
        [0, 0, 0, 1, 0],
        [0, 0, 1, 0, 0],
      ],
      " ": [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
      ],
      "|": [
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
      ],
    }

    // Function to draw text at position
    const drawText = (text: string, startX: number, startY: number, color: number, scale = 2) => {
      let cursorX = startX
      const chars = text.toUpperCase().split("")

      for (const char of chars) {
        const bitmap = charMap[char]
        if (bitmap) {
          for (let row = 0; row < 7; row++) {
            for (let col = 0; col < 5; col++) {
              if (bitmap[row][col] === 1) {
                // Draw scaled pixel
                for (let sy = 0; sy < scale; sy++) {
                  for (let sx = 0; sx < scale; sx++) {
                    const px = cursorX + col * scale + sx
                    const py = startY + row * scale + sy
                    if (px < width && py < height + bannerHeight) {
                      newImage.setPixelColor(color, px, py)
                    }
                  }
                }
              }
            }
          }
        }
        cursorX += 6 * scale // char width + spacing
      }
    }

    // Format the watermark text
    const line1 = `CHAINSHIP | ${timestamp} (${timezone})`
    const line2 = `URL: ${sourceUrl.substring(0, 80)}${sourceUrl.length > 80 ? "..." : ""}`
    const line3 = `ID: ${archiveId}`

    // Draw text lines
    const whiteColor = 0xffffffff
    const blueColor = 0x0079daff
    const grayColor = 0xa1a1aaff

    drawText("CHAINSHIP", 20, height + 10, blueColor, 2)
    drawText(`| ${timestamp} (${timezone})`, 20 + 10 * 12, height + 10, whiteColor, 2)
    drawText(line2, 20, height + 30, grayColor, 1)
    drawText(`ID: ${archiveId.substring(0, 36)}`, 20, height + 42, grayColor, 1)

    const outputBuffer = await newImage.getBuffer("image/png")
    console.log("[v0] Watermark with text added successfully")
    return Buffer.from(outputBuffer)
  } catch (err) {
    console.log("[v0] Jimp watermark failed:", err)
    return imageBuffer
  }
}

async function captureWithScreenshotAPI(
  url: string,
  timestamp: string,
  timezone: string,
  archiveId: string,
): Promise<{ screenshot: Buffer | null; html: string | null; error?: string }> {
  console.log("[v0] Attempting screenshot API capture for:", url)

  let screenshot: Buffer | null = null
  let html: string | null = null

  const watermarkText = `ChainShip | ${timestamp} (${timezone}) | ID: ${archiveId.slice(0, 8)}`

  const screenshotServices = [
    // apiflash - has native text overlay support
    async () => {
      const params = new URLSearchParams({
        url: url,
        format: "png",
        width: "1440",
        full_page: "true",
        scroll_page: "true",
        delay: "5",
        wait_until: "network_idle",
        fresh: "true",
        // Watermark overlay
        watermark_text: watermarkText,
        watermark_size: "14",
        watermark_font: "Arial",
        watermark_color: "#FFFFFF",
        watermark_opacity: "100",
        watermark_position: "bottom",
        watermark_background: "#09090b",
      })

      const apiUrl = `https://api.apiflash.com/v1/urltoimage?${params.toString()}`
      console.log("[v0] Calling apiflash.com with watermark...")

      const response = await fetch(apiUrl, {
        headers: { "User-Agent": REALISTIC_UA },
        signal: AbortSignal.timeout(90000),
      })

      if (!response.ok) {
        throw new Error(`apiflash returned ${response.status}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      return Buffer.from(arrayBuffer)
    },

    // screenshotlayer - good full page support
    async () => {
      const params = new URLSearchParams({
        url: url,
        viewport: "1440x900",
        fullpage: "1",
        format: "PNG",
        delay: "10",
        force: "1",
        css_url: "",
      })

      const apiUrl = `https://api.screenshotlayer.com/api/capture?${params.toString()}`
      console.log("[v0] Calling screenshotlayer.com...")

      const response = await fetch(apiUrl, {
        headers: { "User-Agent": REALISTIC_UA },
        signal: AbortSignal.timeout(90000),
      })

      if (!response.ok) {
        throw new Error(`screenshotlayer returned ${response.status}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      return Buffer.from(arrayBuffer)
    },

    // thum.io with maximum settings
    async () => {
      const encodedUrl = encodeURIComponent(url)
      const apiUrl = `https://image.thum.io/get/fullpage/width/1440/maxheight/100000/noanimate/wait/25/png/${encodedUrl}`
      console.log("[v0] Calling thum.io with fullpage maxheight/100000...")

      const response = await fetch(apiUrl, {
        headers: { "User-Agent": REALISTIC_UA },
        signal: AbortSignal.timeout(120000),
      })

      if (!response.ok) {
        throw new Error(`thum.io returned ${response.status}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      return Buffer.from(arrayBuffer)
    },

    // Microlink as last resort
    async () => {
      const params = new URLSearchParams({
        url: url,
        screenshot: "true",
        fullPage: "true",
        waitForTimeout: "20000",
        scroll: "true",
      })

      const apiUrl = `https://api.microlink.io?${params.toString()}`
      console.log("[v0] Calling Microlink...")

      const response = await fetch(apiUrl, {
        headers: { "User-Agent": REALISTIC_UA },
        signal: AbortSignal.timeout(60000),
      })

      if (!response.ok) {
        throw new Error(`Microlink returned ${response.status}`)
      }

      const data = await response.json()
      if (!data.data?.screenshot?.url) {
        throw new Error("No screenshot URL in response")
      }

      const imgResponse = await fetch(data.data.screenshot.url)
      const arrayBuffer = await imgResponse.arrayBuffer()
      return Buffer.from(arrayBuffer)
    },
  ]

  for (const service of screenshotServices) {
    try {
      screenshot = await service()
      if (screenshot && screenshot.length > 10000) {
        console.log("[v0] Screenshot captured, size:", screenshot.length)
        break
      } else {
        console.log("[v0] Screenshot too small, trying next service")
        screenshot = null
      }
    } catch (err) {
      console.log("[v0] Screenshot service failed:", err instanceof Error ? err.message : err)
    }
  }

  // Skip HTML for known SPAs
  const knownSPAs = ["mintscan", "monad", "solscan", "uniswap", "opensea", "dexscreener"]
  const isSPA = knownSPAs.some((spa) => url.toLowerCase().includes(spa))

  if (!isSPA) {
    try {
      const htmlResponse = await fetch(url, {
        headers: {
          "User-Agent": REALISTIC_UA,
          Accept: "text/html,application/xhtml+xml",
        },
        signal: AbortSignal.timeout(15000),
      })

      if (htmlResponse.ok) {
        html = await htmlResponse.text()
        const hasContent =
          html.length > 5000 && !html.includes('id="root"></div></body>') && !html.includes('id="app"></div></body>')
        if (!hasContent) {
          html = null
        }
      }
    } catch (err) {
      console.log("[v0] HTML fetch failed:", err instanceof Error ? err.message : err)
    }
  }

  if (!screenshot && !html) {
    return { screenshot: null, html: null, error: "All capture methods failed" }
  }

  return { screenshot, html }
}

// Point CHROMIUM_REMOTE_PACK_URL at an @sparticuz/chromium pack tarball that
// matches the installed @sparticuz/chromium-min version. When it is unset we
// skip headless Chromium entirely and go straight to the screenshot API.
const CHROMIUM_REMOTE_PACK_URL = process.env.CHROMIUM_REMOTE_PACK_URL
// Hard ceiling for the whole Puppeteer attempt (download + launch + capture).
// Kept under maxDuration (60s) so a broken or slow pack download degrades to
// the API fallback instead of hanging the request forever.
const PUPPETEER_BUDGET_MS = 50000

async function captureWithPuppeteer(
  url: string,
  timestamp: string,
  timezone: string,
  archiveId: string,
): Promise<{ screenshot: Buffer | null; html: string | null; error?: string }> {
  if (!CHROMIUM_REMOTE_PACK_URL) {
    console.log("[v0] CHROMIUM_REMOTE_PACK_URL not set - skipping Puppeteer, using screenshot API")
    return captureWithScreenshotAPI(url, timestamp, timezone, archiveId)
  }

  let browser = null
  let budgetTimer: ReturnType<typeof setTimeout> | undefined

  try {
    console.log("[v0] Starting Puppeteer capture for:", url)

    const chromium = await import("@sparticuz/chromium-min")
    const puppeteerCore = await import("puppeteer-core")

    // Race the download+launch+capture against a hard budget so a corrupt or
    // slow remote pack can never hang the request.
    const budget = new Promise<never>((_, reject) => {
      budgetTimer = setTimeout(
        () => reject(new Error(`Puppeteer exceeded ${PUPPETEER_BUDGET_MS}ms budget`)),
        PUPPETEER_BUDGET_MS,
      )
    })

    const work = (async () => {
      const executablePath = await chromium.default.executablePath(CHROMIUM_REMOTE_PACK_URL)

      browser = await puppeteerCore.default.launch({
        args: [...chromium.default.args, "--disable-blink-features=AutomationControlled", "--no-sandbox"],
        defaultViewport: { width: 1440, height: 900 },
        executablePath,
        headless: true,
      })

      const page = await browser.newPage()
      await page.setUserAgent(REALISTIC_UA)

      await page.goto(url, {
        waitUntil: ["load", "networkidle0"],
        timeout: 45000,
      })

      const waitTime = url.includes("mintscan") ? 12000 : 8000
      await new Promise((resolve) => setTimeout(resolve, waitTime))

      // Scroll entire page to trigger lazy loading
      await page.evaluate(async () => {
        const scrollHeight = document.body.scrollHeight
        const viewportHeight = window.innerHeight
        let currentPosition = 0

        while (currentPosition < scrollHeight) {
          window.scrollTo(0, currentPosition)
          currentPosition += viewportHeight / 2
          await new Promise((r) => setTimeout(r, 200))
        }

        // Scroll to very bottom
        window.scrollTo(0, document.body.scrollHeight)
        await new Promise((r) => setTimeout(r, 2000))

        // Back to top
        window.scrollTo(0, 0)
      })

      await new Promise((resolve) => setTimeout(resolve, 2000))

      const screenshotBuffer = await page.screenshot({
        fullPage: true,
        type: "png",
        captureBeyondViewport: true,
      })
      const screenshot = Buffer.isBuffer(screenshotBuffer) ? screenshotBuffer : Buffer.from(screenshotBuffer)
      const html = await page.content()

      console.log("[v0] Puppeteer capture successful, size:", screenshot.length)
      return { screenshot, html }
    })()

    return await Promise.race([work, budget])
  } catch (error) {
    console.log("[v0] Puppeteer failed:", error instanceof Error ? error.message : error)
    return captureWithScreenshotAPI(url, timestamp, timezone, archiveId)
  } finally {
    if (budgetTimer) clearTimeout(budgetTimer)
    if (browser) {
      try {
        await (browser as { close: () => Promise<void> }).close()
      } catch (closeErr) {
        console.log("[v0] Browser close failed:", closeErr instanceof Error ? closeErr.message : closeErr)
      }
    }
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  console.log("[v0] ========== CAPTURE API REQUEST START ==========")
  
  try {
    const { url, archiveId } = await request.json()
    console.log("[v0] Request payload:", JSON.stringify({ url, archiveId }, null, 2))
    console.log("[v0] Archive ID:", archiveId)
    console.log("[v0] Target URL:", url)

    if (!url || !archiveId) {
      console.log("[v0] ERROR: Missing required fields - url:", !!url, "archiveId:", !!archiveId)
      return NextResponse.json({ error: "URL and archiveId are required" }, { status: 400 })
    }

    // SECURITY: derive the user from the session cookie, never from the request
    // body, so a client cannot write screenshots into another user's namespace.
    const sessionUser = await getCurrentUserFromSession()
    console.log("[v0] User ID:", sessionUser?.id || "not authenticated")
    const userFolder = sessionUser?.id || "anonymous"

    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
      console.log("[v0] URL parsed successfully - hostname:", parsedUrl.hostname, "pathname:", parsedUrl.pathname)
    } catch {
      console.log("[v0] ERROR: Invalid URL format:", url)
      return NextResponse.json({ error: "Invalid URL provided" }, { status: 400 })
    }

    const timezone = getTimezone(request)
    const now = new Date()
    const timestamp = now.toISOString()
    const formattedTimestamp = now.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "long",
      timeZone: timezone !== "UTC" ? timezone : undefined,
    })
    console.log("[v0] Timestamp info - ISO:", timestamp, "Formatted:", formattedTimestamp, "Timezone:", timezone)

    const safeHostname = parsedUrl.hostname.replace(/\./g, "-")
    const dateStr = now.toISOString().slice(0, 10)
    console.log("[v0] File naming - safeHostname:", safeHostname, "dateStr:", dateStr)

    let screenshotUrl: string | null = null
    let htmlUrl: string | null = null
    let captureError: string | null = null

    console.log("[v0] ---------- STARTING CAPTURE PROCESS ----------")
    const captureStartTime = Date.now()
    const { screenshot, html, error } = await captureWithPuppeteer(url, formattedTimestamp, timezone, archiveId)
    const captureElapsed = Date.now() - captureStartTime
    console.log("[v0] Capture process completed in", captureElapsed, "ms")
    console.log("[v0] Capture results - screenshot:", screenshot ? `${screenshot.length} bytes` : "null", "html:", html ? `${html.length} chars` : "null", "error:", error || "none")
    
    if (error) {
      captureError = error
      console.log("[v0] WARNING: Capture returned error:", error)
    }

    if (screenshot && screenshot.length > 0) {
      console.log("[v0] ---------- PROCESSING SCREENSHOT ----------")
      console.log("[v0] Raw screenshot size:", screenshot.length, "bytes")

      let finalScreenshot: Buffer
      try {
        console.log("[v0] Adding watermark to screenshot...")
        const watermarkStartTime = Date.now()
        finalScreenshot = await addWatermarkToScreenshot(screenshot, formattedTimestamp, timezone, url, archiveId)
        console.log("[v0] Watermark added successfully in", Date.now() - watermarkStartTime, "ms, new size:", finalScreenshot.length, "bytes")
      } catch (wmErr) {
        console.log("[v0] WARNING: Watermark failed, using original screenshot. Error:", wmErr)
        finalScreenshot = screenshot
      }

      const filename = `users/${userFolder}/snapshots/${archiveId}/${safeHostname}_${dateStr}_${formattedTimestamp.replace(/[^a-zA-Z0-9]/g, "-")}_${archiveId.slice(0, 8)}.png`
      console.log("[v0] Uploading screenshot to Blob storage, filename:", filename)

      try {
        const uploadStartTime = Date.now()
        const screenshotBlob = await put(filename, finalScreenshot, {
          access: "public",
          contentType: "image/png",
          addRandomSuffix: false,
        })
        screenshotUrl = screenshotBlob.url
        console.log("[v0] Screenshot uploaded successfully in", Date.now() - uploadStartTime, "ms")
        console.log("[v0] Screenshot URL:", screenshotUrl)
      } catch (uploadErr) {
        console.error("[v0] ERROR: Screenshot upload failed:", uploadErr)
        captureError = captureError || `Upload failed: ${uploadErr}`
      }
    } else {
      console.log("[v0] WARNING: No screenshot captured or screenshot is empty")
    }

    if (html && html.length > 5000) {
      console.log("[v0] ---------- PROCESSING HTML ----------")
      console.log("[v0] HTML content length:", html.length, "chars")
      
      const hasBalanceContent =
        html.includes("balance") || html.includes("token") || html.includes("asset") || html.includes("amount")
      console.log("[v0] HTML has balance-related content:", hasBalanceContent)

      if (hasBalanceContent) {
        try {
          console.log("[v0] Wrapping HTML with ChainShip banner...")
          const archivedHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="archived-url" content="${url}">
  <meta name="archived-timestamp" content="${timestamp}">
  <meta name="archived-timezone" content="${timezone}">
  <meta name="archive-id" content="${archiveId}">
  <title>ChainShip Archive - ${parsedUrl.hostname}</title>
  <base href="${parsedUrl.origin}">
  <style>
    .chainship-banner {
      position: fixed; bottom: 0; left: 0; right: 0;
      background: linear-gradient(90deg, #09090b, #18181b);
      color: white; padding: 14px 24px;
      font: 14px system-ui, sans-serif;
      z-index: 2147483647;
      border-top: 3px solid #0079da;
      display: flex; justify-content: space-between;
    }
    .chainship-banner strong { color: #0079da; }
    .chainship-banner code { background: #27272a; padding: 4px 8px; border-radius: 4px; font-size: 12px; color: #a1a1aa; }
    body { padding-bottom: 58px; }
  </style>
</head>
<body>
  ${html}
  <div class="chainship-banner">
    <span><strong>ChainShip</strong> | Captured: <strong>${formattedTimestamp}</strong> (${timezone})</span>
    <span>Source: <code>${url}</code> | ID: <code>${archiveId.slice(0, 8)}</code></span>
  </div>
</body>
</html>`

          const htmlFilename = `users/${userFolder}/snapshots/${archiveId}/${safeHostname}-${dateStr}.html`
          console.log("[v0] Uploading HTML to Blob storage, filename:", htmlFilename)
          
          const uploadStartTime = Date.now()
          const htmlBlob = await put(htmlFilename, archivedHtml, {
            access: "public",
            contentType: "text/html",
          })
          htmlUrl = htmlBlob.url
          console.log("[v0] HTML uploaded successfully in", Date.now() - uploadStartTime, "ms")
          console.log("[v0] HTML URL:", htmlUrl)
        } catch (uploadErr) {
          console.error("[v0] ERROR: HTML upload failed:", uploadErr)
        }
      } else {
        console.log("[v0] Skipping HTML upload - no balance-related content found")
      }
    } else {
      console.log("[v0] Skipping HTML processing - content too short or empty:", html ? html.length : 0, "chars")
    }

    if (!screenshotUrl && !htmlUrl) {
      const totalElapsed = Date.now() - startTime
      console.log("[v0] ERROR: Complete capture failure - no screenshot and no HTML captured")
      console.log("[v0] Total request time:", totalElapsed, "ms")
      console.log("[v0] ========== CAPTURE API REQUEST FAILED ==========")
      return NextResponse.json(
        { error: captureError || "Failed to capture. Explorer may be blocking automated access." },
        { status: 500 },
      )
    }

    console.log("[v0] ---------- GENERATING PROOF HASH ----------")
    const proofData = `${archiveId}|${url}|${timestamp}|${timezone}|${screenshotUrl || "none"}|${htmlUrl || "none"}`
    const encoder = new TextEncoder()
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(proofData))
    const proofHash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
    console.log("[v0] Proof hash generated:", proofHash.slice(0, 16) + "...")

    const totalElapsed = Date.now() - startTime
    console.log("[v0] ---------- CAPTURE SUMMARY ----------")
    console.log("[v0] Archive ID:", archiveId)
    console.log("[v0] Screenshot URL:", screenshotUrl || "none")
    console.log("[v0] HTML URL:", htmlUrl || "none")
    console.log("[v0] Proof Hash:", proofHash.slice(0, 16) + "...")
    console.log("[v0] Total request time:", totalElapsed, "ms")
    console.log("[v0] ========== CAPTURE API REQUEST SUCCESS ==========")

    return NextResponse.json({
      success: true,
      archiveId,
      screenshotUrl,
      htmlUrl,
      capturedAt: timestamp,
      timezone,
      sourceUrl: url,
      proofHash,
    })
  } catch (error) {
    const totalElapsed = Date.now() - startTime
    console.error("[v0] FATAL ERROR in capture API:", error)
    console.error("[v0] Error type:", error instanceof Error ? error.constructor.name : typeof error)
    console.error("[v0] Error message:", error instanceof Error ? error.message : String(error))
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "N/A")
    console.log("[v0] Total request time before failure:", totalElapsed, "ms")
    console.log("[v0] ========== CAPTURE API REQUEST FAILED ==========")
    return NextResponse.json({ error: error instanceof Error ? error.message : "Capture failed" }, { status: 500 })
  }
}
