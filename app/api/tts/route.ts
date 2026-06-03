import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // 1. Parse and validate the incoming JSON request payload
    const body = await request.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json(
        { error: "Text is required for speech synthesis." },
        { status: 400 }
      );
    }

    // =====================================================================
    // 🔴 PREMIUM ACCESS GATING LAYER
    // =====================================================================
    
    // Resolve user identity seamlessly from proxy tracking headers or optional payload keys
    const userEmail = request.headers.get("x-user-email") || body.email;

    if (!userEmail) {
      console.error("Access Denied: Missing user identity tracking identifier context.");
      return NextResponse.json(
        { success: false, message: "Premium subscription required" },
        { status: 403 }
      );
    }

    let userProfile: any = null;

    try {
      // Fetch the authenticated user's snapshot directly from the FastAPI profile router
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/profile?email=${encodeURIComponent(userEmail)}`;
      
      console.log("PROFILE API URL:", url);

      const profileRes = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.NEXT_PUBLIC_API_KEY || ""
        }
      });

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        console.log("PROFILE RESPONSE:", profileData);
        
        // Extract nested profile payload or fallback to direct dictionary structure
        userProfile = profileData.user || profileData.data || profileData;
        console.log("USER PROFILE:", userProfile);
      }
    } catch (backendError) {
      console.error("Failed to sync structural authorization state with backend service:", backendError);
    }

    // Extract access permissions metrics safely
    const isPremium = userProfile?.premium === true || userProfile?.plan === "founding";
    const premiumExpiresAt = userProfile?.premium_expires_at;
    const now = new Date();

    // Required Diagnostic Logs
    console.log("premium:", isPremium);
    console.log("premium_expires_at:", premiumExpiresAt);
    console.log("current_time:", now.toISOString());

    // =====================================================================
    // 🔍 FIXED VALIDATION LOGIC
    // =====================================================================
    // Deny access ONLY if the user is not premium OR if an expiration date exists and has passed.
    // If premium_expires_at is null, the right side evaluates to false, correctly passing the user.
    if (!isPremium || (premiumExpiresAt && new Date(premiumExpiresAt) <= now)) {
      console.log("----------------------------------------");
      console.log("TTS AUTHENTICATION ACCESS LOGS");
      console.log("User Email:", userEmail);
      console.log("Premium Status:", isPremium);
      console.log("Premium Expiry:", premiumExpiresAt);
      console.log("Validation Result: ACCESS DENIED ❌");
      console.log("----------------------------------------");
      return NextResponse.json(
        {
          success: false,
          message: "Premium subscription required"
        },
        { status: 403 }
      );
    }

    console.log("----------------------------------------");
    console.log("TTS AUTHENTICATION ACCESS LOGS");
    console.log("User Email:", userEmail);
    console.log("Premium Status:", isPremium);
    console.log("Premium Expiry:", premiumExpiresAt);
    console.log("Validation Result: ACCESS PASSED ✅");
    console.log("----------------------------------------");

    // =====================================================================
    // 🟢 UNTOUCHED CORE ELEVENLABS AUDIO GENERATION PIPELINE
    // =====================================================================

    if (!process.env.ELEVENLABS_API_KEY) {
      console.error("ELEVENLABS_API_KEY is missing from environment variables.");
      return NextResponse.json(
        { error: "Server misconfiguration: ElevenLabs API key not found." },
        { status: 500 }
      );
    }

    try {
      // 3. Make the direct REST API call to ElevenLabs
      const response = await fetch(
        "https://api.elevenlabs.io/v1/text-to-speech/pNInz6obpgDQGcFmaJgB",
        {
          method: "POST",
          headers: {
            "xi-api-key": process.env.ELEVENLABS_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: text,
            model_id: "eleven_multilingual_v2",
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("ElevenLabs API Error Status:", response.status);
        console.error("ElevenLabs API Error Details:", errorText);
        
        return NextResponse.json(
          { error: "ElevenLabs API returned an error.", details: errorText },
          { status: response.status }
        );
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = Buffer.from(arrayBuffer);

      return new NextResponse(audioBuffer, {
        status: 200,
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "no-cache",
        },
      });

    } catch (fetchError: any) {
      console.error("ELEVENLABS FETCH FAILURE:", fetchError);
      return NextResponse.json(
        { error: fetchError.message || "Network error while connecting to ElevenLabs." },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("TTS Pipeline Global Exception:", error);
    return NextResponse.json(
      { error: error.message || "An internal error occurred during processing." },
      { status: 500 }
    );
  }
}