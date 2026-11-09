// import { recipeData } from "./paseText.js";
import * as fetchService from "./fetchService.js";
// const { recipes } = recipeData;
const cuisines = [
  "north-american",
  "mexican",
  "italian",
  "chinese",
  "indian",
  "thai",
  "french",
  "japanese",
  "greek",
  "spanish",
  "german",
  "irish",
  "british",
  "english",
  "scottish",
  "cajun",
  "caribbean",
  "cuban",
  "vietnamese",
  "korean",
  "ethiopian",
  "moroccan",
  "brazilian",
  "middle-eastern",
  "european",
  "asian",
  "african",
  "southwestern",
  "polynesian",
  "russian",
  "polish",
  "filipino",
  "south-west-pacific",
  "vegetarian",
];
const assumeAlwaysTrue = [
  "salt",
  "pepper",
  "ketchup",
  "fish sauce",
  "soy sauce",
  "water",
];
function createCuisineOptions(cuisine) {
  const optionElement = document.createElement("option");
  optionElement.value = cuisine;
  optionElement.textContent = cuisine[0].toUpperCase() + cuisine.slice(1);
  return optionElement;
}

function createRecipeCard(recipe) {
  const recipeElement = document.createElement("div");
  recipeElement.classList.add("recipe");

  const contentDivElement = document.createElement("div");
  recipeElement.classList.add("recipe-content");

  const categoryElement = document.createElement("p");
  categoryElement.classList.add("category");
  const fixedJsonString = recipe.cuisines.replace(/'/g, '"');
  categoryElement.textContent = JSON.parse(fixedJsonString)
    .join(" | ")
    .toUpperCase();
  contentDivElement.appendChild(categoryElement);

  const headingElement = document.createElement("h3");
  headingElement.textContent = recipe.name;
  contentDivElement.appendChild(headingElement);

  const detailDivElement = document.createElement("div");
  detailDivElement.classList.add("recipe-detail");

  const ingredientHeader = document.createElement("h4");
  ingredientHeader.textContent = "Ingredients";
  detailDivElement.appendChild(ingredientHeader);

  recipe.ingredients_raw.forEach((ingredient) => {
    const pElement = document.createElement("p");
    pElement.textContent = "\u00A0\u00A0\u00A0\u00A0" + ingredient;
    detailDivElement.appendChild(pElement);
  });

  const instructionHeader = document.createElement("h4");
  instructionHeader.textContent = "Instructions";
  detailDivElement.appendChild(instructionHeader);

  for (let i = 0; i < recipe.steps.length; i++) {
    const pElement = document.createElement("p");
    pElement.textContent = `\u00A0\u00A0\u00A0\u00A0${i + 1}. ${recipe.steps[i]}`;
    detailDivElement.appendChild(pElement);
  }
  contentDivElement.appendChild(detailDivElement);
  recipeElement.appendChild(contentDivElement);
  return recipeElement;
}
window.addEventListener("DOMContentLoaded", async () => {
  const cuisineSelectElement = document.getElementById("cuisine");
  const fragment = document.createDocumentFragment();
  cuisines.forEach((cuisine) => {
    fragment.appendChild(createCuisineOptions(cuisine));
  });
  cuisineSelectElement.appendChild(fragment);
  fetchService.awakenApi();
});

const recipeList = document.querySelector(".recipe-list");
const submitBtn = document.getElementById("submit-btn");
submitBtn.addEventListener("click", async () => {
  const photoInput = document.getElementById("photo");
  const file = photoInput.files[0];
  const cuisine = document.getElementById("cuisine").value;
  if (!file) {
    const pElement = document.createElement("p");
    pElement.textContent = "Please upload the photo";
    pElement.style.color = "red";
    document.querySelector(".upload").appendChild(pElement);
    return;
  }
  const errorElement = document.querySelector(".error");
  const progressElement = document.querySelector(".progress");
  try {
    errorElement.classList.add("hidden");
    progressElement.classList.remove("hidden");
    recipeList.innerHTML = "";
    // 1. นำไฟล์รูปจากเครื่องอัปโหลดขึ้น Public Image Hosting ก่อน เพื่อเอา Public URL
    console.log("Uploading image to public hosting...");
    progressElement.textContent = "Upload Image...";
    const publicImageUrl = await fetchService.uploadToPublicHosting(file);
    console.log("Image URL received:", publicImageUrl);

    // 2. ส่ง Public URL ไปที่ Backend Proxy เพื่อให้ Roboflow ตรวจจับวัตถุดิบ
    console.log("Sending to Roboflow...");
    progressElement.textContent = "Scaning Ingredients...";
    const ingredients = await fetchService.getIngredients(publicImageUrl);
    console.log(ingredients);
    progressElement.textContent = `Found Ingredients ${ingredients}`;
    console.log("Sending to Render...");
    progressElement.textContent = "Finding Recipes(Can Up to 2 minutes)...";
    const { recipes } = await fetchService.getRecipes(
      [...ingredients, ...assumeAlwaysTrue],
      cuisine,
    );
    console.log(recipes);
    progressElement.textContent = "Scaning Success";
    const fragment2 = document.createDocumentFragment();
    recipes.forEach((recipe) => {
      fragment2.appendChild(createRecipeCard(recipe));
    });
    recipeList.appendChild(fragment2);
  } catch (error) {
    errorElement.textContent = error.message;
    errorElement.classList.remove("hidden");
    progressElement.classList.add("hidden");
  }
});
