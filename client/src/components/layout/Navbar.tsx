import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Heart, User, Search, Menu, X, Package, LogOut, Settings, ChevronDown } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { authApi } from '../../api'
import toast from 'react-hot-toast'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) navigate(`/products?search=${encodeURIComponent(search.trim())}`)
  }

  const handleLogout = async () => {
    try { await authApi.logout() } catch {}
    logout()
    toast.success('Logged out')
    navigate('/')
  }

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>⬡</span>
          <span className={styles.logoText}>Shop<span className={styles.logoAccent}>Hub</span></span>
        </Link>

        {/* Search */}
        <form className={styles.searchForm} onSubmit={handleSearch}>
          <input
            className={styles.searchInput}
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className={styles.searchBtn} type="submit">
            <Search size={16} />
          </button>
        </form>

        {/* Actions */}
        <div className={styles.actions}>
          {isAuthenticated ? (
            <>
              <Link to="/wishlist" className={styles.iconBtn} title="Wishlist">
                <Heart size={20} />
              </Link>
              <Link to="/cart" className={styles.iconBtn} title="Cart">
                <ShoppingCart size={20} />
              </Link>
              <div className={styles.userMenu}>
                <button
                  className={styles.userBtn}
                  onClick={() => setDropdownOpen(v => !v)}
                >
                  <div className={styles.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
                  <span className={styles.userName}>{user?.name?.split(' ')[0]}</span>
                  <ChevronDown size={14} />
                </button>
                {dropdownOpen && (
                  <div className={styles.dropdown} onMouseLeave={() => setDropdownOpen(false)}>
                    <div className={styles.dropdownHeader}>
                      <span className={styles.dropdownName}>{user?.name}</span>
                      <span className={`badge badge-accent ${styles.roleBadge}`}>{user?.role}</span>
                    </div>
                    <hr className={styles.dropdownDivider} />
                    <Link to="/profile" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                      <User size={15} /> Profile
                    </Link>
                    <Link to="/orders" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                      <Package size={15} /> My Orders
                    </Link>
                    {(user?.role === 'seller' || user?.role === 'admin') && (
                      <Link to="/dashboard" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                        <Settings size={15} /> Dashboard
                      </Link>
                    )}
                    <hr className={styles.dropdownDivider} />
                    <button className={`${styles.dropdownItem} ${styles.logoutBtn}`} onClick={handleLogout}>
                      <LogOut size={15} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          )}
          <button className={styles.mobileMenu} onClick={() => setMenuOpen(v => !v)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className={styles.mobileNav}>
          <form onSubmit={handleSearch} className={styles.mobileSearch}>
            <input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
            <button type="submit"><Search size={16} /></button>
          </form>
          <Link to="/products" onClick={() => setMenuOpen(false)}>All Products</Link>
          {isAuthenticated ? (
            <>
              <Link to="/cart" onClick={() => setMenuOpen(false)}>Cart</Link>
              <Link to="/wishlist" onClick={() => setMenuOpen(false)}>Wishlist</Link>
              <Link to="/orders" onClick={() => setMenuOpen(false)}>My Orders</Link>
              <Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Sign In</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
