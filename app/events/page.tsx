"use client";

import React, { useEffect, useState } from "react";
import { Calendar, Clock, MapPin, Loader2 } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/contexts/auth-context";

interface Event {
  title?: string;
  type?: string;
  price?: string | number;
  date?: string;
  time?: string;
  location?: string;
  zoom_link?: string;
}

const EventsPage = () => {

  const { user } = useAuth();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {

    const fetchEvents = async () => {

      try {

        setLoading(true);
        setError(null);

        console.log("[EVENT PAGE] Fetching events...");

        const response = await fetch("/api/events", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-user-name": user?.name || "",
            "x-user-email": user?.email || "",
          },
          cache: "no-store",
        });

        const data = await response.json();

        console.log("[EVENT PAGE RESPONSE]", data);

        if (!response.ok) {
          throw new Error(
            data?.error || "Failed to fetch events"
          );
        }

        if (Array.isArray(data?.events)) {
          setEvents(data.events);
        } else {
          setEvents([]);
        }

      } catch (err: any) {

        console.error("[EVENT PAGE ERROR]", err);

        setError(
          err?.message || "Failed to connect to backend"
        );

      } finally {

        setLoading(false);

      }

    };

    fetchEvents();

  }, [user]);

  return (
    <div className="min-h-screen bg-[#FDF8F1]">

      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-16">

        {/* Header */}

        <div className="text-center mb-16">

          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#2D3436] mb-4">
            Upcoming Experiences
          </h1>

          <p className="text-gray-600 text-lg mb-8">
            Join guided sessions to reconnect and reset.
          </p>

          <button className="bg-[#E6BC6B] text-white px-10 py-2.5 rounded-full font-medium hover:opacity-90 transition-all duration-300">
            All
          </button>

        </div>

        {/* Error */}

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-center mb-8">
            {error}
          </div>
        )}

        {/* Loading */}

        {loading ? (

          <div className="flex flex-col items-center justify-center py-20">

            <Loader2
              className="animate-spin text-[#E6BC6B]"
              size={40}
            />

          </div>

        ) : (

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">

            {events.length > 0 ? (

              events.map((event, index) => (

                <div
                  key={index}
                  className="bg-white rounded-[32px] p-8 shadow-sm border border-dashed border-gray-200 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >

                  <div>

                    <div className="flex justify-between items-start mb-6">

                      <h3 className="text-2xl font-bold text-[#2D3436] leading-snug">
                        {event.title || "Experience"}
                      </h3>

                      <div className="flex flex-col gap-2 shrink-0">

                        <span className="bg-[#EBF2FF] text-[#4A86F7] text-xs px-3 py-1 rounded-full border border-[#D0E0FF]">
                          {event.type || "Online"}
                        </span>

                        <span className="bg-[#FFF8EC] text-[#E6BC6B] text-xs px-3 py-1 rounded-full border border-[#FFEBC2]">
                          ₹{event.price || 0}
                        </span>

                      </div>

                    </div>

                    <div className="space-y-4 mb-8 text-gray-500">

                      <div className="flex items-center gap-3">
                        <Calendar size={18} />
                        <span>{event.date || "Everyday"}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <Clock size={18} />
                        <span>{event.time || "08:30 PM"}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <MapPin size={18} />
                        <span>{event.location || "Zoom"}</span>
                      </div>

                    </div>

                  </div>

                  <button
                    onClick={() => {

                      if (event.zoom_link) {

                        window.open(
                          event.zoom_link,
                          "_blank"
                        );

                      } else {

                        alert("Zoom link not available yet.");

                      }

                    }}
                    className="w-full bg-[#E6BC6B] text-white py-4 rounded-2xl font-bold transition-all duration-300 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Register now
                  </button>

                </div>

              ))

            ) : (

              <div className="col-span-full text-center py-20 text-gray-500">
                No events available right now.
              </div>

            )}

          </div>

        )}

      </main>

    </div>
  );
};

export default EventsPage;