import { NextRequest, NextResponse } from "next/server"

const FASTAPI_BASE_URL =
  process.env.FASTAPI_BASE_URL || "http://127.0.0.1:8000"

const API_KEY = process.env.API_KEY?.trim()

/* ---------------- GET EVENTS ---------------- */

export async function GET(request: NextRequest) {
  try {

    if (!API_KEY) {

      console.error("[CONFIG ERROR] Missing API_KEY")

      return NextResponse.json(
        { error: "Missing API configuration" },
        { status: 500 }
      )
    }

    const name = request.headers.get("x-user-name") || ""
    const email = request.headers.get("x-user-email") || ""

    const params = new URLSearchParams()

    if (name) params.append("name", name)
    if (email) params.append("email", email)

    const url = `${FASTAPI_BASE_URL}/events${
      params.toString() ? `?${params.toString()}` : ""
    }`

    console.log("========== EVENTS DEBUG ==========")
    console.log("FASTAPI URL:", url)
    console.log("API KEY EXISTS:", !!API_KEY)
    console.log("API KEY VALUE:", API_KEY)
    console.log("=================================")

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
      },
      cache: "no-store",
    })

    const data = await response.json()

    console.log("[EVENTS RESPONSE STATUS]", response.status)
    console.log("[EVENTS RESPONSE DATA]", data)

    if (!response.ok) {

      return NextResponse.json(
        { error: data?.detail || "Failed to fetch events" },
        { status: response.status }
      )
    }

    return NextResponse.json(data)

  } catch (error) {

    console.error("[EVENTS API ERROR]", error)

    return NextResponse.json(
      { error: "Unable to fetch events" },
      { status: 500 }
    )

  }
}


/* ---------------- CREATE EVENT ---------------- */

export async function POST(request: NextRequest) {
  try {

    if (!API_KEY) {

      console.error("[CONFIG ERROR] Missing API_KEY")

      return NextResponse.json(
        { error: "Missing API configuration" },
        { status: 500 }
      )
    }

    const body = await request.json()

    const name = request.headers.get("x-user-name") || ""
    const email = request.headers.get("x-user-email") || ""

    const params = new URLSearchParams()

    if (name) params.append("name", name)
    if (email) params.append("email", email)

    const url = `${FASTAPI_BASE_URL}/events${
      params.toString() ? `?${params.toString()}` : ""
    }`

    console.log("========== CREATE EVENT DEBUG ==========")
    console.log("FASTAPI URL:", url)
    console.log("API KEY EXISTS:", !!API_KEY)
    console.log("API KEY VALUE:", API_KEY)
    console.log("========================================")

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    console.log("[CREATE EVENT STATUS]", response.status)
    console.log("[CREATE EVENT RESPONSE]", data)

    if (!response.ok) {

      return NextResponse.json(
        { error: data?.detail || "Failed to create event" },
        { status: response.status }
      )
    }

    return NextResponse.json(data)

  } catch (error) {

    console.error("[EVENT CREATE ERROR]", error)

    return NextResponse.json(
      { error: "Unable to create event" },
      { status: 500 }
    )

  }
}