import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, Trash2, ArrowLeft } from 'lucide-react'
import { productApi } from '../api'
import type { ProductCategory, ProductVariant } from '../types'
import { getErrorMessage } from '../utils'
import toast from 'react-hot-toast'
import styles from './ProductForm.module.css'

const CATEGORIES: ProductCategory[] = [
  'electronics','clothing','books','home','sports','beauty',
  'toys','food','automotive','garden','health','jewelry',
  'music','office','pets','tools','other',
]

const emptyVariant = (): ProductVariant => ({ stock: 0, color: '', size: '', price: undefined })

export default function ProductFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id?: string }>()
  const isEdit = Boolean(id)

  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(isEdit)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<ProductCategory>('other')
  const [basePrice, setBasePrice] = useState('')
  const [discountPct, setDiscountPct] = useState('')
  const [discountExpiry, setDiscountExpiry] = useState('')
  const [variants, setVariants] = useState<ProductVariant[]>([emptyVariant()])
  const [images, setImages] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])

  useEffect(() => {
    if (!isEdit) return
    productApi.getOne(Number(id)).then(r => {
      const p = r.data.product
      setName(p.name)
      setDescription(p.description)
      setCategory(p.category)
      setBasePrice(String(p.base_price))
      setDiscountPct(p.discount_percentage ? String(p.discount_percentage) : '')
      setDiscountExpiry(p.discount_expiry ? p.discount_expiry.slice(0, 10) : '')
      setVariants(p.variants.length ? p.variants : [emptyVariant()])
      setExistingImages(p.images)
    }).catch(() => { toast.error('Product not found'); navigate('/dashboard') })
    .finally(() => setFetchLoading(false))
  }, [id])

  const updateVariant = (i: number, field: keyof ProductVariant, value: string | number) => {
    setVariants(prev => prev.map((v, idx) => idx === i ? { ...v, [field]: value } : v))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!variants.length) { toast.error('Add at least one variant'); return }

    const fd = new FormData()
    fd.append('name', name)
    fd.append('description', description)
    fd.append('category', category)
    fd.append('base_price', basePrice)
    if (discountPct) fd.append('discount_percentage', discountPct)
    if (discountExpiry) fd.append('discount_expiry', new Date(discountExpiry).toISOString())
    fd.append('variants', JSON.stringify(variants.map(v => ({
      ...v,
      price: v.price ? Number(v.price) : undefined,
      stock: Number(v.stock),
    }))))
    images.forEach(f => fd.append('images', f))

    setLoading(true)
    try {
      if (isEdit) {
        await productApi.update(Number(id), fd)
        toast.success('Product updated!')
      } else {
        await productApi.create(fd)
        toast.success('Product created!')
      }
      navigate('/dashboard')
    } catch (e) { toast.error(getErrorMessage(e)) }
    finally { setLoading(false) }
  }

  if (fetchLoading) return <div style={{ padding: 64, textAlign: 'center' }}><span className="spinner" /></div>

  return (
    <div className="page-enter">
      <div className="container">
        <button className={styles.back} onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        <h1 className={styles.title}>{isEdit ? 'Edit Product' : 'New Product'}</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.grid}>
            {/* Left */}
            <div className={styles.left}>
              <div className="card">
                <h2 className={styles.sectionTitle}>Basic Info</h2>
                <div className={styles.fields}>
                  <div className="form-group">
                    <label className="form-label">Product Name *</label>
                    <input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Wireless Headphones" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description *</label>
                    <textarea required rows={5} value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your product in detail…"
                      style={{ resize: 'vertical', width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontFamily: 'var(--font-main)', fontSize: '0.95rem', outline: 'none' }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select required value={category} onChange={e => setCategory(e.target.value as ProductCategory)}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="card">
                <h2 className={styles.sectionTitle}>Pricing & Discount</h2>
                <div className={styles.priceGrid}>
                  <div className="form-group">
                    <label className="form-label">Base Price (USD) *</label>
                    <input required type="number" min="0" step="0.01" value={basePrice} onChange={e => setBasePrice(e.target.value)} placeholder="0.00" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Discount % (optional)</label>
                    <input type="number" min="0" max="100" step="0.01" value={discountPct} onChange={e => setDiscountPct(e.target.value)} placeholder="e.g. 15" />
                  </div>
                  <div className={`form-group ${styles.fullWidth}`}>
                    <label className="form-label">Discount Expiry (optional)</label>
                    <input type="date" value={discountExpiry} onChange={e => setDiscountExpiry(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            {/* Right */}
            <div className={styles.right}>
              <div className="card">
                <h2 className={styles.sectionTitle}>Images</h2>
                {existingImages.length > 0 && (
                  <div className={styles.existingImages}>
                    {existingImages.map((img, i) => (
                      <div key={i} className={styles.existingImg}>
                        <img src={img} alt={`Image ${i+1}`} />
                      </div>
                    ))}
                  </div>
                )}
                <input type="file" multiple accept="image/*"
                  onChange={e => setImages(Array.from(e.target.files ?? []))}
                  style={{ marginTop: existingImages.length ? 12 : 0 }} />
                <p className={styles.hint}>
                  {isEdit ? 'Upload new images to replace existing ones.' : 'Upload up to 10 images.'} Max 5MB each.
                </p>
              </div>

              <div className="card">
                <div className={styles.variantsHeader}>
                  <h2 className={styles.sectionTitle}>Variants *</h2>
                  <button type="button" className="btn btn-secondary btn-sm"
                    onClick={() => setVariants(v => [...v, emptyVariant()])}>
                    <Plus size={14} /> Add
                  </button>
                </div>
                <div className={styles.variants}>
                  {variants.map((v, i) => (
                    <div key={i} className={styles.variantRow}>
                      <span className={styles.variantNum}>{i + 1}</span>
                      <input placeholder="Color" value={v.color ?? ''} onChange={e => updateVariant(i, 'color', e.target.value)} />
                      <input placeholder="Size" value={v.size ?? ''} onChange={e => updateVariant(i, 'size', e.target.value)} />
                      <input type="number" placeholder="Price (override)" min="0" step="0.01"
                        value={v.price ?? ''} onChange={e => updateVariant(i, 'price', e.target.value)} />
                      <input type="number" placeholder="Stock *" min="0" required
                        value={v.stock} onChange={e => updateVariant(i, 'stock', Number(e.target.value))} />
                      {variants.length > 1 && (
                        <button type="button" className={styles.removeVariant}
                          onClick={() => setVariants(prev => prev.filter((_, idx) => idx !== i))}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <p className={styles.hint}>Price override is optional — falls back to base price.</p>
              </div>
            </div>
          </div>

          <div className={styles.submitRow}>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/dashboard')}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? <><span className="spinner" /> Saving…</> : isEdit ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
