"use strict";
let winnerElement = document.querySelector('#winner');
let button = document.querySelector('button');

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
		let candidates = event.target.candidates.value.split(/[\n\r]+/);
		let ballots = stringToBallots(event.target.ballots.value);
		
		if (areValid(ballots))
			winnerElement.textContent = candidates[condorcetIrvWinner(condorcetMatrix(ballots), ballots)];
		else
			winnerElement.textContent = "Error, invalid ballots format";
	}
	catch(e) {
		winnerElement.textContent = "Error";
	}
}

function resetWinner() {
	winnerElement.textContent = '';
	button.disabled = false;
}

button.disabled = false;
