import { load as loadYaml } from "js-yaml";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";

const site = {
  url: "https://davidthomasorganist.co.uk",
  formAction: "https://formspree.io/f/xdearywg",
  year: new Date().getFullYear(),
  // David's Google Business Profile ("David Thomas Piano Lessons").
  placeId: "ChIJnTuyKkAxh4cRnkn1aMaMLZI",
  // Changes on every build so browsers fetch the new stylesheet after a deploy.
  version: Date.now().toString(36),
};

// Fetches David's Google reviews once per build (the deploy runs daily and on every
// edit). Needs GOOGLE_PLACES_KEY; without it, or if Google is unreachable, the
// Reviews section shows a link to Google instead.
async function fetchGoogleReviews() {
  const key = process.env.GOOGLE_PLACES_KEY;
  if (!key) return null;
  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${site.placeId}?languageCode=en-GB`,
      {
        headers: {
          "X-Goog-Api-Key": key,
          "X-Goog-FieldMask": "rating,userRatingCount,reviews",
          // The key is restricted to the site's address.
          Referer: `${site.url}/`,
        },
      },
    );
    if (!res.ok) throw new Error(`Places API ${res.status}`);
    const place = await res.json();
    const reviews = (place.reviews || [])
      .filter((r) => r.text?.text)
      .map((r) => ({
        rating: r.rating,
        text: r.text.text.length > 360 ? r.text.text.slice(0, 340).replace(/\s+\S*$/, "") + "…" : r.text.text,
        author: r.authorAttribution?.displayName,
        authorUrl: r.authorAttribution?.uri,
        authorPhoto: r.authorAttribution?.photoUri,
        when: r.relativePublishTimeDescription,
      }));
    return { rating: place.rating, count: place.userRatingCount, reviews };
  } catch (err) {
    console.warn(`[reviews] Could not load Google reviews: ${err.message}`);
    return null;
  }
}

export default function (eleventyConfig) {
  // content/*.yml (edited in Pages CMS) become template data: content/photos.yml -> `photos`
  eleventyConfig.addDataExtension("yml", (contents) => loadYaml(contents));
  eleventyConfig.addGlobalData("site", site);
  eleventyConfig.addGlobalData("googleReviews", fetchGoogleReviews);

  eleventyConfig.addPassthroughCopy("style.css");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("recordings");

  eleventyConfig.addFilter("nl2br", (str) => String(str ?? "").replace(/\r?\n/g, "<br />"));
  eleventyConfig.addFilter("encodeURI", (str) => encodeURI(str ?? ""));
  eleventyConfig.addFilter("isoDate", (date) => new Date(date).toISOString().slice(0, 10));

  // schema.org data so search engines understand who David is and what he offers.
  eleventyConfig.addFilter("jsonLd", (site, home, settings) => {
    const person = {
      "@type": "Person",
      "@id": `${site.url}/#david`,
      name: "David Thomas",
      honorificSuffix: home.qualifications,
      jobTitle: "Organist, pianist and music teacher",
      url: `${site.url}/`,
      image: home.image ? `${site.url}${home.image}` : undefined,
      sameAs: [
        "https://www.facebook.com/profile.php?id=1342925540",
        "https://www.instagram.com/david.thomas096/",
      ],
    };
    const lessons = {
      "@type": "LocalBusiness",
      "@id": `${site.url}/#lessons`,
      name: "David Thomas – Piano, Organ and Music Theory Lessons",
      description: settings.description,
      url: `${site.url}/`,
      image: home.image ? `${site.url}${home.image}` : undefined,
      founder: { "@id": `${site.url}/#david` },
      address: {
        "@type": "PostalAddress",
        addressLocality: "Sanderstead, South Croydon",
        addressCountry: "GB",
      },
      areaServed: ["Sanderstead", "South Croydon", "Croydon", "Purley", "Warlingham"],
      // David's Google Business Profile, so Google ties the site to its reviews.
      hasMap: "https://maps.google.com/?cid=10533229887281777054",
      sameAs: ["https://maps.google.com/?cid=10533229887281777054"],
    };
    const json = JSON.stringify({ "@context": "https://schema.org", "@graph": [person, lessons] });
    return json.replace(/</g, "\\u003c");
  });

  // Every <img> in the page is resized to at most 1600px wide and served as
  // WebP with a JPEG fallback, so uploads straight off a phone stay small.
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    formats: ["webp", "jpeg"],
    widths: [1600],
    urlPath: "/img/",
    outputDir: "_site/img/",
    sharpJpegOptions: { quality: 80, mozjpeg: true },
    sharpWebpOptions: { quality: 80 },
    htmlOptions: {
      imgAttributes: { loading: "lazy", decoding: "async" },
    },
  });

  return {
    templateFormats: ["njk"],
    dir: {
      input: ".",
      data: "content",
      output: "_site",
    },
  };
}
