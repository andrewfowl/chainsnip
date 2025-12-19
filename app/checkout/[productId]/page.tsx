"use client"

import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Checkout from "@/components/checkout"
import { PRODUCTS } from "@/lib/products"

export default function CheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.productId as string

  const product = PRODUCTS.find((p) => p.id === productId)

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Product not found</h1>
          <Button onClick={() => router.push("/")} variant="outline" className="rounded-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <Button
          onClick={() => router.back()}
          variant="ghost"
          className="mb-8 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{product.name}</h1>
          <p className="text-muted-foreground">{product.description}</p>
          <div className="mt-4">
            <span className="text-4xl font-bold text-foreground">${(product.priceInCents / 100).toFixed(0)}</span>
            {product.mode === "subscription" && <span className="text-muted-foreground">/{product.interval}</span>}
            {product.mode === "payment" && <span className="text-sm text-accent ml-2">one-time</span>}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <Checkout productId={productId} />
        </div>
      </div>
    </div>
  )
}
