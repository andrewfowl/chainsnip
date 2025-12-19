import type React from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import Link from "next/link"
import { Archive } from "lucide-react"

interface AuthFormContainerProps {
  title: string
  description: string
  children: React.ReactNode
  footerContent?: React.ReactNode
}

export default function AuthFormContainer({ title, description, children, footerContent }: AuthFormContainerProps) {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md bg-card/90 backdrop-blur-xl border-border shadow-2xl">
        <CardHeader className="text-center">
          <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4" aria-label="Back to Homepage">
            <Archive className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-foreground">ChainSnip</span>
          </Link>
          <CardTitle className="text-2xl font-bold text-foreground">{title}</CardTitle>
          <CardDescription className="text-muted-foreground">{description}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
        {footerContent && (
          <CardFooter className="flex flex-col items-center text-center text-sm text-muted-foreground">
            {footerContent}
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
