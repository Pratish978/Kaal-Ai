"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Star, CreditCard, Wallet, Building, Smartphone, Gift, Clock } from "lucide-react"

const paymentMethods = [
  { id: "recommended", label: "Recommended", icon: Star, hasOffers: false },
  { id: "cod", label: "Cash On Delivery (Cash/UPI)", icon: Wallet, hasOffers: false },
  { id: "upi", label: "UPI (Pay via any App)", icon: Smartphone, hasOffers: false },
  { id: "card", label: "Credit/Debit Card", icon: CreditCard, hasOffers: true, offers: 8 },
  { id: "wallets", label: "Wallets", icon: Wallet, hasOffers: true, offers: 1 },
  { id: "paylater", label: "Pay Later", icon: Clock, hasOffers: false },
  { id: "emi", label: "EMI", icon: CreditCard, hasOffers: true, offers: 2 },
  { id: "netbanking", label: "Net Banking", icon: Building, hasOffers: false },
]

export default function PaymentPage() {
  const [selectedMethod, setSelectedMethod] = useState("card")
  const [registration, setRegistration] = useState<{
    eventTitle: string
    tickets: number
    total: number
  } | null>(null)

  useEffect(() => {
    const data = sessionStorage.getItem("eventRegistration")
    if (data) {
      setRegistration(JSON.parse(data))
    }
  }, [])

  const platformFee = 23
  const totalAmount = (registration?.total || 0) + platformFee

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Navbar showBackButton />
      
      <div className="flex-1 px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Methods - Left Side */}
            <div className="lg:col-span-2">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Choose Payment Mode
              </h2>
              
              <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    {/* Payment method list */}
                    <div className="border-r border-border">
                      {paymentMethods.map((method) => (
                        <button
                          key={method.id}
                          onClick={() => setSelectedMethod(method.id)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-4 text-left border-l-4 transition-all",
                            selectedMethod === method.id
                              ? "border-l-primary bg-primary/5"
                              : "border-l-transparent hover:bg-muted/50"
                          )}
                        >
                          <method.icon className="h-5 w-5 text-muted-foreground" />
                          <span className={cn(
                            "text-sm",
                            selectedMethod === method.id ? "text-primary font-medium" : "text-foreground"
                          )}>
                            {method.label}
                          </span>
                          {method.hasOffers && (
                            <span className="text-xs text-primary ml-auto">
                              {method.offers} Offers
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Payment details */}
                    <div className="p-6">
                      <h3 className="font-semibold text-foreground mb-4">
                        Recommended Payment Options
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
                          <input
                            type="radio"
                            checked
                            readOnly
                            className="mt-1 accent-pink-500"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">SBI Credit Card</span>
                              <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">
                                MasterCard
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">**** 1503</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              As Per RBI guidelines, CVV is not required for this transaction.
                            </p>
                          </div>
                        </div>

                        <Button className="w-full bg-pink-500 hover:bg-pink-600 text-white rounded-lg py-5">
                          Pay Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Gift Card */}
              <div className="mt-4 flex items-center justify-between p-4 bg-card rounded-xl border border-border">
                <div className="flex items-center gap-3">
                  <Gift className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-foreground">Have a Gift Card?</span>
                </div>
                <button className="text-sm text-pink-500 font-medium">
                  APPLY GIFT CARD
                </button>
              </div>
            </div>

            {/* Order Summary - Right Side */}
            <div>
              <Card className="border-0 shadow-sm rounded-2xl">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-4">Order Summary</h3>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Event</span>
                      <span className="text-foreground">{registration?.eventTitle || "Event"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tickets</span>
                      <span className="text-foreground">{registration?.tickets || 1}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">₹{registration?.total || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        Platform Fee
                        <button className="text-primary text-xs underline">Know More</button>
                      </span>
                      <span className="text-foreground">₹{platformFee}</span>
                    </div>
                    <div className="h-px bg-border my-2" />
                    <div className="flex justify-between font-semibold">
                      <span className="text-foreground">Total Amount</span>
                      <span className="text-foreground">₹{totalAmount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
