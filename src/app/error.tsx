'use client'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-4">
      <div className="text-5xl">😬</div>
      <h2 className="text-2xl font-bold">Something went wrong</h2>
      <p className="text-white/40 text-sm max-w-xs">{error.message}</p>
      <div className="flex gap-3 mt-2">
        <button onClick={reset} className="btn-primary px-6 py-3 text-base">Try again</button>
        <a href="/" className="btn-secondary px-6 py-3 text-base">Home</a>
      </div>
    </div>
  )
}
