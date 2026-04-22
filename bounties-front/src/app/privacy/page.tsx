"use client";

import { DynamicLayout } from "@/components/layout";
import {
  BRAND_CONTACT_EMAIL,
  BRAND_CONTACT_MAILTO,
  BRAND_DISPLAY_NAME,
  BRAND_SITE_URL,
} from "@/lib/branding/links";

export default function PrivacyPage() {
  return (
    <DynamicLayout>
      <div className="min-h-screen pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Privacy Policy
            </h1>
          </div>

          <div className="prose prose-invert max-w-none text-gray-300 space-y-8">
            {/* Introduction */}
            <section>
              <p className="text-lg">
                At {BRAND_DISPLAY_NAME} by Nido, accessible from{" "}
                <a
                  href={`${BRAND_SITE_URL}/`}
                  className="text-[var(--color-primary)] hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {`${BRAND_SITE_URL}/`}
                </a>{" "}
                or via embed on partner websites, one of our core priorities is
                protecting the privacy and data of our users whether you're a
                project running a campaign or a creator participating in one.
                This Privacy Policy outlines the types of information we
                collect, how we use it, and your rights over your data.
              </p>
              <p>
                If you have any questions or require more information about our
                Privacy Policy, feel free to contact us at:{" "}
                <a
                  href={BRAND_CONTACT_MAILTO}
                  className="text-[var(--color-primary)] hover:underline"
                >
                  {BRAND_CONTACT_EMAIL}
                </a>
              </p>
            </section>

            {/* Consent */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Consent</h2>
              <p>
                By using {BRAND_DISPLAY_NAME}, you consent to this Privacy Policy and agree
                to its terms.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                Information We Collect
              </h2>
              <p className="mb-3">
                We may collect the following types of information:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Basic account data:</strong> name, email address,
                  username (Twitter/X, Discord, Telegram), wallet address
                </li>
                <li>
                  <strong>Submitted content:</strong> links to posts, campaigns,
                  tasks, and proof of work
                </li>
                <li>
                  <strong>Performance metrics:</strong> engagement scores, task
                  completion status, timestamps
                </li>
                <li>
                  <strong>Technical data:</strong> IP address, browser type,
                  device info, usage behavior
                </li>
              </ul>
              <p className="mt-3">
                Some of this data is provided directly by the user (e.g., during
                campaign participation), while other data may be collected via
                integrated APIs or analytics.
              </p>
            </section>

            {/* How We Use Your Information */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                How We Use Your Information
              </h2>
              <p className="mb-3">We use collected information to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Operate, maintain, and improve the {BRAND_DISPLAY_NAME} platform</li>
                <li>
                  Automate scoring, leaderboard generation, and reward
                  eligibility
                </li>
                <li>
                  Validate submitted tasks and detect suspicious or fraudulent
                  activity
                </li>
                <li>
                  Contact users regarding campaign status, rewards, or
                  violations
                </li>
                <li>
                  Generate anonymous usage statistics to improve the product
                </li>
                <li>Comply with legal or regulatory obligations</li>
              </ul>
              <p className="mt-3">
                We do not sell user data or use it for advertising purposes.
              </p>
            </section>

            {/* Cookies & Tracking */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                Cookies & Tracking
              </h2>
              <p className="mb-3">
                We may use basic cookies and analytics tools to understand how
                users interact with the platform. These help us:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Identify technical issues</li>
                <li>Improve user experience</li>
                <li>Prevent spam or bot activity</li>
              </ul>
              <p className="mt-3">
                You can disable cookies in your browser settings at any time.
              </p>
            </section>

            {/* Third-Party Integrations */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                Third-Party Integrations
              </h2>
              <p className="mb-3">
                {BRAND_DISPLAY_NAME} may connect to third-party services such as:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Twitter/X API:</strong> to validate content and
                  engagement
                </li>
                <li>
                  <strong>Telegram/Discord Bots:</strong> for reminders and
                  communication
                </li>
                <li>
                  <strong>Google Sheets or Notion:</strong> for internal
                  metrics, when used manually
                </li>
                <li>
                  <strong>Wallet services (e.g. MetaMask):</strong> for on-chain
                  identity verification (if applicable)
                </li>
              </ul>
              <p className="mt-3">
                We do not control the data handling policies of these platforms.
                Please refer to their respective Privacy Policies.
              </p>
            </section>

            {/* Data Protection Rights */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                Data Protection Rights (GDPR / CCPA)
              </h2>
              <p className="mb-3">
                Depending on your location, you may have rights including:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Right to access your personal data</li>
                <li>Right to correct inaccurate data</li>
                <li>Right to request deletion of your data</li>
                <li>Right to object or restrict how we process your data</li>
                <li>Right to data portability</li>
              </ul>
              <p className="mt-3">
                To request any of the above, email us at{" "}
                <a
                  href={BRAND_CONTACT_MAILTO}
                  className="text-[var(--color-primary)] hover:underline"
                >
                  {BRAND_CONTACT_EMAIL}
                </a>
                . We will respond within 30 days.
              </p>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                Children's Privacy
              </h2>
              <p>
                {BRAND_DISPLAY_NAME} is not intended for use by children under the age of
                13. We do not knowingly collect data from minors. If you believe
                a child has submitted personal data through our platform, please
                contact us immediately so we can remove it.
              </p>
            </section>

            {/* Updates to This Policy */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                Updates to This Policy
              </h2>
              <p>
                We may update this Privacy Policy periodically. Any changes will
                be posted here, with an updated effective date.
              </p>
            </section>

            {/* Contact Us */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
              <p className="mb-2">
                For any questions, concerns, or data requests:
              </p>
              <p>
                <strong>Nido</strong>
              </p>
              <p>
                <a
                  href={BRAND_CONTACT_MAILTO}
                  className="text-[var(--color-primary)] hover:underline"
                >
                  {BRAND_CONTACT_EMAIL}
                </a>
              </p>
            </section>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-gray-700">
              <p className="text-gray-400 text-sm">
                Last updated:{" "}
                {new Date().toLocaleDateString("pt-BR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                For questions about this Privacy Policy, please contact us at{" "}
                <a
                  href={BRAND_CONTACT_MAILTO}
                  className="text-[var(--color-primary)] hover:underline"
                >
                  {BRAND_CONTACT_EMAIL}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </DynamicLayout>
  );
}
