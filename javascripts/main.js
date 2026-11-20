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
function renderAnnotatedImage(
  file,
  predictions,
  ingredients,
  imageSize = null,
) {
  const resultSection = document.getElementById("detection-result");
  const previewContainer = document.getElementById("detection-preview");
  const tagsElement = document.getElementById("detected-tags");

  previewContainer.innerHTML = "";
  resultSection.classList.remove("hidden");

  tagsElement.textContent =
    ingredients.length > 0
      ? `Detected: ${ingredients.join(", ")}`
      : "No ingredients detected.";

  const objectUrl = URL.createObjectURL(file);
  const img = new Image();

  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.classList.add("annotated-canvas");

    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    const scaleX = imageSize?.width ? img.naturalWidth / imageSize.width : 1;
    const scaleY = imageSize?.height ? img.naturalHeight / imageSize.height : 1;

    const lineWidth = Math.max(3, Math.round(canvas.width / 220));
    const fontSize = Math.max(16, Math.round(canvas.width / 45));

    predictions.forEach((pred, index) => {
      const boxWidth = pred.width * scaleX;
      const boxHeight = pred.height * scaleY;
      const x = pred.x * scaleX - boxWidth / 2;
      const y = pred.y * scaleY - boxHeight / 2;

      const hue = (index * 67) % 360;
      const color = `hsl(${hue}, 85%, 45%)`;

      // วาดกรอบ Bounding Box
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.strokeRect(x, y, boxWidth, boxHeight);

      // ป้ายชื่อวัตถุดิบ + % ความมั่นใจ
      const confText =
        typeof pred.confidence === "number"
          ? ` ${(pred.confidence * 100).toFixed(0)}%`
          : "";
      const label = `${pred.class}${confText}`;

      ctx.font = `600 ${fontSize}px "DM Sans", sans-serif`;
      const textWidth = ctx.measureText(label).width;
      const badgeHeight = fontSize + 10;
      const badgeY = y >= badgeHeight ? y - badgeHeight : y;

      ctx.fillStyle = color;
      ctx.fillRect(x, badgeY, textWidth + 14, badgeHeight);

      ctx.fillStyle = "#ffffff";
      ctx.fillText(label, x + 7, badgeY + fontSize + 2);
    });

    previewContainer.appendChild(canvas);
    URL.revokeObjectURL(objectUrl);
  };

  img.src = objectUrl;
}
function safeParseArray(data) {
  if (Array.isArray(data)) return data;

  if (typeof data === "string") {
    let cleanedData = data.trim();

    try {
      return JSON.parse(cleanedData);
    } catch (e) {
      // 👉 ถ้า JSON.parse พังเพราะเครื่องหมายคำพูดด้านใน (เช่น don"t)
      // ให้ลองแปลงเครื่องหมาย " ที่อยู่ข้างในคำศัพท์ให้เป็น escaped quote หรือแทนที่ชั่วคราว
      try {
        // แก้ไขเคสที่ Double Quote อยู่ระหว่างตัวอักษร (เช่น don"t -> don\'t)
        const fixedJson = cleanedData.replace(
          /([a-zA-Z])"([a-zA-Z])/g,
          "$1'$2",
        );
        return JSON.parse(fixedJson);
      } catch (err2) {
        // ถ้ายังพังอีก ให้ใช้วิธีตัดแบ่งสตริงแบบปลอดภัยขั้นเด็ดขาด
        const rawCleaned = cleanedData.replace(/^\[|\]$/g, "");
        // แยกตามแพทเทิร์นเครื่องหมายคำพูดปิด-เปิด
        const matches = rawCleaned.match(
          /"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)'/g,
        );
        if (matches) {
          return matches.map((item) => item.slice(1, -1).replace(/\\"/g, '"'));
        }
        return [data];
      }
    }
  }

  return [];
}
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

  const stepsArray = safeParseArray(recipe.steps);
  for (let i = 0; i < stepsArray.length; i++) {
    const pElement = document.createElement("p");
    pElement.textContent = `\u00A0\u00A0\u00A0\u00A0${i + 1}. ${stepsArray[i]}`;
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
  const errorElement = document.querySelector(".error");
  const progressElement = document.querySelector(".progress");
  const resultSection = document.getElementById("detection-result");

  if (!file) {
    errorElement.textContent = "Please upload the photo";
    errorElement.classList.remove("hidden");
    return;
  }

  try {
    errorElement.classList.add("hidden");
    resultSection.classList.add("hidden");
    progressElement.classList.remove("hidden");
    recipeList.innerHTML = "";

    // 1. อัปโหลดรูปขึ้น Public Image Hosting
    progressElement.textContent = "Uploading Image...";
    const publicImageUrl = await fetchService.uploadToPublicHosting(file);

    // 2. ส่งให้ Roboflow ตรวจจับวัตถุดิบ
    progressElement.textContent = "Scanning Ingredients...";
    const { ingredients, predictions, imageSize } =
      await fetchService.getIngredients(publicImageUrl);

    // แสดงภาพที่มี annotation ทันทีเมื่อ Roboflow ตอบกลับ
    renderAnnotatedImage(file, predictions, ingredients, imageSize);

    // 3. ค้นหาสูตรอาหาร
    progressElement.textContent =
      "Finding Recipes (Can take up to 2 minutes)...";
    const { recipes } = await fetchService.getRecipes(
      [...ingredients, ...assumeAlwaysTrue],
      cuisine,
    );

    progressElement.textContent = "Scanning Success";
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
