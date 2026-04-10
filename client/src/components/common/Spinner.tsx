import styles from './Spinner.module.css'

interface Props { fullPage?: boolean; size?: number }

export default function Spinner({ fullPage, size = 32 }: Props) {
  const el = (
    <div className={styles.spinner} style={{ width: size, height: size, borderWidth: size / 10 }} />
  )
  if (fullPage) return <div className={styles.fullPage}>{el}</div>
  return el
}
