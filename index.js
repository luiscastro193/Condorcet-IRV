"use strict";
const zipPromise = import("https://luiscastro193.github.io/zip-string/zip-string.js");
const sortPromise = import('./sort.js').then(module => module.default);
const condorcetPromise = import('./condorcet.js');
let winnerElement = document.querySelector('#winner');
let [ballotButton, button, shareButton, qrButton] = document.querySelectorAll('button');
let form = document.querySelector('form');
let candidatesInput = document.querySelector('#candidates');
let candidateList = document.querySelector('#candidateList');
let candidates = [];
let ballotsInput = document.querySelector('#ballots');
let ballotList = document.querySelector('#ballotList');
let selector = document.querySelector('.preference-selector');
let options = selector.querySelectorAll('.preferences > span');
let url = location.href;

const shareTexts = ["Share", "Share candidates"];

function fixSize(textarea) {
	while (textarea.offsetHeight <= textarea.scrollHeight)
		textarea.rows += 4;
	while (textarea.offsetWidth <= textarea.scrollWidth)
		textarea.cols += 10;
}

for (let textarea of document.querySelectorAll('textarea'))
	textarea.addEventListener('input', () => fixSize(textarea));

form.onsubmit = async function(event) {
	event.preventDefault();
	button.disabled = true;
	winnerElement.textContent = "Calculating...";
	
	const {notationToBallots, areValid, condorcetIrvWinner, condorcetMatrix} = await condorcetPromise;
	
	try {
		let ballots = notationToBallots(ballotsInput.value);
		
		if (areValid(ballots))
			winnerElement.textContent = candidates[await condorcetIrvWinner(condorcetMatrix(ballots), ballots, candidates.join())];
		else
			winnerElement.textContent = "Error, invalid ballots format";
	}
	catch(e) {
		winnerElement.textContent = "Error, invalid ballots format";
	}
}

function resetWinner() {
	winnerElement.textContent = '';
	button.disabled = false;
}

function toItem(string) {
	let li = document.createElement("li");
	li.textContent = string;
	return li;
}

let lastUpdate = 0;

async function updateURL() {
	const updateId = lastUpdate = (lastUpdate + 1) % Number.MAX_SAFE_INTEGER;
	let uri = candidates.length >= 2 ? '#' + await (await zipPromise).zip(candidates.join('\n')) : ' ';
	if (updateId == lastUpdate) url = new URL(uri, location.href);
}

function updateCandidateList() {
	candidateList.innerHTML = '';
	candidates = candidatesInput.value.trim();
	candidates = candidates && candidates.split(/\s+^\s*/m) || [];
	candidateList.append(...candidates.map(toItem));
	updateURL();
	shareButton.textContent = shareTexts[candidates.length >= 2 ? 1 : 0];
}

function updateBallotList() {
	ballotList.innerHTML = '';
	
	if (ballotsInput.value) {
		ballotList.append(
			...ballotsInput.value.trim().replace(/g/g, '>').replace(/e/g, '=')
			.replace(/[0-9]+/g, candidate => candidates[Number(candidate) - 1])
			.split(/\s+^\s*/m).map(toItem)
		);
	}
}

form.addEventListener('input', resetWinner);
form.addEventListener('input', updateBallotList);
candidatesInput.addEventListener('input', updateCandidateList);

updateCandidateList();
updateBallotList();

function askPreference(i1, i2) {
	return new Promise(resolve => {
		function answer(myAnswer) {
			selector.classList.remove('enabled');
			resolve(myAnswer);
		}
		
		options[0].textContent = candidates[i1-1];
		options[2].textContent = candidates[i2-1];
		options[0].onclick = () => answer(-1);
		options[1].onclick = () => answer(0);
		options[2].onclick = () => answer(1);
		selector.classList.add('enabled');
	})
}

function shuffle(array) {
	for (let i = array.length - 1; i > 0; i--) {
		let j = Math.trunc(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	
	return array;
}

ballotButton.onclick = async function() {
	if (!candidatesInput.reportValidity())
		return false;
	
	if (candidates.length < 2)
		return alert("Add more candidates");
	
	ballotButton.disabled = true;
	const sort = await sortPromise;
	let result = await sort(shuffle(Array.from({length: candidates.length}, (x, i) => i + 1)), askPreference);
	ballotButton.disabled = false;
	let lastChar = ballotsInput.value.slice(-1);
	
	if (lastChar && lastChar != '\n')
		ballotsInput.value += '\n';
	
	ballotsInput.value += result.join(' ');
	resetWinner();
	updateBallotList();
}

shareButton.onclick = () => {
	if (navigator.share)
		navigator.share({url});
	else
		navigator.clipboard.writeText(url).then(() => alert("Link copied to clipboard"));
}

qrButton.onclick = () => {
	window.open("https://luiscastro193.github.io/qr-generator/#" + encodeURIComponent(url));
}

window.onhashchange = () => location.reload();

ballotButton.disabled = false;
button.disabled = false;
shareButton.disabled = false;
qrButton.disabled = false;

if (location.hash) {
	candidatesInput.value = await (await zipPromise).unzip(location.hash.slice(1));
	updateCandidateList();
	ballotButton.click();
	history.pushState(null, '', ' ');
}
