import { NextRequest, NextResponse } from "next/server"

const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL || "http://localhost:8000"
const API_KEY = process.env.API_KEY || "andai"

/* ---------------- POST ---------------- */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const name = request.headers.get("x-user-name") || ""
    const email = request.headers.get("x-user-email") || ""

    const params = new URLSearchParams()

    if (name) params.append("name", name)
    if (email) params.append("email", email)

    const url = `${FASTAPI_BASE_URL}/api/self-reflection${
      params.toString() ? `?${params.toString()}` : ""
    }`

    const response = await fetch(url, {
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

    return NextResponse.json(data)
  } catch (error) {
    console.error("[API Route] Error submitting reflection:", error)

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

/* ---------------- GET ---------------- */

export async function GET(request: NextRequest) {
  try {
    const name = request.headers.get("x-user-name") || ""
    const email = request.headers.get("x-user-email") || ""

    const params = new URLSearchParams()

    if (name) params.append("name", name)
    if (email) params.append("email", email)

    const url = `${FASTAPI_BASE_URL}/api/self-reflection${
      params.toString() ? `?${params.toString()}` : ""
    }`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-API-Key": API_KEY,
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error || "Failed to fetch reflection history" },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[API Route] Error fetching reflection history:", error)

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}