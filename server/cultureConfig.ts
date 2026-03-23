export type Culture = 
  | "indian"
  | "chinese"
  | "italian"
  | "mexican"
  | "western";

export const cultureToSites: Record<Culture, string[]> = {
  indian: [
    "hebbarskitchen.com",
    "tarladalal.com",
    "indianhealthyrecipes.com",
    "sanjeevkapoor.com",
    "archanaskitchen.com"
  ],
  chinese: [
    "thewoksoflife.com",
    "omnivorescookbook.com",
    "madewithlau.com",
    "redhousespice.com"
  ],
  italian: [
    "giallozafferano.com",
    "nonnabox.com",
    "italianfoodforever.com",
    "insidetherustickitchen.com"
  ],
  mexican: [
    "mexicanplease.com",
    "isabeleats.com",
    "holajalapeno.com"
  ],
  western: [
    "seriouseats.com",
    "bonappetit.com",
    "foodnetwork.com",
    "smittenkitchen.com"
  ]
};
