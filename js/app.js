document.addEventListener("DOMContentLoaded", function() {
    const grid = document.getElementById("recipe-grid");
    if (!grid) return;

    let allRecipes = [];
    let currentCat = "todas";
    let searchTerm = "";

    fetch("data/recipes.json")
        .then(r => r.json())
        .then(recipes => {
            allRecipes = recipes;
            renderNav(recipes);
            renderRecipes(recipes);
        });

    function renderNav(recipes) {
        const cats = new Set();
        recipes.forEach(r => cats.add(r.category));
        const nav = document.getElementById("main-nav");
        const sorted = ["todas", ...Array.from(cats).sort()];
        nav.innerHTML = "";
        sorted.forEach(cat => {
            const btn = document.createElement("button");
            btn.className = "nav-btn" + (cat === "todas" ? " active" : "");
            btn.dataset.cat = cat;
            btn.textContent = formatCat(cat);
            btn.addEventListener("click", () => {
                document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                currentCat = cat;
                renderRecipes(allRecipes);
            });
            nav.appendChild(btn);
        });
    }

    function formatCat(cat) {
        if (cat === "todas") return "Todas";
        return cat.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    }

    function renderRecipes(recipes) {
        let filtered = recipes;
        if (currentCat !== "todas") {
            filtered = filtered.filter(r => r.category === currentCat);
        }
        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            filtered = filtered.filter(r =>
                r.title.toLowerCase().includes(q) ||
                r.ingredients.some(i => i.toLowerCase().includes(q))
            );
        }

        document.getElementById("recipe-count").textContent = filtered.length + " recetas";

        if (filtered.length === 0) {
            grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--text-light);padding:40px;">No hay recetas que mostrar.</p>`;
            return;
        }

        grid.innerHTML = filtered.map(r => {
            const imgHtml = r.image
                ? `<img class="card-img" src="images/${r.image}" alt="${r.title}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
                : "";
            const placeholderHtml = r.image
                ? `<div class="card-img-placeholder" style="display:none">🍽️</div>`
                : `<div class="card-img-placeholder">🍽️</div>`;
            const preview = r.ingredients.slice(0, 3).join(" · ");
            return `
                <article class="recipe-card" data-slug="${r.slug}">
                    ${imgHtml}${placeholderHtml}
                    <div class="card-body">
                        <div class="card-category">${formatCat(r.category)}</div>
                        <h2>${r.title}</h2>
                        <div class="card-preview">${preview}</div>
                    </div>
                </article>
            `;
        }).join("");

        // Click → modal
        document.querySelectorAll(".recipe-card").forEach(card => {
            card.addEventListener("click", () => {
                const slug = card.dataset.slug;
                const recipe = allRecipes.find(r => r.slug === slug);
                if (recipe) openModal(recipe);
            });
        });
    }

    // Search
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            searchTerm = searchInput.value.trim();
            renderRecipes(allRecipes);
        });
    }

    // Modal
    function openModal(r) {
        const existing = document.querySelector(".modal-overlay");
        if (existing) existing.remove();

        const overlay = document.createElement("div");
        overlay.className = "modal-overlay";
        overlay.innerHTML = `
            <div class="modal-content">
                <button class="modal-close">&times;</button>
                ${r.image ? `<img class="modal-img" src="images/${r.image}" alt="${r.title}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">` : ""}
                ${r.image ? `<div class="modal-img-placeholder" style="display:none">🍽️</div>` : `<div class="modal-img-placeholder">🍽️</div>`}
                <div class="modal-body">
                    <h2>${r.title}</h2>
                    <h3>Ingredientes</h3>
                    <ul>${r.ingredients.map(i => `<li>${i}</li>`).join("")}</ul>
                    <h3>Preparación</h3>
                    <ol>${r.preparation.map(s => `<li>${s}</li>`).join("")}</ol>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        overlay.querySelector(".modal-close").addEventListener("click", () => overlay.remove());
        overlay.addEventListener("click", e => { if (e.target === overlay) overlay.remove(); });
    }
});
