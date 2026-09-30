import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/dashboard/", "/api/"],
    },
    sitemap: "https://chainsnip.com/sitemap.xml",
    host: "https://chainsnip.com",
  }
}
