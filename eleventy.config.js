import { load as loadYaml } from "js-yaml";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";

export default function (eleventyConfig) {
  // content/*.yml (edited in Pages CMS) become template data: content/photos.yml -> `photos`
  eleventyConfig.addDataExtension("yml", (contents) => loadYaml(contents));

  eleventyConfig.addPassthroughCopy("style.css");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("recordings");

  eleventyConfig.addFilter("nl2br", (str) => String(str ?? "").replace(/\r?\n/g, "<br />"));
  eleventyConfig.addFilter("encodeURI", (str) => encodeURI(str ?? ""));

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
