"use client"

import { motion } from "framer-motion"
import { Check, ArrowLeft, ShieldCheck } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { loadRazorpayScript } from "@/lib/razorpay"
import { useAuth } from "@/contexts/auth-context"

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PricingPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { user, refreshAuth } = useAuth()

  const freeTier = [
    "Standard conversational intelligence",
    "Basic text-only guidance viewport",
    "Limited daily message retention context",
  ]

  const premiumTier = [
    "Ultra-premium ElevenLabs Krishna Voice",
    "Full immersive meditation audio suite",
    "Unrestricted conversation token limits",
    "Exclusive early access to upcoming features",
    "Permanent lock-in pricing for founding tier",
  ]

  const handleCheckout = async () => {
    if (!user || !user.email) {
      alert("Please log in with a valid email to upgrade to premium.");
      return;
    }

    setIsLoading(true);

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert("Razorpay SDK failed to load. Are you online?");
        setIsLoading(false);
        return;
      }

      console.log("BACKEND URL =", process.env.NEXT_PUBLIC_BACKEND_URL);

      // Define standalone headers configuration block to inject required validation keys
      const orderHeaders = {
        "Content-Type": "application/json",
        "X-API-Key": process.env.NEXT_PUBLIC_API_KEY || ""
      };

      // Added diagnostic telemetry logs
      console.log("API KEY:", process.env.NEXT_PUBLIC_API_KEY);
      console.log("REQUEST HEADERS:", orderHeaders);

      // Fixed: Appended explicit security claims header to eliminate 403 Forbidden errors
      const orderRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payment/create-order`, { 
        method: "POST",
        headers: orderHeaders
      });
      
      const orderData = await orderRes.json();
      
      console.log("ORDER GENERATION RESPONSE", orderData);

      if (orderData.error) throw new Error(orderData.error);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "KALL AI Premium",
        description: "30 Days Premium Access",
        order_id: orderData.id, 
        handler: async function (response: any) {
          try {
            console.log("RAW RAZORPAY CALLBACK OBJECT:", response);
            console.log("response.razorpay_payment_id:", response.razorpay_payment_id);
            console.log("response.razorpay_order_id:", response.razorpay_order_id);
            console.log("response.razorpay_signature:", response.razorpay_signature);

            // Rebuilt verification payload to pass exact order_id details
            const verifyPayload = {
              email: user.email,
              payment_id: response.razorpay_payment_id,
              order_id: response.razorpay_order_id,
              signature: response.razorpay_signature,
              plan: "founding"
            };

            console.log("EXACT PAYLOAD SENT TO BACKEND:", verifyPayload);

            const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payment/verify`, {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                "X-API-Key": process.env.NEXT_PUBLIC_API_KEY || ""
              },
              body: JSON.stringify(verifyPayload),
            });

            if (!verifyRes.ok) {
               throw new Error(`Backend verification returned a non-200 transaction response code: ${verifyRes.status}`);
            }

            const verifyData = await verifyRes.json();
            console.log("VERIFY RESPONSE", verifyData);

            if (verifyData.success && verifyData.premium) {
              if (refreshAuth) {
                await refreshAuth();
              }
              
              localStorage.setItem("kaal_premium", "true");
              alert("Payment Successful! Welcome to KALL AI Premium.");
              router.push("/chat");
            } else {
              throw new Error(verifyData.message || "Verification failed via FastAPI verification workflow.");
            }
          } catch (verifyError: any) {
            console.error("Verification Route Error:", verifyError);
            alert("Payment processed successfully, but verification failed. Please contact support.");
          } finally {
            setIsLoading(false);
          }
        },
        prefill: {
          name: user.name || "Seeker",
          email: user.email,
        },
        theme: {
          color: "#E9B87D",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

      paymentObject.on("payment.failed", function (response: any) {
        console.error("Payment Failed:", response.error.description);
        alert("Payment canceled or declined.");
        setIsLoading(false);
      });

      paymentObject.on("modal.ondismiss", function () {
        setIsLoading(false);
      });

    } catch (error) {
      console.error("Checkout Pipeline Error:", error);
      alert("Failed to initialize system order payment object.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F6] text-stone-800 font-sans flex flex-col relative overflow-hidden selection:bg-[#E9B87D]/20">
      <div className="absolute top-[-10%] left-[-20%] w-[60vw] h-[60vw] bg-gradient-to-tr from-[#E9B87D]/5 to-transparent rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-gradient-to-tl from-[#E9B87D]/5 to-transparent rounded-full filter blur-[100px] pointer-events-none" />

      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors text-xs font-bold uppercase tracking-widest bg-transparent border-none cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <Link href="/" className="font-serif text-xl font-semibold tracking-tight text-stone-700">
          KALL AI
        </Link>
        <div className="w-16" />
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8 md:py-16 flex flex-col items-center justify-center z-10">
        
        <div className="text-center max-w-xl mx-auto mb-12 sm:mb-16 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-3 px-5 py-2 bg-white/60 backdrop-blur-sm border border-stone-200/60 rounded-full shadow-sm mb-6"
          >
            <Image 
              src="/kaal-logo.png" 
              alt="KALL AI" 
              width={60} 
              height={20} 
              className="object-contain mix-blend-darken opacity-80"
              priority
            />
            <span className="border-l border-stone-200/80 pl-3 text-[10px] font-bold text-stone-500 uppercase tracking-widest">
              Premium Guidance
            </span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-5xl font-serif font-semibold text-stone-800 tracking-tight"
          >
            Invest in peace of mind.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-stone-400 mt-3 font-light text-sm sm:text-base leading-relaxed"
          >
            Elevate your personal introspection cycles. Choose a pace that feels natural for your personal path.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl items-center">
          
          {/* FREE PLAN */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white/60 backdrop-blur-md rounded-[32px] p-6 sm:p-8 border border-stone-200/40 shadow-sm flex flex-col h-full justify-between"
          >
            <div>
              <h2 className="text-lg font-medium text-stone-700">Seeker</h2>
              <p className="text-xs text-stone-400 font-light mt-1">For basic foundational reflections.</p>
              
              <div className="my-6">
                <span className="text-4xl font-semibold text-stone-800 tracking-tight">₹0</span>
                <span className="text-xs text-stone-400 font-light ml-1">forever</span>
              </div>
              
              <hr className="border-stone-100 my-6" />
              
              <ul className="space-y-4">
                {freeTier.map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-xs text-stone-500 font-light">
                    <Check className="w-4 h-4 text-stone-300 flex-shrink-0" strokeWidth={2.5} />
                    {feat}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => router.push("/")}
              className="w-full mt-8 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-full py-4 text-xs font-bold tracking-widest uppercase transition-all active:scale-[0.98] border-none cursor-pointer"
            >
              Current Plan
            </button>
          </motion.div>

          {/* PREMIUM FOUNDING SUBSCRIPTION PLAN */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 90, delay: 0.4 }}
            className="bg-white rounded-[32px] p-6 sm:p-8 border-2 border-[#E9B87D] shadow-xl flex flex-col h-full justify-between relative scale-100 md:scale-105"
          >
            <div className="absolute top-0 right-8 -translate-y-1/2 bg-[#E9B87D] text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-sm">
              Limited Founding Offer
            </div>

            <div>
              <div className="flex items-center gap-3 mb-2">
                <Image 
                  src="/kaal-logo.png" 
                  alt="KALL AI" 
                  width={64} 
                  height={22} 
                  className="object-contain mix-blend-darken opacity-90"
                />
                <span className="px-2 py-0.5 bg-[#E9B87D]/10 rounded text-[9px] font-bold text-[#E9B87D] uppercase tracking-wider">30 Days Access</span>
              </div>
              <p className="text-xs text-stone-400 font-light mt-2">Our complete, unfiltered sensory environment.</p>
              
              <div className="my-6 flex items-baseline gap-1">
                <span className="text-5xl font-bold text-stone-800 tracking-tight">₹49</span>
                <span className="text-sm text-stone-500 font-light"> / access</span>
              </div>
              
              <hr className="border-stone-100 my-6" />
              
              <ul className="space-y-4">
                {premiumTier.map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-xs text-stone-600 font-medium">
                    <div className="w-4 h-4 rounded-full bg-[#E9B87D]/10 flex items-center justify-center text-[#E9B87D] flex-shrink-0">
                      <Check className="w-2.5 h-2.5" strokeWidth={3} />
                    </div>
                    {feat}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isLoading}
              className="w-full mt-8 bg-[#E9B87D] hover:bg-[#d4a55d] disabled:opacity-70 disabled:cursor-wait text-white rounded-full py-4 text-xs font-bold tracking-widest uppercase shadow-md hover:shadow-lg transition-all active:scale-[0.98] border-none cursor-pointer flex justify-center items-center"
            >
              {isLoading ? (
                <span className="animate-pulse">Processing Verification...</span>
              ) : (
                "Activate Guidance Now"
              )}
            </button>
          </motion.div>

        </div>

        <div className="mt-12 flex items-center gap-2 text-stone-400 text-xs font-light">
          <ShieldCheck className="w-4 h-4 text-stone-300" /> Secure checkout. Multi-factor transactional verification fully integrated.
        </div>

      </main>
    </div>
  )
}