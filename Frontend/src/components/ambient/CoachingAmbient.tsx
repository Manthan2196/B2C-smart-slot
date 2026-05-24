import { motion } from 'framer-motion'

type AmbientProps = {
  theme?: 'light' | 'dark'
  className?: string
}

export default function CoachingAmbient({ theme = 'light', className = '' }: AmbientProps) {
  const nodeColor = theme === 'dark' ? 'rgba(129, 140, 248, 0.16)' : 'rgba(99, 102, 241, 0.18)'
  const orbitColor = theme === 'dark' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(167, 139, 250, 0.14)'

  return (
    <div className={`ambient ambient-coaching ${className}`} aria-hidden="true">
      <motion.div
        className="ambient-node ambient-node-1"
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
        style={{ background: nodeColor }}
      />
      <motion.div
        className="ambient-node ambient-node-2"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 12, ease: 'easeInOut' }}
        style={{ background: orbitColor }}
      />
      <motion.div
        className="ambient-orbit"
        animate={{ rotate: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 24, ease: 'linear' }}
      />
    </div>
  )
}
