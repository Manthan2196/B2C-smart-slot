import { motion } from 'framer-motion'

type AmbientProps = {
  theme?: 'light' | 'dark'
  className?: string
}

export default function GymAmbient({ theme = 'light', className = '' }: AmbientProps) {
  const ringColor = theme === 'dark' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(79, 70, 229, 0.18)'
  const streakColor = theme === 'dark' ? 'rgba(96, 165, 250, 0.14)' : 'rgba(59, 130, 246, 0.16)'

  return (
    <div className={`ambient ambient-gym ${className}`} aria-hidden="true">
      <motion.div
        className="ambient-ring ambient-ring-large"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 42, ease: 'linear' }}
        style={{ borderColor: ringColor }}
      />
      <motion.div
        className="ambient-ring ambient-ring-small"
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 32, ease: 'linear' }}
        style={{ borderColor: streakColor }}
      />
      <motion.div
        className="ambient-streak ambient-streak-1"
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 5.2, ease: 'easeInOut' }}
        style={{ background: streakColor }}
      />
      <motion.div
        className="ambient-streak ambient-streak-2"
        animate={{ y: [0, 4, 0] }}
        transition={{ repeat: Infinity, duration: 6.2, ease: 'easeInOut' }}
        style={{ background: ringColor }}
      />
    </div>
  )
}
