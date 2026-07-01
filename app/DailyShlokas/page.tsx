"use client";

import { useState } from "react";
import {
  Sun,
  Calendar,
  Bookmark,
  Globe,
  Languages,
  Lightbulb,
  Share2,
  Check,
} from "lucide-react";

interface Shloka {
  source: string;
  chapter: string;
  verse: string;
  sanskrit: string[];
  transliteration: string[];
  englishTranslation: string;
  hindiTranslation: string;
  lifeLesson: string;
  reflection: string;
}

const shlokas: Shloka[] = [
  {
    source: "Bhagavad Gita",
    chapter: "Chapter 2",
    verse: "Verse 47",
    sanskrit: [
      "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन ।",
      "मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि ॥",
    ],
    transliteration: [
      "karmanyevaadhikaaraste maa phaleshu kadaachana |",
      "maa karmaphalaheturbhoormaa te sango'stvakarmani ||",
    ],
    englishTranslation:
      "You have a right to perform your prescribed duty, but you are not entitled to the fruits of your actions. Do not be motivated by the results, nor should you be attached to inaction.",
    hindiTranslation:
      "तुम्हारा अधिकार केवल कर्म करने में है, फल में कभी नहीं। कर्म के फल की इच्छा तुम्हें नहीं करनी चाहिए, और न ही तुम अकर्मण्यता से जुड़ो।",
    lifeLesson:
      "Focus on your actions, not on the outcome. Do your best with honesty and dedication. When you let go of expectations, you experience true peace and joy.",
    reflection:
      "Am I focusing on my actions today, or am I too attached to the results?",
  },
];

function getShlokaOfTheDay(date: Date = new Date()): Shloka {
  const dayIndex = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
  return shlokas[dayIndex % shlokas.length];
}

export default function DailyShlokasPage() {
  const shloka = getShlokaOfTheDay();
  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareText = `${shloka.source} | ${shloka.chapter} | ${shloka.verse}\n\n${shloka.sanskrit.join(
      "\n"
    )}\n\n"${shloka.englishTranslation}"`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Shloka of the Day", text: shareText });
        return;
      } catch {
        // user cancelled share, fall back to clipboard
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#f2ece0] px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-[#fdf6ec] p-6 font-sans">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f4c063]">
              <Sun className="h-5 w-5 text-[#a8650f]" strokeWidth={2} />
            </div>
            <div>
              <h1 className="font-serif text-xl font-medium text-[#2c2416]">
                Shloka of the day
              </h1>
              <p className="text-[13px] text-[#8a7d68]">
                Wisdom to guide your day
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-[#e8d4a8] bg-[#fbeed7] px-3 py-1.5 text-[13px] text-[#a8650f]">
            <Calendar className="h-[15px] w-[15px]" strokeWidth={2} />
            {today}
          </div>
        </div>

        {/* Verse hero */}
        <div className="relative mb-5 rounded-[14px] bg-[linear-gradient(135deg,#f9e4bd_0%,#f6dcc7_60%,#f0d5c8_100%)] px-6 py-7">
          <button
            onClick={() => setSaved((s) => !s)}
            aria-label={saved ? "Remove bookmark" : "Bookmark this shloka"}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#fffdf8] transition"
          >
            <Bookmark
              className="h-[18px] w-[18px] text-[#c99a3e]"
              strokeWidth={2}
              fill={saved ? "currentColor" : "none"}
            />
          </button>

          <div className="mb-5 flex justify-center">
            <span className="rounded-full border border-[#e8d4a8] bg-[#fffdf8] px-4 py-1.5 text-xs font-medium tracking-wide text-[#a8650f]">
              {shloka.source.toUpperCase()} &nbsp;|&nbsp; {shloka.chapter.toUpperCase()} &nbsp;|&nbsp; {shloka.verse.toUpperCase()}
            </span>
          </div>

          <div
            className="mb-4 text-center text-[23px] leading-[1.9] text-[#3d2f18]"
            style={{ fontFamily: "'Tiro Devanagari Hindi', 'Noto Sans Devanagari', serif" }}
          >
            {shloka.sanskrit.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>

          <div className="text-center font-serif text-sm italic leading-relaxed text-[#8a7250]">
            {shloka.transliteration.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        </div>

        {/* Translations grid */}
        <div className="mb-4 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
          <InfoCard
            icon={<Globe className="h-[17px] w-[17px] text-[#a8650f]" strokeWidth={2} />}
            title="English translation"
          >
            {shloka.englishTranslation}
          </InfoCard>

          <InfoCard
            icon={<Languages className="h-[17px] w-[17px] text-[#a8650f]" strokeWidth={2} />}
            title="Hindi translation"
          >
            <span
              className="leading-[1.7]"
              style={{ fontFamily: "'Tiro Devanagari Hindi', 'Noto Sans Devanagari', serif" }}
            >
              {shloka.hindiTranslation}
            </span>
          </InfoCard>

          <InfoCard
            icon={<Lightbulb className="h-[17px] w-[17px] text-[#a8650f]" strokeWidth={2} />}
            title="Life lesson"
          >
            {shloka.lifeLesson}
          </InfoCard>
        </div>

        {/* Reflection footer */}
        <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-[#ece0c8] bg-[#fffdf8] px-5 py-4 sm:flex-row sm:items-center">
          <div className="flex max-w-md gap-2.5">
            <span className="font-serif text-2xl leading-none text-[#e0b567]">
              &ldquo;
            </span>
            <div>
              <p className="mb-1 text-sm font-medium text-[#2c2416]">
                Reflect for a moment
              </p>
              <p className="text-[13px] leading-snug text-[#8a7d68]">
                {shloka.reflection}
              </p>
            </div>
          </div>
          <button
            onClick={handleShare}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#e8d4a8] bg-[#fffdf8] px-4 py-2 text-[13px] text-[#a8650f] transition hover:bg-[#fbeed7]"
          >
            {copied ? (
              <>
                <Check className="h-[15px] w-[15px]" strokeWidth={2} />
                Copied
              </>
            ) : (
              <>
                <Share2 className="h-[15px] w-[15px]" strokeWidth={2} />
                Share shloka
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#ece0c8] bg-[#fffdf8] p-4">
      <div className="mb-2.5 flex items-center gap-2">
        {icon}
        <span className="text-sm font-medium text-[#2c2416]">{title}</span>
      </div>
      <p className="text-[13px] leading-relaxed text-[#5c5340]">{children}</p>
    </div>
  );
}