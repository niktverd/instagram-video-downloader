const IgDownloader = require("ig-downloader").IgDownloader;

const urls = [
  "https://www.instagram.com/p/DD6_fC1TkcK/?utm_source=ig_web_copy_link",
  'https://www.instagram.com/p/DETH0BfgGPi/',
];

const fetchInstagramData = async () => {
  for (const url of urls) {
    try {
      console.log(`Fetching data for: ${url}`);
      const data = await IgDownloader(url);
      console.log("Instagram Data:", data);
    } catch (error) {
      console.error(`Error fetching data for ${url}:`, error.message);
    }
  }
};

fetchInstagramData();
