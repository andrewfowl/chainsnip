import type { Metadata } from "next"
import Link from "next/link"
import AuthFormContainer from "@/components/auth/auth-form-container"
import { ConfirmEmailButton } from "@/components/auth/confirm-email-button"

export const metadata: Metadata = {
  title: "Confirm email | ChainSnip",
  robots: { index: false },
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token = "" } = await searchParams

  return (
    <AuthFormContainer
      title="Confirm your email"
      description="Click below to activate your ChainSnip account."
      footerContent={
        <p>
          Link not working?{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-foreground underline decoration-primary decoration-2 underline-offset-4 hover:decoration-foreground"
          >
            Log in to get a new one
          </Link>
        </p>
      }
    >
      {token ? (
        <ConfirmEmailButton token={token} />
      ) : (
        <p className="text-sm text-muted-foreground">This confirmation link is missing its token.</p>
      )}
    </AuthFormContainer>
  )
}
