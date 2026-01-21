function MessageBanner({ message, type = 'info', onClose }) {
  if (!message) return null

  const styles = {
    success: 'bg-green-50 border-green-200 text-green-700',
    error: 'bg-red-50 border-red-200 text-red-600',
    info: 'bg-blue-50 border-blue-200 text-blue-600',
  }

  return (
    <div className={`${styles[type]} border rounded-xl px-4 py-3 mb-6 flex items-center justify-between animate-fade-in`}>
      <p className="font-medium text-sm">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 text-current opacity-60 hover:opacity-100 transition-opacity"
        >
          ×
        </button>
      )}
    </div>
  )
}

export default MessageBanner
