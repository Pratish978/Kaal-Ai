import { NextRequest, NextResponse } from "next/server"

const FASTAPI_BASE_URL =
  process.env.FASTAPI_BASE_URL || "http://127.0.0.1:8000"

const API_KEY = process.env.API_KEY

/* -------------------- POST -------------------- */

export async function POST(request: NextRequest) {
  try {
    if (!API_KEY) {
      console.error("[CONFIG ERROR] Missing API_KEY in .env.local")

      return NextResponse.json(
        { error: "Missing API configuration" },
        { status: 500 }
      )
    }

    const body = await request.json()

    /* ---------- GET USER HEADERS FROM FRONTEND ---------- */

    const name = request.headers.get("x-user-name") || ""
    const email = request.headers.get("x-user-email") || ""

    console.log("USER TRACKING:", { name, email })

    /* ---------- ADD QUERY PARAMS ---------- */

    const params = new URLSearchParams()

    if (name) params.append("name", name)
    if (email) params.append("email", email)

    const url = `${FASTAPI_BASE_URL}/api/chat${
      params.toString() ? `?${params.toString()}` : ""
    }`

    console.log("[CHAT API REQUEST]", {
      url,
      apiKeyLoaded: !!API_KEY,
    })

    /* ---------- CALL FASTAPI ---------- */

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("[FASTAPI ERROR]", data)

      return NextResponse.json(
        { error: data?.detail || "Backend error" },
        { status: response.status }
      )
    }

    return NextResponse.json({
      reply: data.reply || "No reply from KAAL.",
    })
  } catch (error) {
    console.error("[API CHAT ERROR]", error)

    return NextResponse.json(
      { error: "Unable to connect to backend" },
      { status: 500 }
    )
  }
}

/* -------------------- GET -------------------- */

export async function GET() {
  try {
    if (!API_KEY) {
      return NextResponse.json(
        { error: "Missing API configuration" },
        { status: 500 }
      )
    }

    const response = await fetch(`${FASTAPI_BASE_URL}/api/chat`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
      },
      cache: "no-store",
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("[FASTAPI ERROR]", data)

      return NextResponse.json(
        { error: data?.detail || "Backend error" },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[API CHAT ERROR]", error)

    return NextResponse.json(
      { error: "Unable to connect to backend" },
      { status: 500 }
    )
  }
}