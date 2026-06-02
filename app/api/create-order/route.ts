import Razorpay from "razorpay";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // Collect and print every request header received using standard iterable entry mapping
  const receivedHeaders = Object.fromEntries(request.headers.entries());
  console.log("=== [CREATE-ORDER] RECEIVED REQUEST HEADERS ===", JSON.stringify(receivedHeaders, null, 2));

  try {
    // Validate API Key supporting both case-sensitive variations
    const apiKey = request.headers.get("X-API-Key") || request.headers.get("x-api-key");
    const expectedApiKey = process.env.NEXT_PUBLIC_API_KEY || process.env.API_KEY;

    console.log(`[CREATE-ORDER AUDIT] Received Key: ${apiKey ? "PRESENT" : "MISSING"}`);
    console.log(`[CREATE-ORDER AUDIT] Expected Server Key: ${expectedApiKey ? "CONFIGURED" : "MISSING"}`);

    if (!apiKey || apiKey !== expectedApiKey) {
      const errorBody = { error: "Unauthorized", detail: "API Key validation mismatch or missing header context." };
      console.log("=== [CREATE-ORDER] RESPONSE RETURNED ===", { status: 403, body: errorBody });
      
      return NextResponse.json(errorBody, { status: 403 });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("Server misconfiguration: Missing Razorpay keys.");
      const configErrorBody = { error: "Server misconfiguration" };
      console.log("=== [CREATE-ORDER] RESPONSE RETURNED ===", { status: 500, body: configErrorBody });

      return NextResponse.json(configErrorBody, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: 100, // ₹49
      currency: "INR",
      receipt: `kaal_${Date.now()}`,
    });

    console.log("=== [CREATE-ORDER] RESPONSE RETURNED ===", { status: 200, orderId: order.id, entity: "order" });
    return NextResponse.json(order, { status: 200 });

  } catch (error: any) {
    console.error("Razorpay Order Creation Error:", error);
    const exceptionBody = { error: error.message || "Failed to create order" };
    console.log("=== [CREATE-ORDER] RESPONSE RETURNED (EXCEPTION) ===", { status: 500, body: exceptionBody });

    return NextResponse.json(exceptionBody, { status: 500 });
  }
}