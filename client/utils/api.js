// lib/strapi-api.js

// FIX: Now reading the guaranteed server-side variable defined in next.config.js
// If STRAPI_BASE_URL is not set, it defaults to the local Strapi API path.
const STRAPI_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

/**
 * Strapi JSON response mein se 'data' aur 'attributes' nesting ko hatane ke liye helper function.
 */
export function flattenStrapiResponse(response) {
  if (!response || !response.data) return [];
  
  // Array response ke liye (jaise ki /api/posts ya category list)
  if (Array.isArray(response.data)) {
    return response.data.map(item => ({
      id: item.id,
      ...item.attributes,
    }));
  }
  
  // Single item response ke liye (jaise ki /api/posts/1)
  return {
    id: response.data.id,
    ...response.data.attributes,
  };
}


/**
 * Generic function to fetch data from Strapi
 * @param {string} path - Strapi API endpoint (e.g., 'posts')
 * @param {string} urlParams - Query parameters (e.g., '?populate=*')
 */
export async function fetchStrapi(path, urlParams = '') {
  // Ensure the base URL does NOT end with a slash and the path does NOT start with one.
  const baseUrl = STRAPI_API_URL.endsWith('/') ? STRAPI_API_URL.slice(0, -1) : STRAPI_API_URL;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  const requestUrl = `${baseUrl}/${cleanPath}${urlParams}`;
  
  // DEBUGGING STEP: Log the final URL to the Next.js server console
  console.log(`[Strapi Fetching]: ${requestUrl}`);
  
  try {
    const response = await fetch(requestUrl, {
      // ISR/Caching configuration for static generation
      next: { revalidate: 60 } 
    });

    if (!response.ok) {
      console.error(`Strapi API Error: ${response.status} for URL: ${requestUrl}`);
      // Agar 404/500 ho, toh null return karen
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Fetch network/parsing error:', error);
    return null;
  }
}
