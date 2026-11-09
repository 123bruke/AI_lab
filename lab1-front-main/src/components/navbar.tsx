'use client'

import { useEffect, useState } from "react"
import Logo from "./logo"
import Link from "next/link"
import { Sun, Moon, AlignJustify, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const settings = {
  navLinks: [
    { name: 'features', href: '#features' },
    { name: 'pricing', href: '#pricing' },
    { name: 'testimonials', href: '#testimonials' },
    { name: 'FAQ', href: '#faq' },
  ],
  cta: {
    content: 'Virtual Lab',
    href: 'https://ai-lab-main1-9vlh.vercel.app/?view=lab'
  }
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [isDark, setIsDark] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    window.localStorage.removeItem("afrolab-theme")
    document.documentElement.classList.remove("theme-dark")
    setIsDark(false)
  }, [])

  const toggleTheme = () => {
    const dark = !isDark
    document.documentElement.classList.toggle("theme-dark", dark)
    setIsDark(dark)
  }

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggedIn(true)
    setIsLoginOpen(false)
  }

  return (
    <>
      <nav className="w-full h-fit py-4 flex items-center justify-between relative z-50">
        {/* Logo - only logo icon as requested */}
        <Link href='/' title="AFRO Lab" id="Logo" className="flex items-center gap-2.5">
          <Logo />
          <span className="font-semibold text-lg tracking-tight text-neutral-900 dark:text-white">
            AFRO Lab
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="items-center justify-center gap-5 hidden md:flex">
          {/* Nav Links */}
          <ul className="flex items-center justify-center gap-6 text-neutral-800 dark:text-neutral-200 font-medium select-none text-sm">
            {settings.navLinks.map(link => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  title={link.name}
                  className="rounded-full px-3 py-1.5 transition-colors capitalize hover:text-black dark:hover:text-white"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>

          {/* Clean White Login Button */}
          {isLoggedIn ? (
            <button
              type="button"
              onClick={() => setIsLoggedIn(false)}
              className="rounded-full bg-white text-black px-5 py-2 text-xs font-semibold shadow-sm hover:bg-neutral-100 transition-all border border-neutral-200 dark:border-neutral-700"
            >
              Sign Out
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsLoginOpen(true)}
              className="rounded-full bg-white text-black px-5 py-2 text-xs font-semibold shadow-sm hover:bg-neutral-100 transition-all border border-neutral-200 dark:border-neutral-700 hover:scale-[1.02] active:scale-[0.98]"
            >
              Sign In
            </button>
          )}

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
            title={`Switch to ${isDark ? "light" : "dark"} mode`}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white/70 text-neutral-800 transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>

        {/* Mobile menu trigger */}
        <div className="ml-auto flex items-center gap-2.5 md:hidden">
          {/* Clean White Login Button on mobile */}
          <button
            type="button"
            onClick={() => setIsLoginOpen(true)}
            className="rounded-full bg-white text-black px-4 py-1.5 text-xs font-semibold shadow-sm hover:bg-neutral-100 transition-all border border-neutral-200"
          >
            {isLoggedIn ? 'Sign Out' : 'Sign In'}
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-800"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full text-black dark:text-white"
            onClick={toggleMenu}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {!isOpen ? <AlignJustify size={20} /> : <X size={20} />}
          </button>
        </div>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="fixed top-16 left-0 w-full bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 p-6 z-50 md:hidden"
            >
              <ul className="flex flex-col space-y-3 text-black dark:text-white font-medium text-base mb-4">
                {settings.navLinks.map(link => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      onClick={toggleMenu}
                      className="block py-1 capitalize"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href={settings.cta.href}
                    onClick={toggleMenu}
                    className="block py-1.5 font-semibold text-emerald-500 hover:text-emerald-400"
                  >
                    Launch Virtual Lab ↗
                  </Link>
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Clean White Sign In Modal (Google-style Minimalist) */}
      <AnimatePresence>
        {isLoginOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              className="relative w-full max-w-sm rounded-3xl bg-white p-7 text-left shadow-2xl border border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800"
            >
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Sign In</h3>
                  <p className="text-xs text-neutral-500">Access your AFRO Lab workspace</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLoginOpen(false)}
                  className="rounded-full p-1.5 text-neutral-400 hover:text-black dark:hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleLoginSubmit} className="mt-5 space-y-4 text-xs">
                <div>
                  <label className="block mb-1.5 font-medium text-neutral-700 dark:text-neutral-300">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="scientist@afrolab.science"
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 font-medium text-neutral-700 dark:text-neutral-300">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-800 dark:text-white"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full rounded-full bg-neutral-900 py-3 text-xs font-semibold text-white transition-all hover:bg-black dark:bg-white dark:text-black dark:hover:bg-neutral-100"
                  >
                    Continue
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
