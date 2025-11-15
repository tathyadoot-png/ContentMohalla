// lib/strapi-api.js

// FIX: 'localhost' ki jagah '127.0.0.1' ka उपयोग कर रहे हैं ताकि Next.js सर्वर-साइड फ़ेचिंग में नेटवर्क समस्या न हो।
const STRAPI_API_URL = process.env.STRAPI_BASE_URL || 'http://127.0.0.1:1337/api';

/**
 * Strapi JSON response mein se 'data' aur 'attributes' nesting ko hatane ke liye helper function.
 */
export function flattenStrapiResponse(response) {
  if (!response || !response.data) return [];
  
  // Array response ke liye (jaise ki /api/posts ya category list)
  if (Array.isArray(response.data)) {
    return response.data.map((item) => {
      if (item.attributes && typeof item.attributes === 'object') {
        return { id: item.id, ...item.attributes };
      } else {
        return item;
      }
    });
  }
  
  // Single item response ke liye (jaise ki /api/posts/1)
  const item = response.data;
  if (item.attributes && typeof item.attributes === 'object') {
    return { id: item.id, ...item.attributes };
  } else {
    return item;
  }
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
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Fetch network/parsing error:', error);
    return null;
  }
}

// NEW HELPER: Strapi ke partial URL ko full URL mein convert karta hai
export function getStrapiMedia(url) {
    if (!url) return null;
    
    // Check if URL is already absolute (e.g., from Cloudinary)
    if (url.startsWith('http') || url.startsWith('//')) {
        return url;
    }
    
    // Use the public base URL defined in .env.local
    const baseUrl = process.env.NEXT_PUBLIC_STRAPI_BASE || 'http://localhost:1337';

    // Remove leading slash from the URL before joining
    const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
    
    return `${baseUrl}/${cleanUrl}`;
}

/**
 * ✅ FIX: Strapi JSON Blocks (Rich Text) को HTML में कन्वर्ट करता है।
 * @param {Array<Object> | string} content 
 * @returns {string} HTML string
 */
export function parseStrapiContent(content) {
  if (!content) return '';

  // If content is already a string (simple text), return it
  if (typeof content === 'string') return content;
  
  // If it's the Strapi Blocks JSON array:
  if (Array.isArray(content)) {
    return content.map(block => {
      if (block.type === 'paragraph' && block.children) {
        // Extract plain text from children nodes
        const text = block.children
          .map(child => {
            // Apply basic formatting if present (e.g., bold)
            let innerText = child.text || '';
            if (child.bold) innerText = `<strong>${innerText}</strong>`;
            return innerText;
          })
          .join('');
        return `<p>${text}</p>`;
      }
      // Handle other block types (e.g., heading, list) if you need them
      return ''; 
    }).join('');
  }

  return '';
}
