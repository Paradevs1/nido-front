"use client";

import { DynamicLayout } from "@/components/layout";
import {
  BRAND_CONTACT_EMAIL,
  BRAND_CONTACT_MAILTO,
  BRAND_DISPLAY_NAME,
  BRAND_SITE_HOST,
  BRAND_SITE_URL,
} from "@/lib/branding/links";

export default function TermsPage() {
  return (
    <DynamicLayout>
      <div className="min-h-screen pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Terms & Conditions
            </h1>
            <p className="text-gray-400 text-lg">
              {`TERMS OF SERVICE OF THE ${BRAND_DISPLAY_NAME.toUpperCase()} PLATFORM`}
            </p>
          </div>

          <div className="prose prose-invert max-w-none text-gray-300 space-y-8">
            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                1. GENERAL PROVISIONS
              </h2>
              <div className="space-y-3">
                <p>
                  <strong>1.1.</strong> These Terms of Service ("Terms") constitute a legally binding agreement between you
                  ("User", "Creator", "Client", "you", "your") and Nido, a company registered in
                  Brazil ("Nido", "we", "our", "us"), regarding the use of the {BRAND_DISPLAY_NAME} Platform
                  (&quot;{BRAND_DISPLAY_NAME}&quot;, &quot;Platform&quot;).
                </p>
                <p>
                  <strong>1.2.</strong> These Terms govern your access to and use of the website {BRAND_SITE_HOST}
                  {" "}and all related services provided by Nido.
                </p>
                <p>
                  <strong>1.3.</strong> The Platform connects brands and creators to execute Web3 marketing campaigns,
                  integrating performance ranking, on-chain payments, and cross-platform visibility across X
                  (Twitter), Instagram, and TikTok.
                </p>
                <p>
                  <strong>1.4.</strong> By accessing or using the Platform, you confirm that you have read, understood, and
                  agreed to these Terms and to our Privacy Policy.
                </p>
                <p>
                  <strong>1.5.</strong> If you do not agree with these Terms, you must not access or use the Platform.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                2. CONTACT INFORMATION
              </h2>
              <div className="space-y-2">
                <p>
                  <strong>Nido</strong>
                </p>
                <p>
                  Email:{" "}
                  <a href={BRAND_CONTACT_MAILTO} className="text-[var(--color-primary)] hover:underline">
                    {BRAND_CONTACT_EMAIL}
                  </a>
                </p>
                <p>
                  Website: <a href={`${BRAND_SITE_URL}/`} className="text-[var(--color-primary)] hover:underline">nido.global</a>
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                3. DESCRIPTION OF SERVICES
              </h2>
              <div className="space-y-3">
                <p>
                  <strong>3.1.</strong> The {BRAND_DISPLAY_NAME} Platform provides the following core services:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong>Campaign Management:</strong> brands ("Clients") can create and manage campaigns
                    targeting creators across X, Instagram, and TikTok.
                  </li>
                  <li>
                    <strong>Creator Participation:</strong> creators ("Users") can join campaigns, submit content, and
                    earn rewards in USDC {/* or USDT. */}
                  </li>
                  <li>
                    <strong>Performance Ranking:</strong> submissions are automatically analyzed using Nido'
                    proprietary metrics, combining on-chain and off-chain data.
                  </li>
                  <li>
                    <strong>Instant and Guaranteed Payments:</strong> once campaigns end, funds are distributed
                    according to the ranking and verification system.
                  </li>
                </ul>
                <p>
                  <strong>3.2.</strong> Nido acts as a technological intermediary and ranking provider. It does not
                  control the creative content of campaigns or influence the client's choice of winners but
                  guarantees payout enforcement based on campaign rules.
                </p>
                <p>
                  <strong>3.3.</strong> The Platform pre-validates every campaign request before publication to ensure
                  legitimacy, compliance with applicable law, and adherence to content standards.
                </p>
                <p>
                  <strong>3.4.</strong> Nido reserves the right to refuse or remove any campaign involving:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Pornographic or sexually explicit material;</li>
                  <li>Projects associated with scams, fraud, or deceptive financial schemes;</li>
                  <li>Any illegal, discriminatory, or harmful activity.</li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                4. ELIGIBILITY
              </h2>
              <div className="space-y-3">
                <p>
                  <strong>4.1.</strong> Users must:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Be at least 18 years old or of legal majority in their jurisdiction;</li>
                  <li>Have full legal capacity to enter into these Terms;</li>
                  <li>Possess a valid wallet address compatible with supported networks.</li>
                </ul>
                <p>
                  <strong>4.2.</strong> The Platform is available globally, except in countries where crypto-asset use is
                  explicitly prohibited by law.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                5. CAMPAIGN CREATION AND PAYMENT FLOW
              </h2>
              <div className="space-y-3">
                <p>
                  <strong>5.1.</strong> Before publishing a campaign, the Client must deposit the total reward amount (in
                  USDC {/* or USDT */}) to Nido through the {BRAND_DISPLAY_NAME} smart contract system.
                </p>
                <p>
                  <strong>5.2.</strong> After the campaign period ends, the Client has 3 to 7 days to confirm winners and
                  authorize payouts.
                </p>
                <p>
                  <strong>5.3.</strong> If the Client fails to process payments within this timeframe, Nido will
                  automatically distribute rewards to creators based on its internal ranking and validation
                  metrics.
                </p>
                <p>
                  <strong>5.4.</strong> Nido does not impose limits on the total campaign budget or on the maximum
                  earnings a creator may receive.
                </p>
                <p>
                  <strong>5.5.</strong> All payouts are processed via smart contracts and recorded on-chain for transparency.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                6. USER RESPONSIBILITIES
              </h2>
              <div className="space-y-3">
                <p>
                  <strong>6.1.</strong> Users agree to use the Platform lawfully and respectfully.
                </p>
                <p>
                  <strong>6.2.</strong> Users must not:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Submit plagiarized, illegal, or harmful content;</li>
                  <li>Use bots or automation to manipulate engagement metrics;</li>
                  <li>Interfere with platform algorithms or systems;</li>
                  <li>Impersonate other creators or falsify campaign data;</li>
                  <li>Attempt to reverse-engineer or resell any Platform feature.</li>
                </ul>
                <p>
                  <strong>6.3.</strong> Nido reserves the right to suspend or ban users violating these rules.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                7. CLIENT RESPONSIBILITIES
              </h2>
              <div className="space-y-3">
                <p>
                  <strong>7.1.</strong> Clients are solely responsible for campaign content, accuracy, and objectives.
                </p>
                <p>
                  <strong>7.2.</strong> Clients must ensure deposited funds are legitimate and compliant with applicable laws.
                </p>
                <p>
                  <strong>7.3.</strong> Nido is not liable for false, misleading, or unverified campaign statements by
                  clients.
                </p>
                <p>
                  <strong>7.4.</strong> Campaigns that fail verification will not be published or refunded until the issue is
                  resolved.
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                8. PAYMENTS AND REWARDS
              </h2>
              <div className="space-y-3">
                <p>
                  <strong>8.1.</strong> All payments are denominated in USDC {/* or USDT. */}
                </p>
                <p>
                  <strong>8.2.</strong> Rewards are distributed automatically to verified creator wallets after campaign closure.
                </p>
                <p>
                  <strong>8.3.</strong> Nido guarantees execution within 7 business days after campaign completion.
                </p>
                <p>
                  <strong>8.4.</strong> Nido does not provide fiat currency conversion or custody services.
                </p>
                <p>
                  <strong>8.5.</strong> The Platform is not responsible for failed payments due to incorrect wallet addresses,
                  network errors, or blockchain congestion.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                9. VALIDATION AND SECURITY
              </h2>
              <div className="space-y-3">
                <p>
                  <strong>9.1.</strong> Every campaign undergoes an internal validation process to assess legitimacy, safety,
                  and compliance with these Terms.
                </p>
                <p>
                  <strong>9.2.</strong> Nido uses a hybrid verification system combining algorithmic detection and
                  manual review to identify fraudulent activity or bot submissions.
                </p>
                <p>
                  <strong>9.3.</strong> Any violation of integrity standards may result in account suspension and fund retention
                  for investigation.
                </p>
              </div>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                10. DATA PROCESSING AND PRIVACY
              </h2>
              <div className="space-y-3">
                <p>
                  <strong>10.1.</strong> The Platform collects and processes:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Public wallet addresses;</li>
                  <li>Connected social media profiles (X, Instagram, TikTok);</li>
                  <li>Basic engagement data (views, likes, shares, comments).</li>
                </ul>
                <p>
                  <strong>10.2.</strong> Data is processed according to GDPR principles and relevant international privacy
                  regulations.
                </p>
                <p>
                  <strong>10.3.</strong> Users may request disconnection or deletion of their data by emailing{" "}
                  <a href={BRAND_CONTACT_MAILTO} className="text-[var(--color-primary)] hover:underline">{BRAND_CONTACT_EMAIL}</a>.
                </p>
              </div>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                11. INTELLECTUAL PROPERTY
              </h2>
              <div className="space-y-3">
                <p>
                  <strong>11.1.</strong> All intellectual property related to the Platform, its technology, algorithms, and branding
                  belong exclusively to Nido LTDA.
                </p>
                <p>
                  <strong>11.2.</strong> Creators retain ownership of their submitted content but grant Nido and
                  campaign Clients a non-exclusive, royalty-free license to use, display, and promote
                  content for marketing and analytical purposes.
                </p>
                <p>
                  <strong>11.3.</strong> Unauthorized reproduction, resale, or modification of Platform assets is strictly
                  prohibited.
                </p>
              </div>
            </section>

            {/* Section 12 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                12. LIMITATION OF LIABILITY
              </h2>
              <div className="space-y-3">
                <p>
                  <strong>12.1.</strong> The Platform is provided "as is" and "as available".
                </p>
                <p>
                  <strong>12.2.</strong> Nido is not responsible for:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>The outcome or performance of campaigns;</li>
                  <li>Blockchain or network failures;</li>
                  <li>Delays caused by third-party platforms (e.g. X, Instagram, TikTok);</li>
                  <li>Any loss of funds or data not directly caused by its systems.</li>
                </ul>
                <p>
                  <strong>12.3.</strong> The maximum aggregate liability of Nido shall not exceed $1,000 USD
                  per user per year.
                </p>
              </div>
            </section>

            {/* Section 13 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                13. TERMINATION
              </h2>
              <div className="space-y-3">
                <p>
                  <strong>13.1.</strong> Users may terminate this agreement at any time by discontinuing use of the Platform.
                </p>
                <p>
                  <strong>13.2.</strong> Nido may suspend or terminate access immediately if:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>The user violates these Terms;</li>
                  <li>Fraudulent or suspicious activity is detected;</li>
                  <li>Required by law or competent authority.</li>
                </ul>
              </div>
            </section>

            {/* Section 14 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                14. GOVERNING LAW AND DISPUTES
              </h2>
              <div className="space-y-3">
                <p>
                  <strong>14.1.</strong> These Terms shall be governed by applicable international law unless mandatory
                  local regulations state otherwise.
                </p>
                <p>
                  <strong>14.2.</strong> Any disputes shall first be addressed through good-faith negotiation.
                </p>
                <p>
                  <strong>14.3.</strong> If unresolved, disputes shall be submitted to competent jurisdiction as determined by
                  applicable law.
                </p>
              </div>
            </section>

            {/* Section 15 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                15. AMENDMENTS
              </h2>
              <div className="space-y-3">
                <p>
                  <strong>15.1.</strong> Nido may update these Terms for operational, legal, or compliance reasons.
                </p>
                <p>
                  <strong>15.2.</strong> Users will be notified through the Platform; continued use constitutes acceptance of
                  the new Terms.
                </p>
              </div>
            </section>

            {/* Section 16 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                16. FINAL PROVISIONS
              </h2>
              <div className="space-y-3">
                <p>
                  <strong>16.1.</strong> Nothing in these Terms establishes partnership, employment, or agency between
                  Nido and Users.
                </p>
                <p>
                  <strong>16.2.</strong> If any clause is deemed invalid, the remaining provisions remain in full force.
                </p>
                <p>
                  <strong>16.3.</strong> These Terms represent the entire agreement between Nido and the User
                  {` regarding the use of the ${BRAND_DISPLAY_NAME} Platform.`}
                </p>
              </div>
            </section>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-gray-700">
              <p className="text-gray-400 text-sm">
                Last updated: {new Date().toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                For questions about these Terms, please contact us at{" "}
                <a href={BRAND_CONTACT_MAILTO} className="text-[var(--color-primary)] hover:underline">
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

