"use strict";
function condorcetMatrix(ballots) {
	let n_candidates = ballots[0].length;
	let matrix = Array.from(Array(n_candidates), () => Array(n_candidates).fill(0));
	
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
	return [...array.keys()].filter(i => array[i] == Math.min(...array));
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

let ballots = `
	1 2 3
	2 3 1
	3 1 2
`;

ballots = ballots.trim().split(/[\n\r]+/).map(ballot => ballot.trim().split(/[^0-9]+/).map(rank => parseInt(rank)));

console.log(condorcetIrvWinner(condorcetMatrix(ballots), ballots));
