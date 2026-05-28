import { Navbar } from "@/components/navbar"
import { EventRegistrationForm } from "@/components/event-registration-form"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin } from "lucide-react"

// Mock event data - in real app this would come from a database
const eventData = {
  id: "1",
  title: "Understanding the Self: Bhagavad Gita Discussion",
  description: "Understanding the Self: Bhagavad Gita Discussion Understanding the Self: Bhagavad Gita Discussion",
  date: "24 th Feb 2026",
  time: "10:30 AM SIT",
  location: "Pune",
  price: 450,
  isOnline: true,
  category: "Youth Mental Wellness Circle",
}

export default async function EventRegisterPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Navbar showBackButton />
      
      <div className="flex-1 px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Event Details - Left Side */}
            <div className="bg-muted/50 rounded-3xl p-8">
              <h1 className="text-2xl md:text-3xl font-serif font-semibold text-foreground mb-6">
                {eventData.title}
              </h1>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Calendar className="h-5 w-5" />
                  <span>{eventData.date}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Clock className="h-5 w-5" />
                  <span>{eventData.time}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="h-5 w-5" />
                  <span>{eventData.location}</span>
                </div>
              </div>

              <div className="flex gap-2 mb-6">
                {eventData.isOnline && (
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 rounded-full">
                    Online
                  </Badge>
                )}
                <Badge className="bg-primary/20 text-primary hover:bg-primary/20 rounded-full">
                  {eventData.price}/-
                </Badge>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                {eventData.description}
              </p>
            </div>

            {/* Registration Form - Right Side */}
            <EventRegistrationForm
              eventId={id}
              eventTitle={eventData.category}
              ticketPrice={eventData.price}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
