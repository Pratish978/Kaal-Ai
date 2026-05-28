import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {

    const audioBuffer = await req.arrayBuffer()

    const response = await fetch(
      "https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true",
      {
        method: "POST",
        headers: {
          Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
          "Content-Type": "audio/webm",
        },
        body: audioBuffer,
      }
    )

    const data = await response.json()

    const transcript =
      data?.results?.channels?.[0]?.alternatives?.[0]?.transcript || ""

    return NextResponse.json({
      text: transcript,
    })

  } catch (error) {

    console.error("STT crash:", error)

    return NextResponse.json(
      { error: "Speech recognition failed" },
      { status: 500 }
    )

  }
}
