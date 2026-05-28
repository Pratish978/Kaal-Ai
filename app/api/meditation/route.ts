import { NextRequest, NextResponse } from "next/server"

const FASTAPI_BASE_URL =
  process.env.FASTAPI_BASE_URL || "http://localhost:8000"

const API_KEY = process.env.API_KEY || "andai"

export async function GET(request: NextRequest) {
  try {

    const name = request.headers.get("x-user-name") || ""
    const email = request.headers.get("x-user-email") || ""

    const params = new URLSearchParams()

    if (name) params.append("name", name)
    if (email) params.append("email", email)

    const url = `${FASTAPI_BASE_URL}/meditation${
      params.toString() ? `?${params.toString()}` : ""
    }`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-API-Key": API_KEY,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    const data = await response.json()

    return NextResponse.json(data)

  } catch (error) {

    console.error("[Meditation API Error]", error)

    return NextResponse.json(
      { error: "Unable to fetch meditation" },
      { status: 500 }
    )

  }
}