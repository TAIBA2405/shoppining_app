import { Link } from 'react-router-dom'
import { Instagram, Facebook, Twitter, Youtube, Mail } from 'lucide-react'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="footer-grid">
        {/* Brand Column */}
        <div className="footer-brand">
          <Link to="/" className="navbar-logo">
            <span>STYLE</span>VERSE
          </Link>
          <p>Your one-stop destination for premium fashion. Shop the latest trends for Men, Women & Kids at unbeatable prices.</p>
          <div className="footer-social">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <Instagram size={18} />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <Facebook size={18} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <Twitter size={18} />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <Youtube size={18} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-col">
          <h4>Shop</h4>
          <ul>
            <li><Link to="/category/men">Men's Fashion</Link></li>
            <li><Link to="/category/women">Women's Fashion</Link></li>
            <li><Link to="/category/kids">Kids' Fashion</Link></li>
            <li><Link to="/category/all?sort=newest">New Arrivals</Link></li>
            <li><Link to="/category/all?sort=discount">Best Deals</Link></li>
          </ul>
        </div>

        {/* Customer Service */}
        <div className="footer-col">
          <h4>Help</h4>
          <ul>
            <li><Link to="/account/orders">Track Order</Link></li>
            <li><Link to="/cart">Shopping Cart</Link></li>
            <li><Link to="/wishlist">Wishlist</Link></li>
            <li><a href="#">Return Policy</a></li>
            <li><a href="#">FAQs</a></li>
            <li><a href="#">Contact Us</a></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="footer-col">
          <h4>Stay Updated</h4>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
            Get exclusive offers and new arrival alerts straight to your inbox.
          </p>
          <div className="footer-newsletter">
            <form className="footer-newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Your email" />
              <button type="submit">
                <Mail size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <p>© 2026 StyleVerse. All rights reserved. Made with ❤️ in India.</p>
        <div className="footer-payments">
          <span>UPI</span>
          <span>COD</span>
          <span>Visa</span>
          <span>Mastercard</span>
          <span>RuPay</span>
        </div>
      </div>
    </footer>
  )
}
