import { motion, AnimatePresence } from 'motion/react'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'
import { useToast } from '../../context/ToastContext'

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info
}

const colors = {
  success: 'var(--color-success)',
  error: 'var(--color-error)',
  info: 'var(--color-info)'
}

export default function ToastContainer() {
  const { toasts } = useToast()

  return (
    <div className="toast-container">
      <AnimatePresence>
        {toasts.map(toast => {
          const Icon = icons[toast.type] || Info
          return (
            <motion.div
              key={toast.id}
              className={`toast toast-${toast.type}`}
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <Icon size={18} style={{ color: colors[toast.type], flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{toast.message}</span>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
