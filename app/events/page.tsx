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
    <div className="min-h-screen bg-[#FBF9F6] selection:bg-amber-100">

      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-16 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Header */}

        <div className="text-center mb-16">

          <h1 className="text-4xl md:text-5xl font-serif font-medium text-stone-800 mb-4 tracking-tight">
            Upcoming <span className="bg-gradient-to-r from-[#E9B666] to-[#dfa755] bg-clip-text text-transparent font-semibold">Experiences</span>
          </h1>

          <p className="text-stone-500 text-lg mb-8 max-w-xl mx-auto font-light leading-relaxed">
            Join curated guided sessions to reconnect, heal, and reset your core energy fields.
          </p>

          <button className="bg-gradient-to-r from-[#E9B666] to-[#dfa755] text-white px-10 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider shadow-md shadow-amber-500/[0.1] hover:brightness-[1.03] transition-all duration-300">
            All Sessions
          </button>

        </div>

        {/* Error */}

        {error && (
          <div className="max-w-md mx-auto bg-red-50 text-red-600 p-4 rounded-2xl border border-red-200 text-center mb-12 font-medium text-sm shadow-sm">
            {error}
          </div>
        )}

        {/* Loading */}

        {loading ? (

          <div className="flex flex-col items-center justify-center py-32">

            <Loader2
              className="animate-spin text-[#E9B666]"
              size={36}
            />

          </div>

        ) : (

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">

            {events.length > 0 ? (

              events.map((event, index) => (

                <div
                  key={index}
                  className="bg-white rounded-[2rem] p-8 shadow-lg shadow-stone-200/40 border border-stone-100 flex flex-col justify-between transition-all duration-500 hover:shadow-xl hover:shadow-amber-500/[0.02] hover:-translate-y-1 group relative overflow-hidden"
                >

                  {/* Luxury Top Border Accents */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-stone-200/60 to-transparent transition-all duration-500 group-hover:via-amber-400/50" />

                  <div>

                    <div className="flex justify-between items-start gap-4 mb-6">

                      <h3 className="text-xl font-bold text-stone-800 leading-snug tracking-tight group-hover:text-stone-900 transition-colors">
                        {event.title || "Experience Session"}
                      </h3>

                      <div className="flex flex-col gap-1.5 shrink-0 items-end">

                        <span className="bg-stone-50 text-stone-500 text-[11px] font-bold tracking-wider uppercase px-3 py-1 rounded-full border border-stone-200/60">
                          {event.type || "Online"}
                        </span>

                        <span className="bg-[#FAF8F5] text-[#dfa755] text-xs font-black px-3 py-1 rounded-full border border-amber-500/10 shadow-inner">
                          ₹{event.price || 0}
                        </span>

                      </div>

                    </div>

                    {/* Metadata Protocol Group */}
                    <div className="space-y-4 mb-8 text-stone-500 text-sm font-medium">

                      <div className="flex items-center gap-3 transition-colors group-hover:text-stone-600">
                        <Calendar size={16} className="text-[#E9B666] shrink-0" />
                        <span className="tracking-tight">{event.date || "Everyday"}</span>
                      </div>

                      <div className="flex items-center gap-3 transition-colors group-hover:text-stone-600">
                        <Clock size={16} className="text-[#E9B666] shrink-0" />
                        <span className="tracking-tight">{event.time || "08:30 PM"}</span>
                      </div>

                      <div className="flex items-center gap-3 transition-colors group-hover:text-stone-600">
                        <MapPin size={16} className="text-[#E9B666] shrink-0" />
                        <span className="tracking-tight line-clamp-1">{event.location || "Digital Workspace"}</span>
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
                    className="w-full bg-[#E9B666] hover:bg-[#dfa755] text-white py-3.5 rounded-full font-bold text-sm transition-all duration-300 shadow-sm active:scale-[0.98] border-none cursor-pointer"
                  >
                    Register now
                  </button>

                </div>

              ))

            ) : (

              <div className="col-span-full text-center py-24 text-stone-400 font-serif italic text-lg">
                No experiences available right now. Check back soon.
              </div>

            )}

          </div>

        )}

      </main>

    </div>
  );
};

export default EventsPage;