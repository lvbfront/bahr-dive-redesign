import { Component, type ErrorInfo, type ReactNode } from 'react'
import { EMAIL } from '../../content/en'

type Props = { children: ReactNode; fallback: ReactNode; onError?: () => void }
type State = { failed: boolean; retried: boolean }

/**
 * Never a blank page: on a render/commit error we first remount the subtree once (most animation/DOM glitches
 * recover), and if it fails again we show a calm static fallback with the essentials.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false, retried: false }

  static getDerivedStateFromError(): Partial<State> {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn('[bahr] recovered from a render error', error, info.componentStack)
    this.props.onError?.()
    if (!this.state.retried) {
      // one automatic retry on the next frame
      requestAnimationFrame(() => this.setState({ failed: false, retried: true }))
    }
  }

  render() {
    if (this.state.failed) return this.state.retried ? this.props.fallback : null
    return this.props.children
  }
}

export function StaticFallback({ title, line, cta }: { title: string; line: string; cta: string }) {
  return (
    <main className="flex min-h-[100svh] flex-col justify-center gap-8 bg-surface px-[var(--gutter)] text-ink">
      <p className="font-display text-xl font-extrabold" lang="en" dir="ltr">
        BAHR<span className="text-glow">.</span>
      </p>
      <h1 className="font-display max-w-[16ch] text-[clamp(2.4rem,7vw,6rem)] leading-[1] font-bold">{title}</h1>
      <p className="max-w-[44ch] text-lg">{line}</p>
      <div className="flex flex-wrap gap-4">
        <a href={`mailto:${EMAIL}`} className="rounded-full bg-glow px-6 py-3 font-medium text-white" dir="ltr">
          {EMAIL}
        </a>
        <button type="button" onClick={() => window.location.reload()} className="rounded-full border border-current px-6 py-3">
          {cta}
        </button>
      </div>
    </main>
  )
}
