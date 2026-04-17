const keywordMap = {
  food: [
    "pizza",
    "burger",
    "sandwich",
    "pasta",
    "noodles",
    "lunch",
    "dinner",
    "breakfast",
    "snacks",
    "meal",
    "restaurant",
    "cafe",
    "coffee",
    "tea",
    "juice",
    "dominos",
    "kfc",
    "mcdonald",
    "zomato",
    "swiggy",
    "eat",
    "food",
    "dining",
    "bakery",
  ],

  transport: [
    "uber",
    "ola",
    "rapido",
    "taxi",
    "cab",
    "bus",
    "train",
    "metro",
    "flight",
    "auto",
    "rickshaw",
    "travel",
    "ticket",
    "fare",
    "ride",
    "commute",
    "journey",
  ],

  petrol: [
    "petrol",
    "diesel",
    "fuel",
    "gas",
    "fuel station",
    "petrol pump",
    "refuel",
    "tank full",
  ],

  shopping: [
    "amazon",
    "flipkart",
    "myntra",
    "ajio",
    "shopping",
    "mall",
    "store",
    "purchase",
    "buy",
    "order",
    "clothes",
    "shoes",
    "electronics",
    "grocery",
    "cart",
  ],

  utilities: [
    "electricity",
    "bill",
    "water bill",
    "wifi",
    "internet",
    "broadband",
    "recharge",
    "mobile recharge",
    "dth",
    "subscription",
    "rent",
    "maintenance",
    "utility",
    "gas bill",
  ],

  salary: [
    "salary",
    "income",
    "credited",
    "payment received",
    "bonus",
    "incentive",
    "freelance",
    "earnings",
    "stipend",
    "payout",
    "job",
  ],

  health: [
    "doctor",
    "hospital",
    "medicine",
    "pharmacy",
    "clinic",
    "treatment",
    "checkup",
    "health",
    "medical",
    "surgery",
    "test",
    "diagnosis",
  ],

  entertainment: [
    "movie",
    "cinema",
    "netflix",
    "prime",
    "hotstar",
    "spotify",
    "concert",
    "game",
    "gaming",
    "party",
    "event",
    "show",
    "fun",
    "entertainment",
  ],
};

function classifyExpense(description) {
  if (!description || description.trim() === "") return "other";

  const text = description.toLowerCase();

  let scores = {};

  for (const category in keywordMap) {
    scores[category] = 0;

    for (const word of keywordMap[category]) {
      if (text.includes(word)) {
        // weighted scoring for strong keywords
        if (
          ["uber", "ola", "zomato", "swiggy", "amazon", "flipkart"].includes(
            word,
          )
        ) {
          scores[category] += 2;
        } else {
          scores[category] += 1;
        }
      }
    }
  }

  let bestCategory = "other";
  let maxScore = 0;

  for (const category in scores) {
    if (scores[category] > maxScore) {
      maxScore = scores[category];
      bestCategory = category;
    }
  }

  return maxScore === 0 ? "other" : bestCategory;
}

module.exports = classifyExpense;
