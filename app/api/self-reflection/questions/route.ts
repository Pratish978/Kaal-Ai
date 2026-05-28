import { NextRequest, NextResponse } from "next/server"

const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL || "http://localhost:8000"
const API_KEY = process.env.API_KEY || "andai"

export async function GET(request: NextRequest) {
 try {
  const response = await fetch(`${FASTAPI_BASE_URL}/self-reflection`, {
    method: "GET",
    headers: {
      "X-API-Key": API_KEY,
      "Content-Type": "application/json",
    },
  })
    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error || "Failed to fetch reflection questions" },
        { status: response.status }
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("[API Route] Error fetching reflection questions:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(`${FASTAPI_BASE_URL}/reflection/submit`, {
      method: "POST",
      headers: {
        "X-API-Key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error || "Failed to submit reflection" },
        { status: response.status }
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("[API Route] Error submitting reflection:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
