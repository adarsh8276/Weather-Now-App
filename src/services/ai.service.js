
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY);


export async function getAiWeatherSummary(weatherData) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
  You are a friendly weather assistant. Based on the following data, describe the weather briefly and naturally:

  City: ${weatherData.city}
  Country: ${weatherData.country}
  Current temperature: ${weatherData.currentTemp}°C
  Conditions: ${weatherData.condition}
  Humidity: ${weatherData.humidity}%

  Example output: "It's 29°C and cloudy in Delhi — a bit humid today!"
  `;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
