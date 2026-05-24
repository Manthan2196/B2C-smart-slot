import { motion } from 'framer-motion'

type AmbientProps = {
  theme?: 'light' | 'dark'
  className?: string
}

export default function ClinicAmbient({ theme = 'light', className = '' }: AmbientProps) {
  const pulseColor = theme === 'dark' ? 'rgba(34, 211, 238, 0.14)' : 'rgba(45, 212, 191, 0.16)'
  const gridColor = theme === 'dark' ? 'rgba(148, 163, 184, 0.08)' : 'rgba(148, 163, 184, 0.12)'

  return (
    <div className={`ambient ambient-clinic ${className}`} aria-hidden="true">
      <motion.div
        className="ambient-waveform"
        animate={{ x: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 14, ease: 'easeInOut' }}
        style={{ background: pulseColor }}
      />
      <motion.div
        className="ambient-grid ambient-grid-1"
        animate={{ opacity: [0.08, 0.18, 0.08] }}
        transition={{ repeat: Infinity, duration: 11, ease: 'easeInOut' }}
        style={{ background: gridColor }}
      />
      <motion.div
        className="ambient-grid ambient-grid-2"
        animate={{ opacity: [0.1, 0.22, 0.1] }}
        transition={{ repeat: Infinity, duration: 12.6, ease: 'easeInOut' }}
        style={{ background: gridColor }}
      />
    </div>
  )
}
