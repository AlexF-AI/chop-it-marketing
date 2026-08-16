import type { Metadata } from 'next';

import LegalLayout from '../components/LegalLayout';

export const metadata: Metadata = {
  title: 'Support | Chop it',
  description: 'Get help with the Chop it app — contact us, common questions, billing, and account issues.',
  alternates: { canonical: 'https://chop-it.com/support' },
  robots: { index: true, follow: true },
};

export default function SupportPage() {
  return (
    <LegalLayout title="Support" lastUpdated="21 July 2026">
      <h2>Contact us</h2>
      <p>
        Email <a href="mailto:hello@chop-it.com">hello@chop-it.com</a> and
        we&rsquo;ll get back to you within 2 business days. Include the email
        address linked to your Chop it account so we can find you faster.
      </p>

      <h2>Common questions</h2>

      <h3>The app isn&rsquo;t working properly</h3>
      <ul>
        <li>Make sure you&rsquo;re on the latest version from the App Store</li>
        <li>Force-quit the app and reopen it</li>
        <li>
          Still stuck? Email us with your device model, iOS version, and what
          you were doing when it went wrong
        </li>
      </ul>

      <h3>Subscriptions and billing</h3>
      <p>
        Subscriptions are billed through your App Store account. To manage or
        cancel, open Settings on your device &rarr; your name &rarr;
        Subscriptions &rarr; Chop it. Refunds are handled by Apple &mdash; you
        can request one at{' '}
        <a href="https://reportaproblem.apple.com" target="_blank" rel="noopener noreferrer">
          reportaproblem.apple.com
        </a>
        .
      </p>

      <h3>Deleting your account</h3>
      <p>
        You can delete your account and all associated data from within the
        app. See <a href="/data-deletion">how to delete your account</a> for
        the full steps and what gets removed.
      </p>

      <h3>Your data and privacy</h3>
      <p>
        Our <a href="/privacy">Privacy Policy</a> explains what we collect and
        why. For anything privacy-related, email{' '}
        <a href="mailto:hello@chop-it.com">hello@chop-it.com</a>.
      </p>

      <h2>Feedback and feature requests</h2>
      <p>
        We read everything. If something&rsquo;s missing or could work better,
        tell us at <a href="mailto:hello@chop-it.com">hello@chop-it.com</a>.
      </p>
    </LegalLayout>
  );
}
