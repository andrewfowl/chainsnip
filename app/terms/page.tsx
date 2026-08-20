import type { Metadata } from "next"
import { LegalPage, LegalSection } from "@/components/legal-page"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms governing your use of ChainShip's blockchain snapshot and archiving service.",
  alternates: { canonical: "https://chainship.io/terms" },
}

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="August 20, 2026">
      <LegalSection heading="1. Agreement to terms">
        <p>
          These Terms of Service govern your access to and use of ChainShip (the &quot;Service&quot;). By creating an
          account or using the Service, you agree to be bound by these terms. If you do not agree, do not use the
          Service.
        </p>
      </LegalSection>

      <LegalSection heading="2. The service">
        <p>
          ChainShip captures and archives publicly available blockchain explorer pages on a schedule you configure,
          producing timestamped, hashed snapshots intended as records of what a wallet displayed at a point in time. The
          Service records public on-chain data as rendered by third-party explorers; it does not custody funds, execute
          transactions, or provide financial, tax, legal, or investment advice.
        </p>
      </LegalSection>

      <LegalSection heading="3. Eligibility">
        <p>
          You must be at least 18 years old and capable of forming a binding contract to use the Service. If you use the
          Service on behalf of an organization, you represent that you are authorized to bind that organization to these
          terms.
        </p>
      </LegalSection>

      <LegalSection heading="4. Accounts and security">
        <p>
          You are responsible for safeguarding your account credentials and for all activity that occurs under your
          account. Notify us promptly of any unauthorized use. We are not liable for losses arising from your failure to
          protect your credentials.
        </p>
      </LegalSection>

      <LegalSection heading="5. Acceptable use">
        <p>You agree not to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Use the Service to capture pages you are not legally permitted to access.</li>
          <li>Interfere with or disrupt the Service, its infrastructure, or the explorers it accesses.</li>
          <li>Reverse engineer, resell, or provide the Service to third parties except as expressly permitted.</li>
          <li>Use the Service for any unlawful purpose or to misrepresent captured records.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="6. Snapshots and accuracy">
        <p>
          Snapshots reflect what third-party explorers rendered at capture time. Explorers may be unavailable, rate-limit
          requests, present bot-detection screens, or display data that is delayed or incorrect. ChainShip captures what
          is shown and does not independently verify the accuracy of on-chain data or explorer output. You are
          responsible for reviewing snapshots before relying on them for audit, filing, or compliance purposes.
        </p>
      </LegalSection>

      <LegalSection heading="7. Payment and subscriptions">
        <p>
          Paid plans are billed in advance on a recurring basis through our payment processor, Stripe. Subscriptions
          renew automatically until cancelled. You may cancel at any time; cancellation takes effect at the end of the
          current billing period, and fees already paid are non-refundable except where required by law.
        </p>
      </LegalSection>

      <LegalSection heading="8. Your content">
        <p>
          You retain ownership of the wallet addresses, explorer URLs, and other inputs you provide. You grant ChainShip
          a limited license to process this content solely to operate and provide the Service, including capturing,
          storing, and delivering snapshots to you.
        </p>
      </LegalSection>

      <LegalSection heading="9. Third-party services">
        <p>
          The Service relies on third parties including blockchain explorers, screenshot providers, storage, and payment
          processors. Your use may be subject to their terms, and we are not responsible for their availability, content,
          or conduct.
        </p>
      </LegalSection>

      <LegalSection heading="10. Termination">
        <p>
          You may stop using the Service at any time. We may suspend or terminate access if you breach these terms or use
          the Service in a way that risks harm to us, other users, or third parties. Upon termination, your right to use
          the Service ends; sections that by their nature should survive will survive.
        </p>
      </LegalSection>

      <LegalSection heading="11. Disclaimer of warranties">
        <p className="uppercase">
          The service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, whether
          express or implied, including merchantability, fitness for a particular purpose, and non-infringement. We do
          not warrant that the service will be uninterrupted, error-free, or that snapshots will be accepted by any
          auditor, regulator, or court.
        </p>
      </LegalSection>

      <LegalSection heading="12. Limitation of liability">
        <p>
          To the maximum extent permitted by law, ChainShip&apos;s total liability arising out of or relating to the
          Service will not exceed the amount you paid us in the twelve months before the event giving rise to the claim.
          We are not liable for indirect, incidental, or consequential damages. Some jurisdictions do not allow these
          limitations, so they may not apply to you.
        </p>
      </LegalSection>

      <LegalSection heading="13. Indemnity">
        <p>
          You agree to indemnify and hold ChainShip harmless from claims, damages, and expenses arising from your use of
          the Service or your breach of these terms.
        </p>
      </LegalSection>

      <LegalSection heading="14. Governing law">
        <p>
          These terms are governed by the laws of the State of Delaware, United States, without regard to its conflict of
          law rules. The exclusive venue for disputes will be the state and federal courts located in Delaware, unless
          otherwise required by applicable law.
        </p>
      </LegalSection>

      <LegalSection heading="15. Changes to these terms">
        <p>
          We may update these terms from time to time. We will update the &quot;Last updated&quot; date above, and your
          continued use of the Service after changes are posted constitutes acceptance of the revised terms.
        </p>
      </LegalSection>

      <LegalSection heading="16. Contact">
        <p>
          Questions about these terms, or copyright and takedown requests, can be sent to{" "}
          <a href="mailto:legal@chainship.io">legal@chainship.io</a>.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
