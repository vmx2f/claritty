"use client";

import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'

export default function ThemeSwitch() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <button className='btn btn-reverse' onClick={toggleTheme}>
      {mounted ? (resolvedTheme === 'dark' ? '✶' : '⚆') : '⚆'}
    </button>
  )
}