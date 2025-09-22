// Cloudflare Pages function to proxy API requests to bound worker service
// This handles all /api/* routes by forwarding them to the bound worker

interface Env {
  API: {
    fetch: (request: Request) => Promise<Response>;
  }; // The bound worker service
  DB?: any; // D1 database binding (if needed)
}

interface PagesContext {
  request: Request;
  env: Env;
  params: any;
  next: () => Promise<Response>;
}

export async function onRequest(context: PagesContext): Promise<Response> {
  const { request, env } = context;

  try {
    // Forward the request to the bound worker service
    // The worker service will handle all the API logic
    const response = await env.API.fetch(request);

    // Return the response from the worker service
    return response;
  } catch (error) {
    console.error("Pages function error:", error);

    // Return a generic error response
    return new Response(
      JSON.stringify({
        error: "API service unavailable",
        message:
          "The API service is temporarily unavailable. Please try again later.",
      }),
      {
        status: 503,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      }
    );
  }
}
