"use strict";
function condorcetMatrix(ballots) {
	let n_candidates = ballots[0].length;
	let matrix = Array.from({length: n_candidates}, () => Array(n_candidates).fill(0));
	
	for (let ballot of ballots) {
		for (let [candidate, rank] of ballot.entries()) {
			for (let [other_candidate, other_rank] of ballot.entries()) {
				if (rank < other_rank)
					matrix[candidate][other_candidate]++;
			}
		}
	}
	
	return matrix;
}

function condorcetWinner(matrix) {
	function beats(candidate, other_candidate) {
		return matrix[candidate][other_candidate] > matrix[other_candidate][candidate] || candidate == other_candidate;
	}
	
	for (let candidate of matrix.keys()) {
		if ([...matrix.keys()].every(other_candidate => beats(candidate, other_candidate)))
			return candidate;
	}
}

function removeCandidate(candidate, ballots, matrix) {
	for (let ballot of ballots)
		ballot[candidate] = Infinity;
	
	matrix[candidate].fill(-Infinity);
}

function minIndexes(array) {
	let arrayMin = Math.min(...array);
	return [...array.keys()].filter(i => array[i] == arrayMin);
}

function irvLoser(ballots) {
	let topCount = Array(ballots[0].length).fill(0);
	
	for (let ballot of ballots) {
		for (let topCandidate of minIndexes(ballot))
			topCount[topCandidate]++;
	}
	
	for (let [candidate, rank] of ballots[0].entries()) {
		if (rank == Infinity)
			topCount[candidate] = Infinity;
	}
	
	let bottomCandidates = minIndexes(topCount);
	return bottomCandidates[Math.floor(Math.random() * bottomCandidates.length)];
}

function condorcetIrvWinner(matrix, ballots) {
	let winner = condorcetWinner(matrix);
	
	while (winner == null) {
		removeCandidate(irvLoser(ballots), ballots, matrix);
		winner = condorcetWinner(matrix);
	}
	
	return winner;
}

function stringToBallots(input) {
	return input.trim().split(/[\n\r]+/).map(ballot => 
		ballot.trim().split(/[^0-9]+/).map(rank => parseInt(rank))
	);
}

function notationToBallots(input) {
	return input.trim().split(/[\n\r]+/).map(ballot => {
		let sequence = ballot.trim().split(/[^0-9ge]+/);
		let ranks = Array(Math.ceil(sequence.length / 2)).fill(NaN);
		let nextRank = 1;
		
		for (let item of sequence) {
			if (item == 'g')
				nextRank++;
			else if (/^[0-9]+$/.test(item))
				ranks[parseInt(item) - 1] = nextRank;
			else if (item != 'e')
				throw "Invalid format";
		}
		
		return ranks;
	});
}

function areValid(ballots) {
	const nCandidates = ballots[0].length;
	
	return ballots.every(ballot =>
		ballot.length == nCandidates && ballot.every(rank => Number.isInteger(rank))
	);
}
