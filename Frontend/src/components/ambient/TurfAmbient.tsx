import { motion } from 'framer-motion'

type AmbientProps = {
  theme?: 'light' | 'dark'
  className?: string
}

export default function TurfAmbient({ theme = 'light', className = '' }: AmbientProps) {
  const lineColor = theme === 'dark' ? 'rgba(34, 197, 94, 0.14)' : 'rgba(52, 211, 153, 0.16)'
  const pulseColor = theme === 'dark' ? 'rgba(34, 211, 238, 0.08)' : 'rgba(56, 189, 248, 0.1)'

  return (
    <div className={`ambient ambient-turf ${className}`} aria-hidden="true">
      <motion.div
        className="ambient-flow ambient-flow-1"
        animate={{ x: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 12, ease: 'easeInOut' }}
        style={{ background: lineColor }}
      />
      <motion.div
        className="ambient-flow ambient-flow-2"
        animate={{ x: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 14, ease: 'easeInOut' }}
        style={{ background: pulseColor }}
      />
      <motion.div
        className="ambient-dot ambient-dot-1"
        animate={{ opacity: [0.08, 0.2, 0.08], y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
      />
      <motion.div
        className="ambient-dot ambient-dot-2"
        animate={{ opacity: [0.1, 0.24, 0.1], y: [0, 6, 0] }}
        transition={{ repeat: Infinity, duration: 11, ease: 'easeInOut' }}
      />
    </div>
  )
}
