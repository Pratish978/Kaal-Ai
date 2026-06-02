import Razorpay from "razorpay";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Validate API Key
    const apiKey = request.headers.get("X-API-Key");

    if (apiKey !== process.env.NEXT_PUBLIC_API_KEY) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("Server misconfiguration: Missing Razorpay keys.");

      return NextResponse.json(
        { error: "Server misconfiguration" },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: 4900, // ₹49
      currency: "INR",
      receipt: `kaal_${Date.now()}`,
    });

    return NextResponse.json(order, { status: 200 });

  } catch (error: any) {
    console.error("Razorpay Order Creation Error:", error);

    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}