import axios from 'axios';

// YouTube Data API v3 search
export async function searchYouTubeRecipe(query: string): Promise<string | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  
  if (!apiKey) {
    console.warn('YouTube API key not configured');
    return null;
  }

  try {
    // Search for videos with the recipe query
    const searchResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: query,
        type: 'video',
        videoCategoryId: '26', // Howto & Style category
        maxResults: 5,
        order: 'relevance', // Most relevant first
        key: apiKey,
      },
    });

    if (!searchResponse.data.items || searchResponse.data.items.length === 0) {
      return null;
    }

    // Get video IDs to fetch statistics
    const videoIds = searchResponse.data.items.map((item: any) => item.id.videoId).join(',');
    
    // Fetch video statistics (views, likes)
    const statsResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        part: 'statistics,contentDetails',
        id: videoIds,
        key: apiKey,
      },
    });

    if (!statsResponse.data.items || statsResponse.data.items.length === 0) {
      return null;
    }

    // Sort by view count and recency (most viewed + recent)
    const sortedVideos = statsResponse.data.items.sort((a: any, b: any) => {
      const viewsA = parseInt(a.statistics.viewCount || '0');
      const viewsB = parseInt(b.statistics.viewCount || '0');
      return viewsB - viewsA;
    });

    // Return the most popular video URL
    const topVideo = sortedVideos[0];
    return `https://www.youtube.com/watch?v=${topVideo.id}`;
  } catch (error: any) {
    console.error('YouTube API error:', error.response?.data || error.message);
    return null;
  }
}

// Google Custom Search API for cooking blogs
export async function searchCookingBlog(query: string): Promise<string | null> {
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
  
  if (!apiKey || !searchEngineId) {
    console.warn('Google Custom Search API not configured');
    return null;
  }

  try {
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: apiKey,
        cx: searchEngineId,
        q: `${query} recipe`,
        num: 5,
        dateRestrict: 'y1', // Within last year for recent content
        sort: 'date', // Sort by date
      },
    });

    if (!response.data.items || response.data.items.length === 0) {
      return null;
    }

    // Filter for popular cooking domains
    const popularCookingSites = [
      'allrecipes.com',
      'foodnetwork.com',
      'bonappetit.com',
      'epicurious.com',
      'seriouseats.com',
      'tasty.co',
      'delish.com',
      'bbcgoodfood.com',
      'simplyrecipes.com',
      'thespruceeats.com',
    ];

    // Try to find results from popular cooking sites first
    for (const item of response.data.items) {
      const domain = new URL(item.link).hostname.replace('www.', '');
      if (popularCookingSites.some(site => domain.includes(site))) {
        return item.link;
      }
    }

    // If no popular site found, return the first result
    return response.data.items[0].link;
  } catch (error: any) {
    console.error('Google Search API error:', error.response?.data || error.message);
    return null;
  }
}
