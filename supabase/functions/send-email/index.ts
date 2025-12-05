// Keep only the essential type references
/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />

// Import from deps.ts
import { serve, createClient } from "./deps.ts";
import type { SupabaseClient } from "./deps.ts";
// Add Deno namespace declaration
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

// Define types for the request body
interface EmailRequest {
  to: string;
  subject: string;
  html: string;
}

// Define the expected response type
interface FunctionResponse {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Add proper type for the request handler
const handleRequest = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const requestBody: EmailRequest = await req.json()

    if (!requestBody.to || !requestBody.subject || !requestBody.html) {
      throw new Error('Missing required fields: to, subject, or html')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    // Initialize Supabase client with service role key
    const supabaseClient: SupabaseClient = createClient(
      supabaseUrl,
      supabaseKey,
      {
        global: { 
          headers: { 
            Authorization: req.headers.get('Authorization') || '' 
          } 
        }
      }
    )

    // Send email using Supabase's email service
    const { data, error } = await supabaseClient.functions.invoke('email', {
      body: { 
        to: requestBody.to, 
        subject: requestBody.subject, 
        html: requestBody.html 
      }
    })

    if (error) {
      console.error('Error invoking email function:', error)
      throw error
    }

    const response: FunctionResponse = { 
      success: true, 
      data 
    };

    return new Response(JSON.stringify(response), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      },
      status: 200,
    })
  } catch (error) {
    console.error('Error in send-email function:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const response: FunctionResponse = { 
      success: false, 
      error: errorMessage 
    };

    return new Response(JSON.stringify(response), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      },
      status: 400,
    })
  }
}

// Start the server
console.log('Send Email function started');
serve(handleRequest);