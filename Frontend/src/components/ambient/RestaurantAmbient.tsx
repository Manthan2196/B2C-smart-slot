import { motion } from 'framer-motion'

type AmbientProps = {
  theme?: 'light' | 'dark'
  className?: string
}

export default function RestaurantAmbient({ theme = 'light', className = '' }: AmbientProps) {
  const steamColor = theme === 'dark' ? 'rgba(251, 146, 60, 0.16)' : 'rgba(249, 115, 22, 0.18)'
  const glowColor = theme === 'dark' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(251, 191, 36, 0.14)'

  return (
    <div className={`ambient ambient-restaurant ${className}`} aria-hidden="true">
      <motion.div
        className="ambient-steam ambient-steam-1"
        animate={{ y: [0, -22, 0] }}
        transition={{ repeat: Infinity, duration: 9.4, ease: 'easeInOut' }}
        style={{ background: steamColor }}
      />
      <motion.div
        className="ambient-steam ambient-steam-2"
        animate={{ y: [0, -28, 0] }}
        transition={{ repeat: Infinity, duration: 11, ease: 'easeInOut' }}
        style={{ background: glowColor }}
      />
      <motion.div
        className="ambient-particle ambient-particle-1"
        animate={{ opacity: [0.12, 0.28, 0.12], y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 8.8, ease: 'easeInOut' }}
      />
      <motion.div
        className="ambient-particle ambient-particle-2"
        animate={{ opacity: [0.08, 0.22, 0.08], y: [0, 6, 0] }}
        transition={{ repeat: Infinity, duration: 10.2, ease: 'easeInOut' }}
      />
    </div>
  )
}
