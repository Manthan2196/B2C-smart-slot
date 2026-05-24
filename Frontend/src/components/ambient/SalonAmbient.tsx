import { motion } from 'framer-motion'

type AmbientProps = {
  theme?: 'light' | 'dark'
  className?: string
}

export default function SalonAmbient({ theme = 'light', className = '' }: AmbientProps) {
  const waveColor = theme === 'dark' ? 'rgba(249, 115, 221, 0.12)' : 'rgba(251, 207, 232, 0.18)'
  const shimmerColor = theme === 'dark' ? 'rgba(251, 191, 36, 0.08)' : 'rgba(251, 191, 36, 0.14)'

  return (
    <div className={`ambient ambient-salon ${className}`} aria-hidden="true">
      <motion.div
        className="ambient-wave ambient-wave-1"
        animate={{ x: [0, -12, 0] }}
        transition={{ repeat: Infinity, duration: 14, ease: 'easeInOut' }}
        style={{ background: waveColor }}
      />
      <motion.div
        className="ambient-wave ambient-wave-2"
        animate={{ x: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 16, ease: 'easeInOut' }}
        style={{ background: shimmerColor }}
      />
      <motion.div
        className="ambient-shimmer ambient-shimmer-1"
        animate={{ opacity: [0.06, 0.2, 0.06], y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
      />
      <motion.div
        className="ambient-shimmer ambient-shimmer-2"
        animate={{ opacity: [0.08, 0.22, 0.08], x: [0, 6, 0] }}
        transition={{ repeat: Infinity, duration: 9.2, ease: 'easeInOut' }}
      />
    </div>
  )
}
