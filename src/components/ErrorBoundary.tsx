'use client'
import React from 'react'

interface Props { children: React.ReactNode; fallback?: React.ReactNode }
interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center p-8 max-w-md">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Что-то пошло не так</h2>
            <p className="text-gray-500 mb-6">{this.state.error?.message || 'Произошла ошибка. Попробуйте обновить страницу.'}</p>
            <button
              onClick={() => { this.setState({ hasError: false }); window.location.reload() }}
              className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition"
            >
              Обновить страницу
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
