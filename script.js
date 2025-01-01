let gender = null;
let race = null;
let showMiddleName = true;
let first = null;
let middle = null;
let last = null;

// Storage for all preloaded data
let namesData = {
  first: {},
  middle: {},
  last: {},
};

function updateButtonSelection(buttonGroup, selectedButton) {
  const buttons = document.querySelectorAll(`.${buttonGroup} button`);
  buttons.forEach((btn) => btn.classList.remove("selected"));
  selectedButton.classList.add("selected");
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
  // console.log("Gender set to:", gender);
  updateButtonSelection("gender-buttons", g === "f" ? "female" : "male");
}

// Set Race
function setRace(r) {
  race = r;
  // console.log("Race set to:", race);
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

// 2. Preload All Names and Cumulative Data
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

  firstName = getRandomName("first").trim();
  middleName = getRandomName("middle").trim();
  lastName = getRandomName("last").trim();

  const fullName = `${firstName} ${middleName} ${lastName}`;
  console.log(`${gender}${race}\t${fullName}`);

  updateName();
}

function toggleMiddleName() {
  showMiddleName = !showMiddleName;
  updateName();
}

function updateName() {
  const fullName = `${firstName} ${middleName} ${lastName}`;
  if (showMiddleName) {
    document.getElementById("output").innerText = fullName;
  } else {
    const firstLast = `${firstName} ${middleName[0]}. ${lastName}`;
    document.getElementById("output").innerText = firstLast;
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
  const index = cumulative.findIndex((value) => value >= randomValue);
  return names[index] || "Unknown";
}

function setPrimaryColor(hue) {
  const randomColor = `hsl(${hue}, 100%, 63%)`; // Create an HSL color
  document.documentElement.style.setProperty("--primary-color", randomColor); // Update CSS variable
}

function setRandomPrimaryColor(colors = 24) {
  const color = Math.floor(Math.random() * colors); // E.g. 24 yields 0-23
  const hue = (360 * color) / colors;
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
