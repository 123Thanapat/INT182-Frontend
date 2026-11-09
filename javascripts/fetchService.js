export async function getIngredients(imageUrl) {
  // API key goes in the Authorization header (inference v1.5.0+)
  const response = await fetch(
    "https://int182-frontend-and-backend-proxy.onrender.com/api/detect",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageUrl }), // ส่ง Base64 ไป
    },
  );
  const data = await response.json();
  console.log(data);
  const predictions = data.outputs?.[0]?.predictions?.predictions || [];
  const raw_ingredients = [];
  predictions.forEach((prediction) => raw_ingredients.push(prediction.class));
  return [...new Set(raw_ingredients)];
}

export async function getRecipes(ingredients, cuisine) {
  const response = await fetch(
    "https://int182-recommend-model.onrender.com/recommend",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ingredients: ingredients,
        cuisines: cuisine,
      }),
    },
  );
  const data = await response.json();
  console.log(data);
  return data;
}

export async function uploadToPublicHosting(file) {
  const formData = new FormData();
  formData.append("image", file); // แนบไฟล์เข้าไป

  // ตัวอย่างการยิงไปที่ ImgBB API (ต้องสมัครขอ API Key ฟรีของ ImgBB มาใส่)
  const response = await fetch(
    "https://api.imgbb.com/1/upload?key=08105b92f76c8d2a1eecce6ef014e8d9",
    {
      method: "POST",
      body: formData,
    },
  );

  const data = await response.json();
  if (!data.success) throw new Error("Failed to upload image");

  return data.data.url; // คืนค่ากลับมาเป็น Public URL เช่น "https://i.ibb.co/xxxx/image.jpg"
}

export function awakenApi() {
  fetch("https://int182-frontend-and-backend-proxy.onrender.com/");
  fetch("https://int182-recommend-model.onrender.com/");
}
