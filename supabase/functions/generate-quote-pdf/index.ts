import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const { quoteId } = await req.json();

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();
    if (!user) throw new Error("No user found");

    // Fetch quote
    const { data: quote, error } = await supabaseClient
      .from("quotes")
      .select("*")
      .eq("id", quoteId)
      .eq("user_id", user.id)
      .single();

    if (error) throw error;
    if (!quote) throw new Error("Quote not found");

    // Generate simple PDF content (HTML-based)
    // In production, you might want to use a proper PDF library
    const pdfContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
            .quote-details { margin: 20px 0; }
            .price { font-size: 24px; font-weight: bold; color: #0066cc; }
          </style>
        </head>
        <body>
          <h1>Service Quote</h1>
          <div class="quote-details">
            <p><strong>Service:</strong> ${quote.service_type}</p>
            <p><strong>Location:</strong> ${quote.location}</p>
            <p><strong>Complexity:</strong> ${quote.complexity}</p>
            <p class="price">Total: $${quote.calculated_price.toFixed(2)}</p>
            <p>Price Range: $${quote.price_range_min.toFixed(2)} - $${quote.price_range_max.toFixed(2)}</p>
            <p><strong>Valid for:</strong> ${quote.quote_validity_days} days</p>
          </div>
          <p>Generated on: ${new Date(quote.created_at).toLocaleDateString()}</p>
        </body>
      </html>
    `;

    // Upload to storage
    const fileName = `${user.id}/${quoteId}.html`;
    const { error: uploadError } = await supabaseClient.storage
      .from("quote-pdfs")
      .upload(fileName, pdfContent, {
        contentType: "text/html",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabaseClient.storage
      .from("quote-pdfs")
      .getPublicUrl(fileName);

    return new Response(JSON.stringify({ pdfUrl: urlData.publicUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

