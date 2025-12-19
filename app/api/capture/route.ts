import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

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

async function captureWithPuppeteer(
  url: string,
  timestamp: string,
  timezone: string,
  archiveId: string,
): Promise<{ screenshot: Buffer | null; html: string | null; error?: string }> {
  let browser = null

  try {
    console.log("[v0] Starting Puppeteer capture for:", url)

    const chromium = await import("@sparticuz/chromium-min")
    const puppeteerCore = await import("puppeteer-core")

    const executablePath = await chromium.default.executablePath(
      "https://github.com/nicholasgriffintn/vercel-chromium/releases/download/v133.0.0/chromium-v133.0.0-pack.tar",
    )

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
  } catch (error) {
    console.log("[v0] Puppeteer failed:", error instanceof Error ? error.message : error)
    return captureWithScreenshotAPI(url, timestamp, timezone, archiveId)
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url, archiveId } = await request.json()
    console.log("[v0] Capture request:", { url, archiveId })

    if (!url || !archiveId) {
      return NextResponse.json({ error: "URL and archiveId are required" }, { status: 400 })
    }

    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch {
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

    const safeHostname = parsedUrl.hostname.replace(/\./g, "-")
    const dateStr = now.toISOString().slice(0, 10)

    let screenshotUrl: string | null = null
    let htmlUrl: string | null = null
    let captureError: string | null = null

    const { screenshot, html, error } = await captureWithPuppeteer(url, formattedTimestamp, timezone, archiveId)
    if (error) {
      captureError = error
    }

    if (screenshot && screenshot.length > 0) {
      console.log("[v0] Processing screenshot, adding watermark...")

      let finalScreenshot: Buffer
      try {
        finalScreenshot = await addWatermarkToScreenshot(screenshot, formattedTimestamp, timezone, url, archiveId)
      } catch (wmErr) {
        console.log("[v0] Watermark failed, using original:", wmErr)
        finalScreenshot = screenshot
      }

      const filename = `snapshots/${archiveId}/${safeHostname}_${dateStr}_${formattedTimestamp.replace(/[^a-zA-Z0-9]/g, "-")}_${archiveId.slice(0, 8)}.png`

      try {
        const screenshotBlob = await put(filename, finalScreenshot, {
          access: "public",
          contentType: "image/png",
          addRandomSuffix: false,
        })
        screenshotUrl = screenshotBlob.url
        console.log("[v0] Screenshot uploaded:", screenshotUrl)
      } catch (uploadErr) {
        console.error("[v0] Screenshot upload error:", uploadErr)
        captureError = captureError || `Upload failed: ${uploadErr}`
      }
    }

    if (html && html.length > 5000) {
      const hasBalanceContent =
        html.includes("balance") || html.includes("token") || html.includes("asset") || html.includes("amount")

      if (hasBalanceContent) {
        try {
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

          const htmlBlob = await put(`snapshots/${archiveId}/${safeHostname}-${dateStr}.html`, archivedHtml, {
            access: "public",
            contentType: "text/html",
          })
          htmlUrl = htmlBlob.url
        } catch (uploadErr) {
          console.error("[v0] HTML upload error:", uploadErr)
        }
      }
    }

    if (!screenshotUrl && !htmlUrl) {
      return NextResponse.json(
        { error: captureError || "Failed to capture. Explorer may be blocking automated access." },
        { status: 500 },
      )
    }

    const proofData = `${archiveId}|${url}|${timestamp}|${timezone}|${screenshotUrl || "none"}|${htmlUrl || "none"}`
    const encoder = new TextEncoder()
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(proofData))
    const proofHash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")

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
    console.error("[v0] Capture error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Capture failed" }, { status: 500 })
  }
}
