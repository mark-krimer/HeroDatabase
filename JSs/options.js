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
		document.location.href = "../HTMLs/options.html";
	} else {
		console.log("SEND TO HERO PAGE");
		document.location.href = "../HTMLs/hero.html";
	}
}

// OPTIONS
const jsonInfo = JSON.parse(localStorage.getItem("jsonInfo"));

console.log(jsonInfo);

document.title = `${jsonInfo["results-for"]} | Hero Database`;

const options = document.getElementById("options");

jsonInfo.results.forEach((result) => {
	console.log(result);

	options.insertAdjacentHTML(
		"beforeend",
		`
    <div class="option" id="option${result.id}">
        <h3 id="superhero${result.id}">${result.name}</h3>
        <p id="name${result.id}">${result.biography["full-name"]}</p>
		<div class="optionImage">
			<img 
			src="https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/lg/${result.id}-${result.name
				.toLowerCase()
				.replace(/ /g, "-")
				.replace(/[^a-z0-9-]/g, "")}.jpg"
				id="image${result.id}"
			/>
		</div>
    </div>`,
	);

	const element = document.getElementById(`option${result.id}`);

	const image = document.getElementById(`image${result.id}`);
	const imageContainer = image.parentElement;

	image.onload = () => {
		imageContainer.classList.add("loaded");
	};

	element.addEventListener("click", () => {
		clicked(element);
	});
});

async function clicked(element) {
	const id = parseInt(element.id.split("").splice(6, 6).join(""));
	const response = await fetch(`https://superheroapi.com/api.php/a9cdeea3b8554e6d0a5bc76308b83efa/${id}`);
	const jsonData = await response.json();
	const jsonString = await JSON.stringify(jsonData);
	localStorage.setItem("jsonInfo", jsonString);
	document.location.href = "../HTMLs/hero.html";
}
