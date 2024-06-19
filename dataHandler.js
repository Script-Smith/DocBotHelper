import fs from "fs";
import path from "path";

// Define the path for the JSON data file
const jsonFilePath = path.resolve("./data.json");

// Function to save data to JSON file
export function saveDataToJson(data) {
  try {
    fs.writeFileSync(jsonFilePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving data to JSON file:", error);
    throw error;
  }
}

// Function to load data from JSON file
export function loadDataFromJson() {
  try {
    if (fs.existsSync(jsonFilePath)) {
      const rawData = fs.readFileSync(jsonFilePath, "utf-8");
      return JSON.parse(rawData);
    } else {
      return null; // or throw an error if you prefer
    }
  } catch (error) {
    console.error("Error loading data from JSON file:", error);
    throw error;
  }
}
