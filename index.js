"use strict";
function fixSize(textarea) {
	while (textarea.offsetHeight <= textarea.scrollHeight)
		textarea.rows += 4;
	while (textarea.offsetWidth <= textarea.scrollWidth)
		textarea.cols += 10;
}

function submitForm(event) {
	event.preventDefault();
	event.target.querySelector('button').disabled = true;
	
	let winnerElement = document.querySelector('#winner');
	winnerElement.textContent = "Calculating...";
	
	try {
		let candidates = event.target.candidates.value.split(/[\n\r]+/);
		let ballots = stringToBallots(event.target.ballots.value);
		winnerElement.textContent = candidates[condorcetIrvWinner(condorcetMatrix(ballots), ballots)];
	}
	catch(e) {
		winnerElement.textContent = "Error";
	}
}
