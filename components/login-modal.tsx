"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Mail,
  Phone,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { supabase } from "@/app/utils/supabase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
}) => {

  const [email, setEmail] = useState("");
  const [showEmailInput, setShowEmailInput] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const [statusMessage, setStatusMessage] =
    useState<{
      type: "success" | "error" | "";
      text: string;
    }>({
      type: "",
      text: "",
    });

  const [isRendered, setIsRendered] =
    useState(false);

  /* ---------------- MOUNT ANIMATION ---------------- */

  useEffect(() => {

    if (isOpen) {

      setIsRendered(true);
      document.body.style.overflow = "hidden";

    } else {

      const timer = setTimeout(
        () => setIsRendered(false),
        300
      );

      document.body.style.overflow = "unset";

      return () => clearTimeout(timer);

    }

  }, [isOpen]);

  if (!isRendered) return null;

  /* ---------------- EMAIL LOGIN ---------------- */

  const handleEmailLogin = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    if (!email) return;

    setLoading(true);

    setStatusMessage({
      type: "",
      text: "",
    });

    try {

      const { error } =
        await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

      if (error) throw error;

      setStatusMessage({
        type: "success",
        text: "Magic login link sent successfully.",
      });

    } catch (error: any) {

      console.error(
        "EMAIL LOGIN ERROR:",
        error.message
      );

      setStatusMessage({
        type: "error",
        text:
          error.message ||
          "Unable to send login link.",
      });

    } finally {

      setLoading(false);

    }

  };

  /* ---------------- GOOGLE LOGIN ---------------- */

  const handleGoogleLogin = async () => {

    try {

      setLoading(true);

      const { error } =
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/`,
          },
        });

      if (error) throw error;

    } catch (error: any) {

      console.error(
        "GOOGLE LOGIN ERROR:",
        error.message
      );

      setStatusMessage({
        type: "error",
        text:
          error.message ||
          "Google login failed.",
      });

      setLoading(false);

    }

  };

  /* ---------------- PHONE LOGIN ---------------- */

  const handlePhoneComingSoon = () => {

    setStatusMessage({
      type: "error",
      text: "Phone authentication coming soon.",
    });

  };

  /* ---------------- GUEST FLOW ---------------- */

  const handleGuestContinue = () => {

    localStorage.setItem(
      "kaal_guest_mode",
      "true"
    );

    onClose();

  };

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-500 ease-out ${
        isOpen
          ? "opacity-100"
          : "opacity-0 pointer-events-none"
      }`}
    >

      {/* Overlay */}

      <div
        className="absolute inset-0 bg-[#0d0d11]/40 backdrop-blur-[12px] transition-all duration-500 ease-in-out"
        onClick={onClose}
      />

      {/* Modal */}

      <div
        className={`relative bg-[#faf9f6] w-full max-w-md rounded-[32px] p-8 md:p-10 shadow-[0_24px_64px_rgba(13,13,17,0.12)] border border-[#f0ede4] flex flex-col items-center transition-all duration-500 ${
          isOpen
            ? "scale-100 translate-y-0 opacity-100"
            : "scale-95 translate-y-4 opacity-0"
        }`}
      >

        {/* Glow */}

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[1px] bg-gradient-to-r from-transparent via-[#E9B96E]/40 to-transparent" />

        {/* Close */}

        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-[#9a9485] hover:text-[#1a191e] transition-all duration-300 bg-[#f3efe6]/50 hover:bg-[#f3efe6] p-2 rounded-full border-none cursor-pointer group active:scale-95"
        >
          <X className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
        </button>

        {/* Logo */}

        <div className="w-12 h-12 rounded-full bg-white border border-[#eae5d8] flex items-center justify-center mb-6 mt-2 shadow-sm">
          <Sparkles className="w-5 h-5 text-[#E9B96E]" />
        </div>

        {/* Heading */}

        <h2 className="text-[22px] font-medium tracking-tight text-[#1a191e] mb-2 text-center font-serif px-2">
          Preserve your journey with KAAL
        </h2>

        <p className="text-xs text-[#847e70] text-center mb-8 max-w-[280px] leading-relaxed tracking-wide">
          Safely archive your emotional insights,
          reflections, and dialogues.
        </p>

        {/* Buttons */}

        <div className="w-full flex flex-col gap-3">

          {/* Google */}

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-[#f4f1e9] hover:bg-[#ebe5d9] text-[#1a191e] font-medium h-[52px] rounded-full flex items-center justify-center gap-3 transition-all duration-300 active:scale-[0.98]"
          >
            {loading ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : (
              <span className="text-xs font-sans tracking-wide uppercase font-semibold">
                Continue with Google
              </span>
            )}
          </button>

          {/* Phone */}

          <button
            type="button"
            onClick={handlePhoneComingSoon}
            className="w-full bg-[#f4f1e9] hover:bg-[#ebe5d9] text-[#1a191e] font-medium h-[52px] rounded-full flex items-center justify-center gap-3 transition-all duration-300 active:scale-[0.98]"
          >
            <Phone className="w-3.5 h-3.5" />

            <span className="text-xs font-sans tracking-wide uppercase font-semibold">
              Continue with Phone
            </span>
          </button>

          {/* Email */}

          {!showEmailInput ? (

            <button
              onClick={() =>
                setShowEmailInput(true)
              }
              className="w-full bg-[#1a191e] hover:bg-[#2b2a30] text-white font-medium h-[52px] rounded-full transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2.5"
            >
              <Mail className="w-4 h-4 text-[#eae5d8]" />

              <span className="text-xs font-sans tracking-wide uppercase font-semibold">
                Continue with Email
              </span>
            </button>

          ) : (

            <form
              onSubmit={handleEmailLogin}
              className="flex flex-col gap-2.5 w-full"
            >

              <input
                type="email"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="w-full h-[52px] px-6 bg-white border border-[#eae5d8] rounded-full text-xs text-[#1a191e] placeholder-[#a69f91] focus:outline-none focus:border-[#E9B96E]"
                required
                disabled={loading}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1a191e] hover:bg-[#2b2a30] text-white font-medium h-[52px] rounded-full transition-all duration-300 active:scale-[0.98] flex items-center justify-center"
              >
                {loading ? (
                  <Loader2 className="animate-spin w-4 h-4 text-white" />
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-sans tracking-wide uppercase font-semibold">
                      Request Pathway
                    </span>

                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>

            </form>

          )}

          {/* Status */}

          {statusMessage.text && (
            <p
              className={`text-[11px] text-center mt-1 px-2 ${
                statusMessage.type === "success"
                  ? "text-emerald-700"
                  : "text-rose-700"
              }`}
            >
              {statusMessage.text}
            </p>
          )}

          {/* Guest */}

          <button
            onClick={handleGuestContinue}
            className="w-full bg-transparent text-[#9a9485] hover:text-[#1a191e] text-[11px] font-sans font-medium h-8 mt-1 transition-colors duration-200 border-none cursor-pointer"
          >
            Continue as Guest Experience
          </button>

        </div>

        {/* Footer */}

        <div className="mt-8 pt-5 border-t border-[#f0ede4] w-full text-center px-2">

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#b4ae9f] uppercase tracking-wider font-semibold mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#E9B96E]" />

            <span>End-to-End Encrypted Data</span>
          </div>

          <p className="text-[10px] text-[#9a9485] leading-normal font-sans max-w-[290px] mx-auto">
            Signing in is optional. Guest users
            retain local session continuity.
          </p>

        </div>

      </div>

    </div>
  );
};

export default AuthModal;