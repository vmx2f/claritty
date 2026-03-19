'use client'

import { useTheme } from 'next-themes'

export default function ThemeSwitch() {
  const { setTheme, resolvedTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <button className='btn btn-reverse' onClick={toggleTheme}>
      {resolvedTheme === 'dark' ? '✶' : '⚆'}
    </button>
  )
}