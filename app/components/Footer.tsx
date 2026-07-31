import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="wordmark">
            <Image
              src="/logo.webp"
              alt=""
              width={36}
              height={36}
              className="wordmark-logo wordmark-logo-lg"
            />
            Chop&nbsp;it
          </div>
          <div className="footer-tag">The home of AI cooking.</div>
        </div>
        <div className="footer-col">
          <div className="footer-col-h mono">Product</div>
          <Link href="/#ai-chef">AI Chef</Link>
          <Link href="/#chatgpt">The ChatGPT plug-in</Link>
          <Link href="/recipes">Recipes</Link>
          <Link href="/#download">Get the app</Link>
        </div>
        <div className="footer-col">
          <div className="footer-col-h mono">Company</div>
          <Link href="/blog">Blog</Link>
          <Link href="/method">Our method</Link>
          <a href="mailto:hello@chop-it.com">Contact</a>
          <a href="/support">Support</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/data-deletion">Data deletion</a>
        </div>
        <div className="footer-col">
          <div className="footer-col-h mono">Social</div>
          <a href="https://www.tiktok.com/@chop_it" target="_blank" rel="noopener noreferrer">
            TikTok · @chop_it
          </a>
        </div>
      </div>
      <div className="footer-base">
        <span className="mono">© 2026 Chop It AI Ltd · chop-it.com</span>
        <span className="mono">Made for UK kitchens</span>
      </div>
    </footer>
  );
}
