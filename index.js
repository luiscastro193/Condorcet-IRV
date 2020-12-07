"use strict";
let winnerElement = document.querySelector('#winner');
let button = document.querySelector('#winnerButton');
let ballotButton = document.querySelector('#ballotButton');
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

function askPreference(i1, i2) {
	return new Promise(resolve => {
		let selector = document.querySelector('.preference-selector');
		
		function answer(myAnswer) {
			selector.classList.remove('enabled');
			resolve(myAnswer);
		}
		
		let options = selector.querySelectorAll('.preferences > span');
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
		let j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	
	return array;
}

ballotButton.onclick = function() {
	if (!candidatesInput.reportValidity())
		return false;
	
	if (candidates.length < 2)
		return alert("Add more candidates");
	
	sort(shuffle(Array.from({length: candidates.length}, (x, i) => i + 1)), askPreference).then(result => {
		ballotsInput.value += result.join(' ') + '\n';
		resetWinner();
		updateBallotList();
	});
}

ballotButton.disabled = false;
