// VARIABLES
let heroes = [];

const input = document.getElementById("superheroInput");
const button = document.getElementById("submit");
const suggestionsBox = document.getElementById("suggestions");

// HELPER FUNCTIONS
function normalize(str) {
	return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// LOAD DATA
fetch("../heroesNoDupes.json")
	.then((res) => res.json())
	.then((data) => {
		heroes = data;
	});

// EVENT LISTENERS
input.addEventListener("input", () => {
	const query = normalize(input.value);

	if (!query) {
		suggestionsBox.innerHTML = "";
		return;
	}

	const matches = heroes
		.map((hero) => {
			let score = 0;

			const name = hero.searchName;

			// PERFECT match
			if (name === query) score += 1000;

			// starts with query (VERY important)
			if (name.startsWith(query)) score += 500;

			// contains query
			if (name.includes(query)) score += 100;

			// bonus for shorter / more relevant names
			score -= name.length * 0.01;

			return { ...hero, score };
		})
		.filter((h) => h.score > 0)
		.sort((a, b) => b.score - a.score)
		.slice(0, 10);

	renderSuggestions(matches);
});

// UI FUNCTIONS
function renderSuggestions(list) {
	suggestionsBox.innerHTML = "";

	list.forEach((hero) => {
		const div = document.createElement("div");
		div.classList.add("suggestion");
		div.textContent = hero.name;

		div.addEventListener("click", () => {
			input.value = hero.name;
			suggestionsBox.innerHTML = "";
		});

		suggestionsBox.appendChild(div);
	});
}

// SEARCH LOGIC
button.addEventListener("click", searchForSuperheroes);

async function searchForSuperheroes() {
	const response = await fetch(`https://superheroapi.com/api.php/a9cdeea3b8554e6d0a5bc76308b83efa/search/${superheroInput.value}`);
	const jsonData = await response.json();
	const jsonString = await JSON.stringify(jsonData);
	localStorage.setItem("jsonInfo", jsonString);

	console.log(jsonData);
	if (jsonData.results.length > 1) {
		console.log("SEND TO OPTIONS PAGE");
		document.location.href = "HTMLs/options.html";
	} else {
		console.log("SEND TO HERO PAGE");
		document.location.href = "HTMLs/hero.html";
	}
}

// HERO
let jsonInfo = JSON.parse(localStorage.getItem("jsonInfo"));
if (jsonInfo.results) {
	jsonInfo = JSON.parse(localStorage.getItem("jsonInfo")).results[0];
}

document.title = `${jsonInfo.name} | Hero Database`;

const superhero = document.getElementById("superhero");
const name = document.getElementById("name");
const superheroImg = document.getElementById("superheroImg");
const description = document.getElementById("description");
const powerStats = document.getElementById("powerStats");

const identityP = document.getElementById("identityP");
const appearanceP = document.getElementById("appearanceP");
const occupationP = document.getElementById("occupationP");
const affiliationP = document.getElementById("affiliationP");
const familyP = document.getElementById("familyP");

superhero.innerHTML = jsonInfo.name;
name.innerHTML = jsonInfo.biography["full-name"];
getImageSrc();

function getImageSrc() {
	const imageName = jsonInfo.name
		.toLowerCase()
		.replace(/ /g, "-")
		.replace(/[^a-z0-9-]/g, "");

	const loader = document.querySelector(".imageLoader");

	superheroImg.onload = () => {
		superheroImg.style.display = "block";

		requestAnimationFrame(() => {
			superheroImg.classList.add("loaded");
		});

		document.querySelector(".heroImage").classList.add("loaded");
	};

	superheroImg.onerror = () => {
		console.log("Image failed:", hero.images.lg);
	};

	superheroImg.src = `https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/lg/${jsonInfo.id}-${imageName}.jpg`;
}

// Description
let alignment;
if (jsonInfo.biography["alignment"] === "good") {
	alignment = "hero";
} else if (jsonInfo.biography["alignment"] === "bad") {
	alignment = "villain";
} else {
	alignment = jsonInfo.biography["alignment"];
}

let pronoun;
let ending;
let plural;
if (jsonInfo.appearance.gender === "Female") {
	pronoun = "She";
	ending = "s";
	plural = "is";
} else if (jsonInfo.appearance.gender === "Male") {
	pronoun = "He";
	ending = "s";
	plural = "is";
} else {
	pronoun = "They";
	ending = "";
	plural = "are";
}

const has = (v) => v !== undefined && v !== null && v !== "-" && v !== "";

// Sentence 1
let sentence1 = superhero.innerHTML;
if (has(name.innerHTML)) {
	sentence1 += `, whose real name is ${name.innerHTML},`;
}
const s1Bits = [];
if (has(alignment) && alignment !== "-") s1Bits.push(`is a ${alignment}`);
if (has(jsonInfo.biography["publisher"])) s1Bits.push(`published by ${jsonInfo.biography["publisher"]}`);
if (s1Bits.length) sentence1 += ` ${s1Bits.join(" ")}.`;

// Sentence 2
const s2Bits = [];
if (has(jsonInfo.biography["first-appearance"])) {
	s2Bits.push(`${pronoun} first appeared in ${jsonInfo.biography["first-appearance"]}`);
}
if (has(jsonInfo.biography["place-of-birth"])) {
	s2Bits.push(`${pronoun.toLowerCase()} ${plural} from ${jsonInfo.biography["place-of-birth"]}`);
}
if (has(jsonInfo.work.occupation)) {
	s2Bits.push(`and works as a ${jsonInfo.work.occupation}`);
}
const sentence2 = s2Bits.length ? `${s2Bits.join(", ")}.` : "";

// Sentence 3
const sentence3 = has(jsonInfo.work.base) ? `${pronoun} currently operate${ending} from ${jsonInfo.work.base}.` : "";

// Combine
description.innerHTML = [sentence1, sentence2, sentence3].filter(Boolean).join(" ");

// COLLAPSABLES
// Identity
let identity = "";

if (has(jsonInfo.biography["full-name"])) {
	identity += `<strong>Full Name:</strong> ${jsonInfo.biography["full-name"]}<br>`;
}

if (has(jsonInfo.biography.publisher)) {
	identity += `<strong>Publisher:</strong> ${jsonInfo.biography.publisher}<br>`;
}

if (has(jsonInfo.biography["first-appearance"])) {
	identity += `<strong>First Appearance:</strong> ${jsonInfo.biography["first-appearance"]}<br>`;
}

if (has(jsonInfo.biography["place-of-birth"])) {
	identity += `<strong>Place of Birth:</strong> ${jsonInfo.biography["place-of-birth"]}<br>`;
}

if (has(jsonInfo.biography["alter-egos"])) {
	identity += `<strong>Alter Egos:</strong> ${jsonInfo.biography["alter-egos"]}<br>`;
}

if (jsonInfo.biography.aliases && jsonInfo.biography.aliases.length) {
	identity += `<strong>Aliases:</strong> ${jsonInfo.biography.aliases.join(", ")}`;
}

identityP.innerHTML = identity;

// Appearance
let appearance = "";

if (has(jsonInfo.appearance.gender)) {
	appearance += `<strong>Gender:</strong> ${jsonInfo.appearance.gender}<br>`;
}

if (has(jsonInfo.appearance.race)) {
	appearance += `<strong>Race:</strong> ${jsonInfo.appearance.race}<br>`;
}

if (jsonInfo.appearance.height?.length) {
	appearance += `<strong>Height:</strong> ${jsonInfo.appearance.height.join(" / ")}<br>`;
}

if (jsonInfo.appearance.weight?.length) {
	appearance += `<strong>Weight:</strong> ${jsonInfo.appearance.weight.join(" / ")}<br>`;
}

if (has(jsonInfo.appearance["eye-color"])) {
	appearance += `<strong>Eye Color:</strong> ${jsonInfo.appearance["eye-color"]}<br>`;
}

if (has(jsonInfo.appearance["hair-color"])) {
	appearance += `<strong>Hair Color:</strong> ${jsonInfo.appearance["hair-color"]}`;
}

appearanceP.innerHTML = appearance;

// Occupation
let occupation = "";

if (has(jsonInfo.work.occupation)) {
	occupation += `<strong>Occupation:</strong> ${jsonInfo.work.occupation}<br>`;
}

if (has(jsonInfo.work.base)) {
	occupation += `<strong>Base:</strong> ${jsonInfo.work.base}`;
}

occupationP.innerHTML = occupation;

// Affiliation
let affiliation = "";

if (has(jsonInfo.connections["group-affiliation"])) {
	affiliation += `<strong>Groups:</strong> ${jsonInfo.connections["group-affiliation"]}`;
}

affiliationP.innerHTML = affiliation;

// Family
let family = "";

if (has(jsonInfo.connections.relatives)) {
	family += `<strong>Relatives:</strong> ${jsonInfo.connections.relatives}`;
}

familyP.innerHTML = family;

// Power Stats
var labels = ["Intelligence", "Strength", "Speed", "Durability", "Power", "combat"];
const ps = jsonInfo.powerstats;
var stats = [ps.intelligence, ps.strength, ps.speed, ps.durability, ps.power, ps.combat];

new Chart("powerStats", {
	type: "horizontalBar",
	data: {
		labels: labels,
		datasets: [
			{
				data: stats,
				backgroundColor: ["#38bdf8", "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#ec4899"],
				borderRadius: 8,
				barThickness: 18,
			},
		],
	},

	options: {
		responsive: false,
		maintainAspectRatio: false,
		legend: {
			display: false,
		},

		scales: {
			xAxes: [
				{
					ticks: {
						min: 0,
						max: 100,
						stepSize: 20,
						fontColor: "#cbd5e1",
					},

					gridLines: {
						color: "rgba(255,255,255,0.1)",
					},
				},
			],

			yAxes: [
				{
					ticks: {
						fontColor: "#ffffff",
						fontSize: 13,
					},

					gridLines: {
						display: false,
					},
				},
			],
		},

		tooltips: {
			backgroundColor: "#1e293b",
			titleFontColor: "#ffffff",
			bodyFontColor: "#ffffff",
		},
	},
});
