"use strict";
let winnerElement = document.querySelector('#winner');
let button = document.querySelector('button');
let candidatesInput = document.querySelector('[name=candidates]');
let candidateList = document.querySelector('#candidateList');
let candidates = [];
let ballotsInput = document.querySelector('[name=ballots]');
let ballotList = document.querySelector('#ballotList');

function fixSize(textarea) {
	while (textarea.offsetHeight <= textarea.scrollHeight)
		textarea.rows += 4;
	while (textarea.offsetWidth <= textarea.scrollWidth)
		textarea.cols += 10;
}

function submitForm(event) {
	event.preventDefault();
	button.disabled = true;
	winnerElement.textContent = "Calculating...";
	
	try {
		let ballots = notationToBallots(ballotsInput.value);
		
		if (areValid(ballots))
			winnerElement.textContent = candidates[condorcetIrvWinner(condorcetMatrix(ballots), ballots)];
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
	candidates = candidatesInput.value && candidatesInput.value.split(/[\n\r]+/) || [];
	if (candidates.length)
		candidateList.append(...candidates.map(toItem));
}

function updateBallotList() {
	ballotList.innerHTML = '';
	if (ballotsInput.value) {
		ballotList.append(
			...ballotsInput.value.trim().replace(/g/g, '>').replace(/e/g, '=')
			.replace(/[0-9]+/g, candidate => candidates[parseInt(candidate) - 1])
			.split(/[\n\r]+/).map(toItem)
		);
	}
}

updateCandidateList();
updateBallotList();
button.disabled = false;
