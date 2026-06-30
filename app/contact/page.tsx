"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Headphones,
  Mail,
  MessageCircle,
  Clock,
  HelpCircle,
  ChevronDown,
  ExternalLink,
  Lightbulb,
  Send,
  User,
  CheckCircle2,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

const FAQS = [
  {
    q: "What is KAAL AI?",
    a: "KAAL AI is your personal astrology companion, blending ancient wisdom with modern AI to give you clear, personalized guidance whenever you need it.",
  },
  {
    q: "Is my data secure with KAAL AI?",
    a: "Yes. Your birth details and conversations are encrypted and never shared with third parties. Your privacy is a top priority.",
  },
  {
    q: "How does the AI provide answers?",
    a: "Our AI is trained on classical astrological texts and combines your birth chart with real-time calculations to generate accurate, personalized insights.",
  },
  {
    q: "Can I cancel my premium subscription?",
    a: "Absolutely. You can cancel anytime from your account settings — no questions asked, and you'll retain access until the end of your billing cycle.",
  },
  {
    q: "How can I suggest a new feature?",
    a: "We'd love to hear it! Send us a message using the form on this page and our team will review every suggestion.",
  },
]

export default function ContactPage() {
  const router = useRouter()
  const { user, isLoggedIn } = useAuth()

  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [form, setForm] = useState({
    name: isLoggedIn && user ? user.name ?? "" : "",
    email: isLoggedIn && user ? user.email ?? "" : "",
    topic: "",
    message: "",
  })

  const handleChange =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
    }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitted(true)
    }, 900)
  }

  return (
    <div className="min-h-screen bg-[#FBF9F6]">
      <div className="px-4 md:px-16 pt-6 md:pt-10 pb-10 md:pb-16">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#333333] hover:opacity-70 transition-opacity group bg-transparent border-none cursor-pointer p-1 -ml-1 mb-6 md:mb-8"
        >
          <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          <span className="text-xs font-bold uppercase tracking-widest">Back</span>
        </button>

        {/* ── HERO BANNER ── */}
        <div className="relative overflow-hidden rounded-3xl bg-white border border-stone-200 px-6 md:px-10 py-8 md:py-10 mb-8 md:mb-10">
          {/* Decorative glow + praying hands silhouette */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 w-40 h-40 md:w-52 md:h-52 opacity-[0.07] pointer-events-none hidden sm:block">
            <svg viewBox="0 0 100 100" fill="currentColor" className="text-amber-600">
              <path d="M50 10c-2 8-6 14-12 18-4 3-6 7-6 12 0 8 4 14 10 18-3 2-5 5-5 9 0 7 6 12 13 12s13-5 13-12c0-4-2-7-5-9 6-4 10-10 10-18 0-5-2-9-6-12-6-4-10-10-12-18z" />
            </svg>
          </div>
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center shrink-0">
              <Headphones className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-serif text-stone-800">Support Center</h1>
              <p className="mt-1 text-stone-500 text-sm md:text-base">
                We&apos;re here to help you on your journey.
              </p>
            </div>
          </div>
        </div>

        {/* ── INFO CARDS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 md:mb-10">
          <InfoCard
            icon={<Mail className="w-5 h-5 text-amber-600" />}
            title="Email Us"
            description="Write to us and we'll get back to you."
            actionLabel="support@kaalai.in"
            href="mailto:support@kaalai.in"
          />
          <InfoCard
            icon={<MessageCircle className="w-5 h-5 text-amber-600" />}
            title="WhatsApp"
            description="Chat with us on WhatsApp."
            actionLabel="+91 98765 43210"
            href="https://wa.me/919876543210"
          />
          <InfoCard
            icon={<Clock className="w-5 h-5 text-amber-600" />}
            title="Response Time"
            description="We typically respond within 24 hours."
            actionLabel="24 Hrs"
            pill
          />
          <InfoCard
            icon={<HelpCircle className="w-5 h-5 text-amber-600" />}
            title="Help Topics"
            description="Explore common topics and get instant answers."
            actionLabel="View FAQs"
            href="#faqs"
          />
        </div>

        {/* ── FAQ + FORM ── */}
        <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
          {/* FAQ */}
          <div id="faqs" className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-stone-800">Frequently Asked Questions</h2>
              <Link
                href="/faq"
                className="text-xs font-bold uppercase tracking-widest text-amber-600 hover:text-amber-700 flex items-center gap-1 shrink-0"
              >
                View all FAQs <span aria-hidden>→</span>
              </Link>
            </div>

            <div className="flex flex-col gap-2.5">
              {FAQS.map((item, i) => {
                const open = openFaq === i
                return (
                  <div
                    key={item.q}
                    className="bg-stone-50 border border-stone-100 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaq(open ? null : i)}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left bg-transparent border-none cursor-pointer"
                    >
                      <span className="text-sm font-semibold text-stone-700">{item.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-stone-400 shrink-0 transition-transform ${
                          open ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {open && (
                      <div className="px-4 pb-4 -mt-1">
                        <p className="text-sm text-stone-500 leading-relaxed">{item.a}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* CONTACT FORM */}
          <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8">
            <h2 className="text-lg font-bold text-stone-800">Get in Touch</h2>
            <p className="text-sm text-stone-400 mt-1 mb-5">Still need help? Send us a message.</p>

            {submitted ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12 gap-3">
                <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200/60 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-amber-600" />
                </div>
                <p className="font-bold text-stone-800">Message sent</p>
                <p className="text-sm max-w-[240px] text-stone-400">
                  We&apos;ll get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                <div className="grid grid-cols-2 gap-3.5">
                  <FormField
                    icon={<User className="w-4 h-4 text-stone-400" />}
                    placeholder="Your Name"
                    value={form.name}
                    onChange={handleChange("name")}
                    required
                  />
                  <FormField
                    icon={<Mail className="w-4 h-4 text-stone-400" />}
                    type="email"
                    placeholder="Your Email"
                    value={form.email}
                    onChange={handleChange("email")}
                    required
                  />
                </div>

                <label className="flex items-center gap-2 rounded-xl px-3 py-2.5 border bg-stone-50 border-stone-200 focus-within:border-stone-400 transition-colors">
                  <select
                    value={form.topic}
                    onChange={handleChange("topic")}
                    required
                    className="flex-1 bg-transparent outline-none border-none text-sm text-stone-700 cursor-pointer"
                  >
                    <option value="">Select a Topic</option>
                    <option value="account">Account</option>
                    <option value="billing">Billing</option>
                    <option value="feature">Feature Request</option>
                    <option value="bug">Report a Bug</option>
                    <option value="other">Other</option>
                  </select>
                </label>

                <label className="flex flex-col gap-1.5">
                  <div className="flex items-start gap-2 rounded-xl px-3 py-2.5 border bg-stone-50 border-stone-200 focus-within:border-stone-400 transition-colors">
                    <MessageCircle className="w-4 h-4 text-stone-400 mt-0.5" />
                    <textarea
                      value={form.message}
                      onChange={handleChange("message")}
                      placeholder="Type your message..."
                      required
                      rows={4}
                      className="flex-1 bg-transparent outline-none border-none text-sm resize-none text-stone-800 placeholder:text-stone-400"
                    />
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-1 w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold text-sm py-3 rounded-xl transition-all cursor-pointer border-none flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 disabled:opacity-60"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                  <Send className="w-4 h-4" />
                </button>

                <p className="text-xs text-stone-400 text-center flex items-center justify-center gap-1.5 mt-1">
                  🔒 Your information is safe with us.
                </p>
              </form>
            )}
          </div>
        </div>

        {/* ── BOTTOM CTA STRIP ── */}
        <div className="mt-6 md:mt-8 flex items-center justify-between gap-4 bg-amber-50/60 border border-amber-200/50 rounded-2xl px-5 md:px-8 py-5 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-amber-200/60 flex items-center justify-center shrink-0">
              <Lightbulb className="w-4.5 h-4.5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-stone-800">Can&apos;t find what you need?</p>
              <p className="text-xs text-stone-500">
                Check our detailed documentation or reach out to us directly.
              </p>
            </div>
          </div>
          <Link
            href="/help-docs"
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-700 border border-amber-300/70 bg-white rounded-lg px-4 py-2.5 hover:bg-amber-50 transition-colors shrink-0"
          >
            Visit Help Docs <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────── SUB-COMPONENTS ─────────────────────── */

function InfoCard({
  icon,
  title,
  description,
  actionLabel,
  href,
  pill,
}: {
  icon: React.ReactNode
  title: string
  description: string
  actionLabel: string
  href?: string
  pill?: boolean
}) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5 flex flex-col">
      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className="text-sm font-bold text-stone-800">{title}</h3>
      <p className="text-xs text-stone-400 mt-1 mb-4 leading-relaxed flex-1">{description}</p>
      {pill ? (
        <span className="self-start text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200/60 rounded-lg px-3 py-1.5">
          {actionLabel}
        </span>
      ) : (
        <Link
          href={href ?? "#"}
          className="self-start text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200/60 rounded-lg px-3 py-1.5 flex items-center gap-1.5 hover:bg-amber-100 transition-colors"
        >
          {actionLabel} <span aria-hidden>→</span>
        </Link>
      )}
    </div>
  )
}

function FormField({
  icon,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  icon: React.ReactNode
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  type?: string
  required?: boolean
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 border bg-stone-50 border-stone-200 focus-within:border-stone-400 transition-colors">
      {icon}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="flex-1 bg-transparent outline-none border-none text-sm text-stone-800 placeholder:text-stone-400"
      />
    </div>
  )
}