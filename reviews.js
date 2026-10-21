// Loads David's latest Google reviews (Places API) when the Reviews section
// scrolls into view, so most page views never use an API call.
(function () {
  var list = document.getElementById("google-reviews");
  if (!list || !("IntersectionObserver" in window)) return;
  var summary = document.querySelector(".reviews-summary");

  function stars(n) {
    var s = "";
    for (var i = 0; i < Math.round(n); i++) s += "★";
    return s;
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }

  function render(place) {
    var reviews = (place.reviews || []).filter(function (r) {
      return r.text && r.text.text;
    });
    if (!reviews.length) return;

    list.textContent = "";
    reviews.forEach(function (r) {
      var card = el("figure", "review");
      var top = el("div", "stars", stars(r.rating));
      top.setAttribute("aria-label", r.rating + " out of 5 stars");
      card.appendChild(top);

      var text = r.text.text;
      if (text.length > 360) text = text.slice(0, 340).replace(/\s+\S*$/, "") + "…";
      card.appendChild(el("blockquote", null, text));

      var by = el("figcaption", "review-author");
      var author = r.authorAttribution || {};
      if (author.photoUri) {
        var img = el("img");
        img.src = author.photoUri;
        img.alt = "";
        img.width = 32;
        img.height = 32;
        img.loading = "lazy";
        img.referrerPolicy = "no-referrer";
        by.appendChild(img);
      }
      var name = author.uri ? el("a", null, author.displayName) : el("span", null, author.displayName);
      if (author.uri) {
        name.href = author.uri;
        name.target = "_blank";
        name.rel = "noopener";
      }
      by.appendChild(name);
      if (r.relativePublishTimeDescription) {
        by.appendChild(el("span", "review-when", r.relativePublishTimeDescription));
      }
      card.appendChild(by);
      list.appendChild(card);
    });

    var credit = document.querySelector(".reviews-attribution");
    if (credit) credit.hidden = false;

    if (summary && place.rating) {
      summary.textContent =
        place.rating.toFixed(1) + " ★ from " + place.userRatingCount + " reviews on Google";
      summary.hidden = false;
    }
  }

  function load() {
    var url =
      "https://places.googleapis.com/v1/places/" +
      encodeURIComponent(list.dataset.placeId) +
      "?languageCode=en-GB";
    fetch(url, {
      headers: {
        "X-Goog-Api-Key": list.dataset.key,
        "X-Goog-FieldMask": "rating,userRatingCount,reviews",
      },
    })
      .then(function (res) {
        if (!res.ok) throw new Error("Places API " + res.status);
        return res.json();
      })
      .then(render)
      .catch(function () {
        // Keep whatever is already shown (hand-entered reviews or just the button).
      });
  }

  var observer = new IntersectionObserver(
    function (entries) {
      if (entries[0].isIntersecting) {
        observer.disconnect();
        load();
      }
    },
    { rootMargin: "400px" }
  );
  observer.observe(list);
})();
