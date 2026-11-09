'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogIn, LogOut, User, ShieldCheck, Sparkles, Check, X, FlaskConical, KeyRound } from 'lucide-react'

interface LabUser {
  name: string
  email: string
  role: string
  badgeId: string
  clearance: string
}

export default function AuthHeaderButton() {
  const [user, setUser] = useState<LabUser | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loginEmail, setLoginEmail] = useState('researcher@afrolab.science')
  const [loginName, setLoginName] = useState('Dr. Biruk Ahmye')
  const [loginRole, setLoginRole] = useState('Lead Experimental Scientist')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('afrolab_auth_user')
      if (saved) {
        setUser(JSON.parse(saved))
      } else {
        // Default active session for seamless demo experience
        const defaultUser: LabUser = {
          name: 'Dr. Biruk Ahmye',
          email: 'biruk@afrolab.science',
          role: 'Lead AI Scientist',
          badgeId: 'AFRO-7729',
          clearance: 'Level 4 (Full Laboratory Access)',
        }
        setUser(defaultUser)
        localStorage.setItem('afrolab_auth_user', JSON.stringify(defaultUser))
      }
    } catch {
      // Fallback
    }
  }, [])

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setIsSubmitting(true)

    setTimeout(() => {
      const newUser: LabUser = {
        name: loginName.trim() || 'Laboratory Researcher',
        email: loginEmail.trim() || 'scientist@afrolab.org',
        role: loginRole || 'Senior Chemist',
        badgeId: `AFRO-${Math.floor(1000 + Math.random() * 9000)}`,
        clearance: 'Level 4 (Full Laboratory Access)',
      }
      setUser(newUser)
      try {
        localStorage.setItem('afrolab_auth_user', JSON.stringify(newUser))
      } catch {}
      setIsSubmitting(false)
      setIsModalOpen(false)
    }, 600)
  }

  const handleLogout = () => {
    setUser(null)
    setIsProfileOpen(false)
    try {
      localStorage.removeItem('afrolab_auth_user')
    } catch {}
  }

  return (
    <div className="relative inline-flex items-center">
      {/* Top Header Interactive Button */}
      {user ? (
        // Logged In State Pill
        <motion.button
          type="button"
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="relative inline-flex items-center gap-2.5 rounded-full border border-emerald-500/40 bg-emerald-950/20 px-3.5 py-1.5 text-xs font-medium text-emerald-300 shadow-sm transition-all hover:border-emerald-400 hover:bg-emerald-900/30"
          title="Scientist Profile & Laboratory Clearance"
        >
          {/* Active online pulse dot */}
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>

          <span className="font-semibold text-emerald-200">{user.name.split(' ')[0]}</span>
          <span className="hidden sm:inline-block rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-mono text-emerald-300">
            {user.role.split(' ')[0]}
          </span>
          <User size={14} className="text-emerald-400" />
        </motion.button>
      ) : (
        // Logged Out State Button
        <motion.button
          type="button"
          onClick={() => setIsModalOpen(true)}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3.5 py-1.5 text-xs font-medium text-black transition-all hover:border-emerald-500/50 hover:bg-muted"
        >
          <LogIn size={14} className="text-emerald-500" />
          <span>Scientist Login</span>
        </motion.button>
      )}

      {/* User Profile Dropdown Modal */}
      <AnimatePresence>
        {isProfileOpen && user && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/20"
              onClick={() => setIsProfileOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-12 z-50 w-72 rounded-2xl border border-emerald-500/30 bg-[#0c1613] p-4 text-left shadow-2xl shadow-emerald-950/40 backdrop-blur-xl"
            >
              <div className="flex items-start justify-between border-b border-emerald-500/20 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
                    <FlaskConical size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{user.name}</h4>
                    <p className="text-[11px] text-emerald-400/80">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsProfileOpen(false)}
                  className="rounded-full p-1 text-gray-400 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="my-3 space-y-2 text-xs">
                <div className="flex items-center justify-between rounded-lg bg-emerald-950/40 px-2.5 py-1.5 text-emerald-200">
                  <span className="text-gray-400">Badge ID:</span>
                  <span className="font-mono text-emerald-300">{user.badgeId}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-emerald-950/40 px-2.5 py-1.5 text-emerald-200">
                  <span className="text-gray-400">Clearance:</span>
                  <span className="flex items-center gap-1 font-medium text-emerald-400">
                    <ShieldCheck size={12} /> Level 4
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-emerald-950/40 px-2.5 py-1.5 text-emerald-200">
                  <span className="text-gray-400">Status:</span>
                  <span className="text-emerald-300">Active in 3D Lab</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/20 py-2 text-xs font-medium text-rose-300 transition-colors hover:bg-rose-900/40 hover:text-rose-200"
              >
                <LogOut size={14} />
                <span>Log Out of Laboratory</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Login Dialog Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              className="relative w-full max-w-sm rounded-3xl border border-emerald-500/40 bg-[#0d1714] p-6 shadow-2xl text-left"
            >
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                    <KeyRound size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">AFRO Lab Access</h3>
                    <p className="text-xs text-emerald-400/80">Virtual Laboratory Sign In</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full p-1.5 text-gray-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleLogin} className="mt-4 space-y-3.5 text-xs">
                <div>
                  <label className="block mb-1 text-gray-300 font-medium">Scientist Name</label>
                  <input
                    type="text"
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                    className="w-full rounded-xl border border-emerald-500/30 bg-black/40 px-3 py-2 text-white outline-none focus:border-emerald-400"
                    placeholder="e.g. Dr. Biruk Ahmye"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-gray-300 font-medium">Lab Institutional Email</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full rounded-xl border border-emerald-500/30 bg-black/40 px-3 py-2 text-white outline-none focus:border-emerald-400"
                    placeholder="scientist@afrolab.science"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-gray-300 font-medium">Research Discipline</label>
                  <select
                    value={loginRole}
                    onChange={(e) => setLoginRole(e.target.value)}
                    className="w-full rounded-xl border border-emerald-500/30 bg-black/40 px-3 py-2 text-white outline-none focus:border-emerald-400"
                  >
                    <option value="Lead Experimental Scientist">Lead Experimental Scientist</option>
                    <option value="Analytical Chemist">Analytical Chemist</option>
                    <option value="Quantum Optics Physicist">Quantum Optics Physicist</option>
                    <option value="Biochemistry Researcher">Biochemistry Researcher</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 font-semibold text-black transition-all hover:bg-emerald-400 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Authorizing Clearance...</span>
                    ) : (
                      <>
                        <ShieldCheck size={15} />
                        <span>Sign In &amp; Launch Workbench</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
