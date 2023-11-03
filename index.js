"use strict";
const sortPromise = import('./sort.js').then(module => module.default);
const condorcetPromise = import('./condorcet.js');
let winnerElement = document.querySelector('#winner');
let button = document.querySelector('#winnerButton');
let ballotButton = document.querySelector('#ballotButton');
let form = document.querySelector('form');
let candidatesInput = document.querySelector('[name=candidates]');
let candidateList = document.querySelector('#candidateList');
let candidates = [];
let ballotsInput = document.querySelector('[name=ballots]');
let ballotList = document.querySelector('#ballotList');
let selector = document.querySelector('.preference-selector');
let options = selector.querySelectorAll('.preferences > span');

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
			winnerElement.textContent = candidates[await condorcetIrvWinner(condorcetMatrix(ballots), ballots, candidatesInput.value.trim())];
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

function updateCandidateList() {
	candidateList.innerHTML = '';
	candidates = candidatesInput.value && candidatesInput.value.split(/\s+^\s*/m) || [];
	if (candidates.length)
		candidateList.append(...candidates.map(toItem));
}

function updateBallotList() {
	ballotList.innerHTML = '';
	if (ballotsInput.value) {
		ballotList.append(
			...ballotsInput.value.trim().replace(/g/g, '>').replace(/e/g, '=')
			.replace(/[0-9]+/g, candidate => candidates[parseInt(candidate) - 1])
			.split(/\s+^\s*/m).map(toItem)
		);
	}
}

form.addEventListener('input', resetWinner);
form.addEventListener('input', updateBallotList);
candidatesInput.addEventListener('input', updateCandidateList);

updateCandidateList();
updateBallotList();
button.disabled = false;

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
	
	const sort = await sortPromise;
	
	sort(shuffle(Array.from({length: candidates.length}, (x, i) => i + 1)), askPreference).then(result => {
		let lastChar = ballotsInput.value.slice(-1);
		
		if (lastChar && lastChar != '\n')
			ballotsInput.value += '\n';
		
		ballotsInput.value += result.join(' ');
		resetWinner();
		updateBallotList();
	});
}

ballotButton.disabled = false;
