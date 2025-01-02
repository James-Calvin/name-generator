let gender = null;
let race = null;
let showMiddleName = true;
let first_name, middle_name, last_name;
let rarity = {
  first: 0,
  middle: 0,
  last: 0,
};

// Storage for all preloaded data
let namesData = {
  first: {},
  middle: {},
  last: {},
};

function getRaritySymbol(value) {
  if (value <= 0.625) return "●";
  if (value <= 0.9375) return "◆";
  if (value <= 0.995) return "★";
  return "✪";
}

function powerMeanRarity(power = 2) {
  const { first, middle, last } = rarity;
  const numerator = first ** power + middle ** power + last ** power;
  return Math.pow(numerator / 3, 1 / power);
}

function getNameRarity() {
  let rarityString = "";
  rarityString += getRaritySymbol(rarity["first"]);
  rarityString += getRaritySymbol(rarity["middle"]);
  rarityString += getRaritySymbol(rarity["last"]);
  return rarityString;
}

function updateRaritySymbol() {
  const element = document.getElementById("rarity");
  element.innerText = getNameRarity();
}

// Utility function to update button selection
function updateButtonSelection(buttonGroup, selectedKey) {
  const buttons = document.querySelectorAll(`.${buttonGroup} button`);
  buttons.forEach((btn) => {
    const text = btn.textContent.toLowerCase().trim(); // Get clean button text
    if (text === selectedKey.toLowerCase()) {
      // Strict comparison
      btn.classList.add("selected");
    } else {
      btn.classList.remove("selected");
    }
  });
}

// Set Gender
function setGender(g) {
  gender = g;
  updateButtonSelection("gender-buttons", g === "f" ? "female" : "male");
}

// Set Race
function setRace(r) {
  race = r;
  const raceMap = {
    aian: "native american",
    api: "asian",
    black: "black",
    hispanic: "hispanic",
    white: "white",
  };
  updateButtonSelection("race-buttons", raceMap[r]);
}

// Randomly set Gender
function setRandomGender() {
  const genders = ["f", "m"];
  const randomGender = genders[Math.floor(Math.random() * genders.length)];
  setGender(randomGender);
}

// Randomly set Race
function setRandomRace() {
  const races = ["aian", "api", "black", "hispanic", "white"];
  const randomRace = races[Math.floor(Math.random() * races.length)];
  setRace(randomRace);
}

// Preload All Names and Cumulative Data
async function preloadData() {
  const paths = {
    first: "data/first_name_alt_4000",
    middle: "data/middle_name_2520",
    last: "data/last_name_10000",
  };

  console.log("Preloading all data...");
  for (const [nameType, basePath] of Object.entries(paths)) {
    // Load names
    const namesResponse = await fetch(`${basePath}/names.txt`);
    const names = (await namesResponse.text()).split("\n");

    namesData[nameType].names = names;

    // Load cumulative sum files for all gender-race combinations
    namesData[nameType].cumulative = {};
    const genders = nameType === "last" ? [""] : ["f", "m"];
    const races = ["aian", "api", "black", "hispanic", "white"];

    for (const g of genders) {
      for (const r of races) {
        const key = `${g}${r}`;
        const cumsumPath = `${basePath}/${key}.bin`;

        try {
          const cumulativeResponse = await fetch(cumsumPath);
          const buffer = await cumulativeResponse.arrayBuffer();
          namesData[nameType].cumulative[key] = new Float32Array(buffer);
        } catch {
          console.warn(`Missing cumulative file: ${cumsumPath}`);
        }
      }
    }

    console.log(`Preloaded ${nameType} data.`);
  }
  console.log("All data preloaded successfully!");
}

// Generate a Full Name
function generateFullName() {
  if (!gender || !race) {
    alert("Please select both gender and race.");
    return;
  }

  first_name = getRandomName("first").trim();
  middle_name = getRandomName("middle").trim();
  last_name = getRandomName("last").trim();

  updateRaritySymbol();

  const fullName = `${first_name} ${middle_name} ${last_name}`;
  const symbol = getRaritySymbol(powerMeanRarity());
  const average_rarity_element = document.getElementById("average-rarity");
  average_rarity_element.innerText = symbol;
  console.log(`${gender}${race}\t${fullName}\t${getNameRarity()}\t${symbol}`);

  updateName();
}

function toggleMiddleName() {
  showMiddleName = !showMiddleName;
  updateName();
}

function updateName() {
  const fullName = `${first_name} ${middle_name} ${last_name}`;
  if (showMiddleName) {
    document.getElementById("output-span").innerText = fullName;
  } else {
    const firstLast = `${first_name} ${middle_name[0]}. ${last_name}`;
    document.getElementById("output-span").innerText = firstLast;
  }
}

// Utility function to get a random name
function getRandomName(nameType) {
  const key = nameType === "last" ? race : `${gender}${race}`;
  const cumulative = namesData[nameType].cumulative[key];
  const names = namesData[nameType].names;

  if (!cumulative) {
    console.error(`Cumulative data missing for ${nameType}, key: ${key}`);
    return "Unknown";
  }

  const randomValue = Math.random();
  rarity[nameType] = randomValue;
  const index = cumulative.findIndex((value) => value >= randomValue);
  return names[index] || "Unknown";
}

function setPrimaryColor(hue) {
  document.documentElement.style.setProperty("--primary-hue", hue); // Update CSS variable
}

function setRandomPrimaryColor(colors = 9) {
  const color = Math.floor(Math.random() * colors); // E.g. 24 yields 0-23
  const hue = 360 * (color / colors);
  setPrimaryColor(hue);
}

// Preload Data on Page Load
window.addEventListener("load", () => {
  if (Math.random() < 0.05) {
    setRandomPrimaryColor();
  }
  preloadData().then(() => {
    const button = document.getElementById("generate");
    button.disabled = false;
    button.innerText = "Generate Name";
    setRandomGender();
    setRandomRace();
    generateFullName();
  });
});

function rollDice() {
  setRandomGender();
  setRandomRace();
  generateFullName();
}
