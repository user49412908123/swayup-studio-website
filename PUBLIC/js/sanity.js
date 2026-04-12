const SANITY_PROJECT_ID = "509u1k2c"; // remplace ici
const SANITY_DATASET = "production";
const BASE_URL = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2023-01-01/data/query/${SANITY_DATASET}`;

function imageUrl(ref) {
  const [, id, dimensions, ext] = ref.split("-");
  return `https://cdn.sanity.io/images/${SANITY_PROJECT_ID}/${SANITY_DATASET}/${id}-${dimensions}.${ext}`;
}

async function sanityFetch(query) {
  const res = await fetch(`${BASE_URL}?query=${encodeURIComponent(query)}`);
  const { result } = await res.json();
  return result;
}

async function loadPortfolio() {
  const items = await sanityFetch(
    '*[_type == "portfolio"] | order(_createdAt desc)',
  );
  const grid = document.getElementById("portfolio-grid");
  if (!grid || !items) return;

  grid.innerHTML = items
    .map(
      (item) => `
    <div class="portfolio-card">
      ${item.mainImage ? `<img src="${imageUrl(item.mainImage.asset._ref)}" alt="${item.title}" loading="lazy">` : ""}
      <div class="portfolio-card__body">
        <span class="portfolio-card__cat">${item.category || ""}</span>
        <h3>${item.title}</h3>
        <p>${item.description || ""}</p>
      </div>
    </div>
  `,
    )
    .join("");
}

async function loadBlog() {
  const posts = await sanityFetch(
    '*[_type == "post"] | order(publishedAt desc)',
  );
  const grid = document.getElementById("blog-grid");
  if (!grid || !posts) return;

  grid.innerHTML = posts
    .map(
      (post) => `
    <article class="blog-card">
      ${post.mainImage ? `<img src="${imageUrl(post.mainImage.asset._ref)}" alt="${post.title}" loading="lazy">` : ""}
      <div class="blog-card__body">
        <time>${post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("fr-BE") : ""}</time>
        <h3>${post.title}</h3>
      </div>
    </article>
  `,
    )
    .join("");
}

// Auto-détecte la page et charge les bons contenus
if (document.getElementById("portfolio-grid")) loadPortfolio();
if (document.getElementById("blog-grid")) loadBlog();
