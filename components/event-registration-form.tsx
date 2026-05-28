"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface EventRegistrationFormProps {
  eventId: string
  eventTitle: string
  ticketPrice: number
}

export function EventRegistrationForm({
  eventId,
  eventTitle,
  ticketPrice,
}: EventRegistrationFormProps) {
  const [attendanceMode, setAttendanceMode] = useState<"online" | "inperson">("inperson")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [mobile, setMobile] = useState("")
  const [tickets, setTickets] = useState(1)
  const router = useRouter()

  const total = tickets * ticketPrice

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Store registration data and navigate to payment
    sessionStorage.setItem("eventRegistration", JSON.stringify({
      eventId,
      eventTitle,
      attendanceMode,
      fullName,
      email,
      mobile,
      tickets,
      total,
    }))
    router.push(`/events/${eventId}/payment`)
  }

  return (
    <Card className="bg-muted/30 border-0 rounded-3xl overflow-hidden">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl font-semibold">Register</CardTitle>
        <p className="text-sm text-muted-foreground">{eventTitle}</p>
      </CardHeader>
      <CardContent className="px-6 pb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Attendance Mode */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Attendance mode</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAttendanceMode("online")}
                className={cn(
                  "py-3 px-4 rounded-xl border-2 flex items-center justify-center gap-2 transition-all",
                  attendanceMode === "online"
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card"
                )}
              >
                <div className={cn(
                  "w-4 h-4 rounded-full border-2",
                  attendanceMode === "online" ? "border-primary" : "border-muted-foreground"
                )} />
                <span className="text-sm">Online</span>
              </button>
              <button
                type="button"
                onClick={() => setAttendanceMode("inperson")}
                className={cn(
                  "py-3 px-4 rounded-xl border-2 flex items-center justify-center gap-2 transition-all",
                  attendanceMode === "inperson"
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card"
                )}
              >
                <div className={cn(
                  "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                  attendanceMode === "inperson" ? "border-primary bg-primary" : "border-muted-foreground"
                )}>
                  {attendanceMode === "inperson" && (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </div>
                <span className="text-sm">In person</span>
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <Label htmlFor="fullName" className="text-sm font-medium mb-2 block">
              Full name
            </Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="rounded-xl bg-card"
              required
            />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email" className="text-sm font-medium mb-2 block">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your Email ID"
              className="rounded-xl bg-card"
              required
            />
          </div>

          {/* Mobile */}
          <div>
            <Label htmlFor="mobile" className="text-sm font-medium mb-2 block">
              Mobile Number
            </Label>
            <Input
              id="mobile"
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Enter your Mobile Number"
              className="rounded-xl bg-card"
              required
            />
          </div>

          {/* Tickets */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Ticket cost: {ticketPrice}/-
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">
                  Number of Tickets
                </Label>
                <Input
                  type="number"
                  min={1}
                  value={tickets}
                  onChange={(e) => setTickets(parseInt(e.target.value) || 1)}
                  className="rounded-xl bg-card"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">
                  Total (in Rupees)
                </Label>
                <Input
                  type="text"
                  value={total}
                  readOnly
                  className="rounded-xl bg-card"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full py-5"
          >
            Register now
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
