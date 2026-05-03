document.addEventListener("DOMContentLoaded", function() {
    fetch("data/recipes.json")
        .then(response => response.json())
        .then(recipes => {
            const recipeList = document.getElementById("recipe-list");
            recipes.forEach(recipe => {
                const card = document.createElement("div");
                card.classList.add("recipe-card");
                
                let imageUrl = recipe.image_url || "#"; // Placeholder if no image assigned
                if (!imageUrl.startsWith("http") && imageUrl !== "#") {
                    // Assume relative path if not http
                    imageUrl = `./images/${imageUrl}`;
                }

                card.innerHTML = `
                    <h2>${recipe.title}</h2>
                    <img src="${imageUrl}" alt="${recipe.title}">
                    <h3>Ingredientes:</h3>
                    <ul>${recipe.ingredients.map(ing => `<li>${ing}</li>`).join("")}</ul>
                    <h3>Preparación:</h3>
                    <ol>${recipe.preparation.map(step => `<li>${step}</li>`).join("")}</ol>
                    ${recipe.notes ? `<p><strong>Notas:</strong> ${recipe.notes}</p>` : ""}
                `;
                recipeList.appendChild(card);
            });
        });
});
