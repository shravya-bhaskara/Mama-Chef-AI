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
// Falls back to a crafted Google search URL if API fails or key missing
export async function searchCookingBlog(query: string): Promise<string | null> {
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

  // Fallback: a Google search scoped to popular cooking sites
  const fallbackUrl = `https://www.google.com/search?q=${encodeURIComponent(query + ' recipe site:allrecipes.com OR site:bbcgoodfood.com OR site:simplyrecipes.com OR site:epicurious.com')}`;

  if (!apiKey || !searchEngineId) {
    return fallbackUrl;
  }

  try {
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: apiKey,
        cx: searchEngineId,
        q: `${query} recipe`,
        num: 5,
      },
    });

    if (!response.data.items || response.data.items.length === 0) {
      return fallbackUrl;
    }

    const popularCookingSites = [
      "krumpli.co.uk",
      "family-friends-food.com",
      "saveur.com",
      "thetinytaster.com",
      "tastefoodblog.com",
      "archanaskitchen.com",
      "stefangourmet.com",
      "foodperestroika.com",
      "eatingeuropean.com",
      "foodnetwork.com",
      "bonappetit.com",
      "chewingthefat.us.com",
      "seriouseats.com",
      "chicanoeats.com",
      "isabeleats.com",
      "holajalapeno.com",
      "molemama.com",
      "mexicanplease.com",
      "madewithlau.com",
      "eatchofood.com",
      "omnivorescookbook.com",
      "redhousespice.com",
      "thewoksoflife.com",
      "hebbarskitchen.com",
      "tarladalal.com",
      "giallozafferano.com",
      "nonnabox.com",
      "pinabresciani.com",
      "italianfoodforever.com",
      "insidetherustickitchen.com",
      "italianhomecooking.co.uk",
      "indianhealthyrecipes.com",
      "smittenkitchen.com",
      "pinchofyum.com",
      "ranveerbrar.com",
      "sanjeevkapoor.com",
      "mallikabasu.com",
      "ministryofcurry.com",
      "manjulaskitchen.com",
      "theitaliandishblog.com"
    ];

    const siteSearchMap: Record<string, string> = {
      "krumpli.co.uk": "https://www.krumpli.co.uk/#growMeSearch=",
      "hebbarskitchen.com": "https://hebbarskitchen.com/?s=",
      "seriouseats.com": "https://www.seriouseats.com/search?q=",
      "foodnetwork.com": "https://www.foodnetwork.com/search/",
      "family-friends-food.com": "https://family-friends-food.com/#growMeSearch=",
      "saveur.com": "https://www.saveur.com/#gsc.tab=0&gsc.q=",
      "thetinytaster.com": "https://www.thetinytaster.com/?s=",
      "tastefoodblog.com": "https://tastefoodblog.com/?s=", 
      "stefangourmet.com": "https://stefangourmet.com/?s=",
      "foodperestroika.com": "https://foodperestroika.com/?s=",
      "eatingeuropean.com": "https://eatingeuropean.com/?s=",
      "www.bonappetit.com": "https://www.bonappetit.com/search?q=",
      "chewingthefat.us.com": "https://chewingthefat.us.com/?s=",
      "seriouseats.com": "https://www.seriouseats.com/search?q=",
      "chicanoeats.com": "https://chicanoeats.com/?s=",
      "isabeleats.com": "https://www.isabeleats.com/#search/q=", 
      "holajalapeno.com": "https://www.holajalapeno.com/#search/q=", 
      "molemama.com": "https://www.molemama.com/search?q=", 
      "mexicanplease.com": "https://www.mexicanplease.com/?s=", 
      "eatchofood.com": "https://eatchofood.com/search?q=",
      "omnivorescookbook.com": "https://omnivorescookbook.com/?s=",
      "redhousespice.com": "https://redhousespice.com/#search/q=",
      "tarladalal.com": "https://www.tarladalal.com/recipesearch/?query=",
      "hebbarskitchen.com": "https://hebbarskitchen.com/?s=",
      "thewoksoflife.com": "https://thewoksoflife.com/#search/q=",
      "giallozafferano.com": "https://www.giallozafferano.com/recipes-search/",
      "nonnabox.com": "https://www.nonnabox.com/?s=bell",
      "italianfoodforever.com": "https://italianfoodforever.com/?s=",
      "italianhomecooking.co.uk": "https://italianhomecooking.co.uk/?s=",
      "pinabresciani.com": "https://pinabresciani.com/?s=",
      "italianhomecooking.co.uk": "https://italianhomecooking.co.uk/?s=",
      "smittenkitchen.com": "https://smittenkitchen.com/?s=",
      "indianhealthyrecipes.com": "https://www.indianhealthyrecipes.com/?s=",
      "pinchofyum.com": "https://pinchofyum.com/?s=#search/q=",
      "ranveerbrar.com": "https://ranveerbrar.com/?s=",
      "sanjeevkapoor.com": "https://www.sanjeevkapoor.com/search?title=",
      "mallikabasu.com": "https://mallikabasu.com/?s=",
      "ministryofcurry.com": "https://ministryofcurry.com/#search/q=",
      "theitaliandishblog.com": "https://www.theitaliandishblog.com/search?q="
};

    function generateSiteSearchLinks(query: string) {
      return Object.entries(siteSearchMap).map(([site, baseUrl]) => {
        return {
          site,
          url: `${baseUrl}${encodeURIComponent(query)}`
        };
      });
    }
    function isRelevantResult(item: any, recipeName: string) {
      const title = item.title?.toLowerCase() || "";
      const snippet = item.snippet?.toLowerCase() || "";
      const query = recipeName.toLowerCase();

      // ❌ obvious bad signals
      if (title.includes("search") || snippet.includes("no results")) {
        return false;
      }

      // ✅ URL looks like a recipe (ADD HERE)
      if (link.includes("/recipe") || link.includes("-recipe")) {
        return true;
      }
      // ✅ strong match
      if (title.includes(query)) return true;

      // ✅ partial match (keywords)
      const words = query.split(" ");
      const matchCount = words.filter(word => title.includes(word)).length;

      if (matchCount >= Math.ceil(words.length / 2)) {
        return true;
      }

      // ✅ recipe-like content
      if (
        snippet.includes("ingredients") ||
        snippet.includes("instructions") ||
        snippet.includes("how to make")
      ) {
        return true;
      }

      return false;
    }
    for (const item of response.data.items) {
      try {
        const domain = new URL(item.link).hostname.replace('www.', '');
        if (popularCookingSites.some(site => domain.includes(site))) {
          const validLinks: string[] = [];

        for (const item of response.data.items || []) {
          const link = item.link;
          const domain = new URL(link).hostname;

          // ✅ Only allowed sites
          if (!allowedSites.some(site => domain.includes(site))) {
            continue;
          }

          // ✅ Only relevant results
          if (!isRelevantResult(item, recipeName)) {
            continue;
          }

          validLinks.push(link);
        }
          if (validLinks.length > 0) {
            const randomIndex = Math.floor(Math.random() * validLinks.length);
            return validLinks[randomIndex];
          }
          
        }
      } catch {}
    }

    return response.data.items[0].link || null;
  } catch (error: any) {
    console.error('Google Search API error:', error.response?.data || error.message);
    return fallbackUrl;
  }
}
