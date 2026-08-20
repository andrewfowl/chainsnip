import type { Metadata } from "next"
import { LegalPage, LegalSection } from "@/components/legal-page"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How ChainShip collects, uses, and protects your data.",
  alternates: { canonical: "https://chainship.io/privacy" },
}

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="August 20, 2026">
      <LegalSection heading="1. Who we are">
        <p>
          ChainShip provides audit-ready blockchain balance snapshots for accountants and financial professionals. This
          policy explains what we collect, how we use it, and the choices you have. Contact us at{" "}
          <a href="mailto:privacy@chainship.io">privacy@chainship.io</a>.
        </p>
      </LegalSection>

      <LegalSection heading="2. Information we collect">
        <p>We collect:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <span className="text-foreground">Account data</span> — your email address and authentication credentials.
          </li>
          <li>
            <span className="text-foreground">Service inputs</span> — the wallet addresses and explorer URLs you add,
            and the snapshots and hashes we generate from them.
          </li>
          <li>
            <span className="text-foreground">Billing data</span> — subscription status and payment records handled by
            our payment processor. We do not store full card numbers.
          </li>
          <li>
            <span className="text-foreground">Usage data</span> — logs and technical information needed to operate,
            secure, and debug the Service.
          </li>
        </ul>
        <p>
          <span className="text-foreground">What we do not collect:</span> we do not access your wallets&apos; private
          keys, and we cannot move your funds. The explorer pages we capture contain only publicly available on-chain
          data.
        </p>
      </LegalSection>

      <LegalSection heading="3. How we use information">
        <p>
          We use your information to provide and maintain the Service, capture and deliver snapshots on your schedule,
          process payments, communicate with you about your account, secure the platform, and comply with legal
          obligations. We do not sell your personal information, and we do not use your data to train AI models.
        </p>
      </LegalSection>

      <LegalSection heading="4. Third-party processors">
        <p>We share data with service providers only as needed to run the Service:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <span className="text-foreground">Neon</span> — database hosting for account and snapshot records.
          </li>
          <li>
            <span className="text-foreground">Vercel</span> — application hosting and Blob storage for captured
            snapshots.
          </li>
          <li>
            <span className="text-foreground">Stripe</span> — subscription billing and payment processing.
          </li>
          <li>
            <span className="text-foreground">Screenshot providers</span> — used to render explorer pages when capture
            requires it.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="5. Data retention">
        <p>
          We retain account and snapshot data for as long as your account is active or as needed to provide the Service.
          Snapshots are kept so they remain available as records; you may delete them from your dashboard. Billing
          records are retained as required for tax and accounting purposes. When you close your account, we delete or
          anonymize your data within a reasonable period, except where retention is legally required.
        </p>
      </LegalSection>

      <LegalSection heading="6. Your rights">
        <p>
          Depending on where you live, you may have the right to access, correct, export, or delete your personal data,
          and to object to or restrict certain processing. To exercise these rights, contact{" "}
          <a href="mailto:privacy@chainship.io">privacy@chainship.io</a>. EEA and UK users may lodge a complaint with
          their local supervisory authority. California residents may request disclosure or deletion and will not be
          discriminated against for exercising these rights.
        </p>
      </LegalSection>

      <LegalSection heading="7. International transfers">
        <p>
          Your data may be processed in countries other than your own, including the United States. Where required, we
          rely on appropriate safeguards such as standard contractual clauses for these transfers.
        </p>
      </LegalSection>

      <LegalSection heading="8. Security">
        <p>
          We use industry-standard measures including encryption in transit, hashed passwords, and access controls to
          protect your data. No method of transmission or storage is completely secure, and we cannot guarantee absolute
          security.
        </p>
      </LegalSection>

      <LegalSection heading="9. Children">
        <p>
          The Service is not directed to individuals under 18, and we do not knowingly collect data from them. If you
          believe a minor has provided us data, contact us and we will delete it.
        </p>
      </LegalSection>

      <LegalSection heading="10. Changes to this policy">
        <p>
          We may update this policy from time to time. We will revise the &quot;Last updated&quot; date above, and
          significant changes will be communicated where appropriate.
        </p>
      </LegalSection>

      <LegalSection heading="11. Contact">
        <p>
          For any privacy question or request, email{" "}
          <a href="mailto:privacy@chainship.io">privacy@chainship.io</a>. We aim to respond within 30 days.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
