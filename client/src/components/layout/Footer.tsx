import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <span className={styles.logo}>⬡ Shop<span>Hub</span></span>
          <p>Your premium marketplace for everything you need.</p>
        </div>
        <div className={styles.links}>
          <div className={styles.col}>
            <h4>Shop</h4>
            <Link to="/products">All Products</Link>
            <Link to="/products?sort=most_sold">Best Sellers</Link>
            <Link to="/products/discounted">Deals</Link>
          </div>
          <div className={styles.col}>
            <h4>Account</h4>
            <Link to="/profile">Profile</Link>
            <Link to="/orders">My Orders</Link>
            <Link to="/wishlist">Wishlist</Link>
          </div>
          <div className={styles.col}>
            <h4>Sell</h4>
            <Link to="/register?role=seller">Become a Seller</Link>
            <Link to="/dashboard">Seller Dashboard</Link>
          </div>
        </div>
      </div>
      <div className={styles.bottom}>
        <span>© {new Date().getFullYear()} ShopHub. All rights reserved.</span>
      </div>
    </footer>
  )
}
