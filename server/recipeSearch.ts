import axios from 'axios';

const culturalSiteMap: Record<string, string[]> = {
  indian: [
    "hebbarskitchen.com",
    "tarladalal.com",
    "indianhealthyrecipes.com",
    "ranveerbrar.com",
    "sanjeevkapoor.com",
    "archanaskitchen.com",
    "manjulaskitchen.com",
    "ministryofcurry.com",
    "mallikabasu.com"
  ],

  italian: [
    "giallozafferano.com",
    "nonnabox.com",
    "italianfoodforever.com",
    "insidetherustickitchen.com",
    "pinabresciani.com",
    "theitaliandishblog.com",
    "italianhomecooking.co.uk"
  ],

  mexican: [
    "mexicanplease.com",
    "molemama.com",
    "holajalapeno.com",
    "isabeleats.com",
    "chicanoeats.com"
  ],

  chinese: [
    "thewoksoflife.com",
    "omnivorescookbook.com",
    "redhousespice.com",
    "madewithlau.com",
    "eatchofood.com"
  ],

  western: [
    "seriouseats.com",
    "foodnetwork.com",
    "bonappetit.com",
    "smittenkitchen.com",
    "pinchofyum.com",
    "saveur.com"
  ]
};

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
  "bonappetit.com": "https://www.bonappetit.com/search?q=",
  "chewingthefat.us.com": "https://chewingthefat.us.com/?s=",
  "chicanoeats.com": "https://chicanoeats.com/?s=",
  "isabeleats.com": "https://www.isabeleats.com/#search/q=",
  "holajalapeno.com": "https://www.holajalapeno.com/#search/q=",
  "molemama.com": "https://www.molemama.com/search?q=",
  "mexicanplease.com": "https://www.mexicanplease.com/?s=",
  "eatchofood.com": "https://eatchofood.com/search?q=",
  "omnivorescookbook.com": "https://omnivorescookbook.com/?s=",
  "redhousespice.com": "https://redhousespice.com/#search/q=",
  "tarladalal.com": "https://www.tarladalal.com/recipesearch/?query=",
  "thewoksoflife.com": "https://thewoksoflife.com/#search/q=",
  "giallozafferano.com": "https://www.giallozafferano.com/recipes-search/",
  "nonnabox.com": "https://www.nonnabox.com/?s=",
  "italianfoodforever.com": "https://italianfoodforever.com/?s=",
  "italianhomecooking.co.uk": "https://italianhomecooking.co.uk/?s=",
  "pinabresciani.com": "https://pinabresciani.com/?s=",
  "smittenkitchen.com": "https://smittenkitchen.com/?s=",
  "indianhealthyrecipes.com": "https://www.indianhealthyrecipes.com/?s=",
  "pinchofyum.com": "https://pinchofyum.com/?s=",
  "ranveerbrar.com": "https://ranveerbrar.com/?s=",
  "sanjeevkapoor.com": "https://www.sanjeevkapoor.com/search?title=",
  "mallikabasu.com": "https://mallikabasu.com/?s=",
  "ministryofcurry.com": "https://ministryofcurry.com/#search/q=",
  "theitaliandishblog.com": "https://www.theitaliandishblog.com/search?q=",
  "archanaskitchen.com": "https://www.archanaskitchen.com/search?q=",
  "madewithlau.com": "https://www.madewithlau.com/recipes/",
  "insidetherustickitchen.com": "https://www.insidetherustickitchen.com/#search/q="
};
function resolveCuisine(recipeName: string, culture: string = ""): string {
  const dish = recipeName.toLowerCase();
  const userCulture = culture?.toLowerCase() || "";

  // 🍝 Italian
  if (dish.match(/pasta|risotto|lasagna|pizza|alfredo|carbonara/)) return "italian";

  // 🌮 Mexican
  if (dish.match(/taco|burrito|quesadilla|enchilada|guacamole/)) return "mexican";

  // 🥡 Chinese
  if (dish.match(/noodles|fried rice|dumpling|manchurian|spring roll/)) return "chinese";

  // 🍛 Indian
  if (dish.match(/curry|dal|roti|paneer|biryani|masala|sabzi/)) return "indian";

  // 🌏 fallback: user culture
  if (userCulture.includes("indian")) return "indian";
  if (userCulture.includes("italian")) return "italian";
  if (userCulture.includes("mexican")) return "mexican";
  if (userCulture.includes("chinese")) return "chinese";

  return "western";
}
function normalizeCuisine(recipeName: string, culture: string = ""): string {
  const c = culture?.toLowerCase() || "";

  if (c.includes("indian")) return "indian";
  if (c.includes("italian")) return "italian";
  if (c.includes("mexican")) return "mexican";
  if (c.includes("chinese")) return "chinese";
  if (c.includes("any cuisine")) return "western";
  return "western"; // fallback
}
export function generateSiteSearchLinks(query: string, culture: string): string | null {
  const cuisine = normalizeCuisine(query, culture);
  const allowedSites = culturalSiteMap[cuisine] || culturalSiteMap["indian"];

  const filteredLinks = Object.entries(siteSearchMap)
    .filter(([site]) =>
      allowedSites.some(s => site === s || site.endsWith(`.${s}`))
    )
    .map(([site, baseUrl]) => ({
      site,
      url: `${baseUrl}${encodeURIComponent(query)}`
    }));

  if (filteredLinks.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * filteredLinks.length);
  return filteredLinks[randomIndex].url;
}

// Google Custom Search API for cooking blogs
// Falls back to a crafted Google search URL if API fails or key missing
function generateQueryVariants(recipeName: string) {
  return [
    recipeName,
    `${recipeName} recipe`,
    `${recipeName} easy recipe`,
    `${recipeName} homemade`,
    `${recipeName} how to make`,
  ];

}
export async function searchCookingBlog(recipeName: string, culture: string, retryCount = 0): Promise<string | null> {
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
  const variants = generateQueryVariants(recipeName);
  const currentQuery = variants[Math.min(retryCount, variants.length - 1)];
  const cuisine = normalizeCuisine(recipeName, culture);
  const popularCookingSites = culturalSiteMap[cuisine] || culturalSiteMap["indian"];
  
  // Fallback: a Google search scoped to popular cooking sites
  const fallbackUrl = `https://www.google.com/search?q=${encodeURIComponent(
    `${recipeName} recipe (${popularCookingSites.map(s => `site:${s}`).join(" OR ")})`
  )}&safe=active`;  
  if (!apiKey || !searchEngineId) {
    return fallbackUrl;
  }

  try {


    const siteQuery = popularCookingSites.map(site => `site:${site}`).join(" OR ");

    const q = `${recipeName} recipe (${siteQuery})`;
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: apiKey,
        cx: searchEngineId,
        q: q,
        num: 10,
        safe: 'active'
      }, 
    }, {timeout: 5000});

    if (!response.data.items || response.data.items.length === 0) {
      return fallbackUrl;
    }
    
    function isRelevantResult(item: any, recipeName: string) {
      const title = item.title?.toLowerCase() || "";
      const snippet = item.snippet?.toLowerCase() || "";
      const link = item.link?.toLowerCase() || "";
      const normalizedQuery = recipeName.toLowerCase();

      // ❌ bad signals
      if (
        title.includes("search") ||
        snippet.includes("no results") ||
        snippet.includes("not found") ||
        snippet.includes("0 results") ||
        snippet.includes("did not match")
      ) {
        return false;
      }
      if (
        (link.includes("/category/") ||
        link.includes("/tag/") ||
        link.includes("/search")) && 
        (!link.includes("/recipe") &&
         !link.includes("-recipe") &&
         !link.includes("/recipes/"))
      ) {
        return false;
      }

      // ✅ URL looks like recipe
      if (
        link.includes("/recipe") ||
        link.includes("-recipe") ||
        link.includes("/recipes/") 
      ) {
        return true;
      }

      // ✅ strong match
      if (
        title.includes(normalizedQuery) &&
        !snippet.includes("no results") &&
        !snippet.includes("not found") &&
        !snippet.includes("0 results") &&
        !snippet.includes("did not match")
      ) {
        return true;
      }

      // ✅ partial match
      const words = normalizedQuery.split(" ");
      const matchCount = words.filter(word => title.includes(word)).length;

      if (matchCount >= Math.ceil(words.length / 2)) {
        return true;
      }

      // ✅ recipe-like content
      if (
        snippet.includes("ingredients") ||
        snippet.includes("instructions") ||
        snippet.includes("how to make") || 
        snippet.includes("method") || 
        snippet.includes("steps") ||
        snippet.includes("cook") || 
        snippet.includes("cooking")
      ) {
        return true;
      }

      return false;
    }
    const validLinks: string[] = [];

    for (const item of response.data.items || []) {
      try {
        const link = item.link;
        const domain = new URL(link).hostname.replace("www.", "");

        // ✅ Only allowed sites
        
        if (!popularCookingSites.some(site => domain === site || domain.endsWith(`.${site}`))) {
          continue;
        }

        // ✅ Only relevant results
        if (!isRelevantResult(item, recipeName)) {
          continue;
        }

        validLinks.push(link);
      } 
      catch (e){
        continue;
      }
    }

    // ✅ RANDOM SELECTION
    if (validLinks.length > 0) {
      const grouped: Record<string, string[]> = {};

      for (const link of validLinks) {
        const domain = new URL(link).hostname.replace("www.", "");
        if (!grouped[domain]) grouped[domain] = [];
          grouped[domain].push(link);
      }

      const domains = Object.keys(grouped);
      if (domains.length === 0) {
        return fallbackUrl;
      }
      const randomDomain = domains[Math.floor(Math.random() * domains.length)];
      const linksFromDomain = grouped[randomDomain];

      return linksFromDomain[Math.floor(Math.random() * linksFromDomain.length)];
    }

    // 🔁 RETRY LOGIC
    if (retryCount < variants.length - 1) {
      return searchCookingBlog(recipeName, culture, retryCount + 1);
    }

    // fallback
    return fallbackUrl;
  } catch (error: any) {
    console.error('Google Search API error:', error.response?.data || error.message);
    return fallbackUrl;
  }
}
function generateYouTubeQueryVariants(recipeName: string) {
  return [
    `${recipeName} recipe`,
    `${recipeName} how to make`,
    `${recipeName} easy recipe`,
    `${recipeName} step by step`,
    `${recipeName} cooking`,
    `best ${recipeName} recipe`,
  ];
}

function isRelevantVideo(item: any, recipeName: string) {
  const title = item.snippet?.title?.toLowerCase() || "";
  const description = item.snippet?.description?.toLowerCase() || "";
  const cuisine = resolveCuisine(recipeName, "");
  const query = `${recipeName} ${cuisine} recipe`.toLowerCase();

  if (
    title.includes("compilation") ||
    title.includes("shorts")      ||
    title.includes("#shorts")     ||
    title.length < 3              ||  
    title.includes("asmr")        ||
    title.includes("mukbang")     ||
    title.includes("tiktok")      ||
    title.includes("reels")       ||
    title.includes("viral")
  ) {
    return false;
  }

  if (title.includes(query)) return true;

  const words = query.split(" ");
  const matchCount = words.filter(word => title.includes(word)).length;

  if (matchCount >= Math.ceil(words.length / 2)) return true;

  if (
    title.includes("recipe") ||
    title.includes("how to make") ||
    description.includes("ingredients") ||
    description.includes("step by step") ||
    description.includes("procedure") || 
    description.includes("process")
  ) {
    return true;
  }

  return false;
}

export async function searchYouTubeRecipe(recipeName: string, retryCount = 0): Promise<string | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) return null;

  const variants = generateYouTubeQueryVariants(recipeName);
  const shuffled = [...variants].sort(() => 0.5 - Math.random());
  const query = shuffled[Math.min(retryCount, shuffled.length - 1)];
  
  try {
    const searchResponse = await axios.get(
      'https://www.googleapis.com/youtube/v3/search',
      {
        params: {
          part: 'snippet',
          q: query,
          type: 'video',
          videoCategoryId: '26',
          maxResults: 10,
          videoDuration: 'medium',
          key: apiKey,
          safeSearch: 'strict',
        },
      }, {timeout: 5000}
    );
    if (!searchResponse.data.items || searchResponse.data.items.length === 0) {
        return null;
    }

    const videoIds = searchResponse.data.items
      .map((item: any) => item.id.videoId)
      .filter(Boolean)
      .join(',');
    if (!videoIds) return null;
    
    const statsResponse = await axios.get(
      'https://www.googleapis.com/youtube/v3/videos',
      {
        params: {
          part: 'statistics',
          id: videoIds,
          key: apiKey,
        },
      }, {timeout: 5000}
    );
    if (!statsResponse.data.items || statsResponse.data.items.length === 0) {
      return null;
    }
    const videoMap = new Map(
      searchResponse.data.items.map((item: any) => [item.id.videoId, item])
    );

    const enrichedVideos = statsResponse.data.items.map((video: any) => {
      const original = videoMap.get(video.id);
      const views = parseInt(video.statistics?.viewCount || '0');
      const likes = parseInt(video.statistics?.likeCount || '0');
      const engagement = likes / (views || 1);
      return {
        id: video.id,
        score: Math.log10(views + 1) * 0.7 + engagement * 30,
        item: original,
      };
    });

    const validVideos = enrichedVideos.filter(v =>
      v.item && isRelevantVideo(v.item, recipeName)
    );

    if (validVideos.length > 0) {
      validVideos.sort((a, b) => b.score - a.score);
      const top = validVideos.slice(0, Math.min(3, validVideos.length));
      const selected = top[Math.floor(Math.random() * top.length)];

      return `https://www.youtube.com/watch?v=${selected.id}`;
    }

    if (retryCount < variants.length - 1) {
      return searchYouTubeRecipe(recipeName, retryCount + 1);
    }

    return `https://www.youtube.com/results?search_query=${encodeURIComponent(recipeName + " recipe")}`;
  } catch (error: any) {
    return null
  }
}

