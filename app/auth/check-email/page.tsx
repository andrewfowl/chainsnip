import type { Metadata } from "next"
import Link from "next/link"
import AuthFormContainer from "@/components/auth/auth-form-container"
import { ResendVerificationButton } from "@/components/auth/resend-verification-button"

export const metadata: Metadata = {
  title: "Confirm your email | ChainSnip",
  robots: { index: false },
}

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const { email = "" } = await searchParams

  return (
    <AuthFormContainer
      title="Check your inbox"
      description="One more step before you can start capturing balances."
      footerContent={
        <p>
          Already confirmed?{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-foreground underline decoration-primary decoration-2 underline-offset-4 hover:decoration-foreground"
          >
            Log In
          </Link>
        </p>
      }
    >
      <div className="flex flex-col gap-4 text-sm leading-relaxed">
        <p>
          {"We sent a confirmation link to "}
          {email ? <span className="font-semibold text-foreground">{email}</span> : "your email address"}
          {". Open it to activate your account. The link expires in 24 hours."}
        </p>
        <p className="text-muted-foreground">
          {"Can't find it? Check your spam or promotions folder, or send a new link."}
        </p>
        {email ? <ResendVerificationButton email={email} /> : null}
      </div>
    </AuthFormContainer>
  )
}
