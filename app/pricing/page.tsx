"use client"

import { motion } from "framer-motion"
import { Check, ShieldCheck, Sparkles, HelpCircle, Crown, Layers, Zap, Heart, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { loadRazorpayScript } from "@/lib/razorpay"
import { useAuth } from "@/contexts/auth-context"
import { Navbar } from "@/components/navbar"

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PricingPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { user, isLoggedIn, refreshAuth } = useAuth()

  // STRICT TESTING RULE: Removed hardcoded `|| true`. 
  // Only your account gets automatic premium state bypass on pricing table view.
  const isPremium = isLoggedIn && user && (
    user.email === "bhonglepratish@gmail.com" ||
    user?.plan === "plus" || 
    user?.plan === "annual" || 
    user?.plan === "founding"
  );

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
    if (isPremium) {
      router.push("/chat")
      return
    }

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
        name: "KAAL AI Premium",
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

            if (verifyData.success) {
              if (refreshAuth) {
                await refreshAuth();
              }
              
              localStorage.setItem("kaal_premium", "true");
              alert("Payment Successful! Welcome to KAAL AI Premium.");
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
          name: user?.name || "Seeker", 
          email: user?.email || "" 
        },
        theme: { 
          color: "#E9B87D" 
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
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-5%] left-[-10%] w-[50vw] h-[50vw] bg-gradient-to-tr from-[#E9B87D]/10 to-transparent rounded-full filter blur-[140px]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[45vw] h-[45vw] bg-gradient-to-tl from-[#E9B87D]/8 to-transparent rounded-full filter blur-[120px]" />
      </div>

      <Navbar showBackButton={true} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 md:py-16 flex flex-col items-center justify-center z-10 relative">
        
        {/* TOP BADGE / MAIN TYPOGRAPHY HEADER */}
        <div className="text-center max-w-xl mx-auto mb-10 sm:mb-16 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-white border border-stone-200/80 shadow-xs rounded-full mb-5"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest flex items-center gap-1">
              Founding Tier Status Locked <Sparkles className="w-3 h-3 text-[#E9B87D] fill-current" />
            </span>
          </motion.div>
          
          <h1 className="text-3xl sm:text-5xl font-serif font-medium text-stone-900 tracking-tight leading-tight px-2">
            Clear insights, refined focus.
          </h1>
          <p className="text-stone-500 mt-3.5 font-light text-xs sm:text-sm max-w-sm leading-relaxed">
            Elevate your personal introspection cycles. Choose a pace that feels natural for your personal path.
          </p>
        </div>

        {/* PRICING PLANS GRID */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 w-full max-w-3xl items-stretch px-2">
          
          {/* FREE PLAN CARD */}
          <motion.div
            whileHover={{ y: -2 }}
            className="bg-white/40 backdrop-blur-md rounded-[24px] p-6 sm:p-8 border border-stone-200/60 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-serif font-bold text-stone-800">Seeker Tier</h2>
                  <p className="text-[11px] text-stone-400 font-light mt-1">Foundational workspace reflections.</p>
                </div>
                <span className="p-2 bg-stone-100/80 rounded-lg text-stone-400"><HelpCircle className="w-4 h-4" /></span>
              </div>
              
              <div className="my-6 flex items-baseline">
                <span className="text-4xl font-serif font-semibold text-stone-900">₹0</span>
                <span className="text-[11px] text-stone-400 uppercase tracking-wider ml-2">Standard Active</span>
              </div>
              
              <hr className="border-stone-200/50 my-5" />
              
              <ul className="space-y-3.5">
                {freeTier.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-stone-500 leading-relaxed">
                    <Check className="w-3.5 h-3.5 text-stone-400 mt-0.5 shrink-0" strokeWidth={2.5} />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              disabled
              className="w-full mt-8 bg-stone-100 text-stone-400 rounded-xl py-3 text-xs font-bold tracking-wider uppercase border-none cursor-not-allowed"
            >
              Default Plan Configuration
            </button>
          </motion.div>

          {/* PREMIUM CARD */}
          <motion.div
            whileHover={{ y: -2 }}
            className={`bg-white rounded-[24px] p-6 sm:p-8 flex flex-col justify-between relative transition-all shadow-md ${
              isPremium ? 'border-2 border-amber-500/80 shadow-amber-500/[0.03]' : 'border border-stone-200'
            }`}
          >
            <div className="absolute top-0 right-6 -translate-y-1/2 bg-stone-950 text-amber-400 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-xs">
              {isPremium ? "Unlocked & Active" : "Limited Founding Offer"}
            </div>

            <div>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-serif font-bold text-stone-900">KAAL AI Plus</h2>
                    <span className="p-1 bg-amber-500/10 rounded text-[#E9B87D]"><Crown className="w-3.5 h-3.5 fill-current" /></span>
                  </div>
                  <p className="text-[11px] text-stone-400 font-light mt-1">Our complete, high-fidelity environment.</p>
                </div>
              </div>
              
              <div className="my-6 flex items-baseline gap-1">
                <span className="text-4xl font-serif font-semibold text-stone-900">₹49</span>
                <span className="text-[11px] text-stone-400 font-light ml-1.5 uppercase tracking-wider">/ 30 Days Pass</span>
              </div>
              
              <hr className="border-stone-100 my-5" />
              
              <ul className="space-y-3.5">
                {premiumTier.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-stone-700 font-medium leading-relaxed">
                    <div className="w-4 h-4 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5" strokeWidth={3} />
                    </div>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isLoading}
              className={`w-full mt-8 rounded-xl py-3.5 text-xs font-bold tracking-widest uppercase transition-all border-none flex justify-center items-center cursor-pointer ${
                isPremium 
                  ? 'bg-stone-900 text-amber-400 hover:bg-stone-800' 
                  : 'bg-gradient-to-r from-[#E9B87D] to-[#d4a55d] text-white shadow-xs'
              }`}
            >
              {isLoading ? (
                <span className="animate-pulse">Configuring Channels...</span>
              ) : isPremium ? (
                "Enter Premium Chat Dashboard"
              ) : (
                "Activate Guidance Framework"
              )}
            </button>
          </motion.div>

        </div>

        {/* EXTRA POLISHED BENEFITS GRID SECTION */}
        <section className="mt-16 sm:mt-24 w-full max-w-3xl border-t border-stone-200/60 pt-12 px-2">
          <h3 className="text-center font-serif text-xl font-bold text-stone-900 mb-8">Uncompromising Privacy & Fidelity Built-In</h3>
          <div className="grid sm:grid-cols-3 gap-6 text-center sm:text-left">
            <div className="space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700 mx-auto sm:mx-0"><Layers className="w-4 h-4" /></div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800">Advanced Memory Space</h4>
              <p className="text-xs text-stone-400 font-light leading-relaxed">Maintains deeper conversation state memory vectors securely over extended multi-day sessions.</p>
            </div>
            <div className="space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700 mx-auto sm:mx-0"><Zap className="w-4 h-4" /></div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800">Zero Ingest Latency</h4>
              <p className="text-xs text-stone-400 font-light leading-relaxed">Priority infrastructure allocation bypasses traffic bottlenecks to output responses instantaneously.</p>
            </div>
            <div className="space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700 mx-auto sm:mx-0"><Heart className="w-4 h-4" /></div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800">Exclusive Content Tracks</h4>
              <p className="text-xs text-stone-400 font-light leading-relaxed">Direct unlock privilege to custom vocal modifications, atmospheric loops, and focus tools updates.</p>
            </div>
          </div>
        </section>

        {/* BOTTOM VERIFICATION FOOTER */}
        <div className="mt-12 flex items-center justify-center gap-2 text-stone-400 text-[11px] font-light text-center px-4">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600/80 shrink-0" /> 
          <span>Secure multi-factor transaction architecture deployed. Refund tracking protected.</span>
        </div>

      </main>
    </div>
  )
}