require("dotenv").config();
const gemini = require("@google/genai");

const ai = new gemini.GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// allowed categories
const ALLOWED_CATEGORIES = [
  "food",
  "transport",
  "petrol",
  "shopping",
  "utilities",
  "salary",
  "health",
  "entertainment",
  "other",
];

async function callGeminiAi(userDescription) {
  try {
    // if empty description
    if (!userDescription || userDescription.trim() === "") {
      return "other";
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Classify this expense into one category:
[food, transport, petrol, shopping, utilities, salary, health, entertainment, other]

Text: "${userDescription}"

Only return the category name (one word).`,
    });

    // extract text safely
    let category = response?.text || "other";

    // clean response
    category = category.toLowerCase().trim();

    // normalization (handle weird AI outputs)
    if (category.includes("food")) category = "food";
    else if (category.includes("transport")) category = "transport";
    else if (category.includes("petrol") || category.includes("fuel"))
      category = "petrol";
    else if (category.includes("shop")) category = "shopping";
    else if (category.includes("util")) category = "utilities";
    else if (category.includes("salary") || category.includes("income"))
      category = "salary";
    else if (category.includes("health") || category.includes("medical"))
      category = "health";
    else if (category.includes("entertain")) category = "entertainment";
    else if (!ALLOWED_CATEGORIES.includes(category)) category = "other";

    return category;
  } catch (error) {
    console.log("Gemini Error:", error.message);
    return "other";
  }
}

module.exports = callGeminiAi;
