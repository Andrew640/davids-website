import { load as loadYaml } from "js-yaml";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";

const site = {
  url: "https://davidthomasorganist.co.uk",
  formAction: "https://formspree.io/f/xdearywg",
  year: new Date().getFullYear(),
  // Changes on every build so browsers fetch the new stylesheet after a deploy.
  version: Date.now().toString(36),
};

export default function (eleventyConfig) {
  // content/*.yml (edited in Pages CMS) become template data: content/photos.yml -> `photos`
  eleventyConfig.addDataExtension("yml", (contents) => loadYaml(contents));
  eleventyConfig.addGlobalData("site", site);

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
