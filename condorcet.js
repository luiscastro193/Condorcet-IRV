"use strict";
import PRNG from 'https://luiscastro193.github.io/PRNG/PRNG.js';

export function condorcetMatrix(ballots) {
	const nCandidates = ballots[0].length;
	let matrix = Array.from({length: nCandidates}, () => Array(nCandidates).fill(0));
	
	for (let ballot of ballots) {
		for (let [candidate, rank] of ballot.entries()) {
			for (let [otherCandidate, otherRank] of ballot.entries()) {
				if (rank < otherRank)
					matrix[candidate][otherCandidate]++;
			}
		}
	}
	
	return matrix;
}

function condorcetWinner(matrix) {
	function beats(candidate, otherCandidate) {
		return matrix[candidate][otherCandidate] > matrix[otherCandidate][candidate] || candidate == otherCandidate;
	}
	
	for (let candidate of matrix.keys()) {
		if ([...matrix.keys()].every(otherCandidate => beats(candidate, otherCandidate)))
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

async function irvLoser(ballots, random) {
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
	
	if (bottomCandidates.length > 1)
		return bottomCandidates[Math.trunc((await random)() * bottomCandidates.length)];
	else
		return bottomCandidates[0];
}

export async function condorcetIrvWinner(matrix, ballots, seed) {
	let random = PRNG(seed);
	let winner = condorcetWinner(matrix);
	
	while (winner == null) {
		removeCandidate(await irvLoser(ballots, random), ballots, matrix);
		winner = condorcetWinner(matrix);
	}
	
	return winner;
}

export function stringToBallots(input) {
	return input.trim().split(/\s+^\s*/m).map(ballot => 
		ballot.split(/[^0-9]+/).map(rank => Number(rank))
	);
}

export function notationToBallots(input) {
	return input.trim().split(/\s+^\s*/m).map(ballot => {
		let sequence = ballot.split(/[^0-9ge]+/);
		let ranks = Array(Math.ceil(sequence.length / 2)).fill(NaN);
		let nextRank = 1;
		
		for (let item of sequence) {
			if (item == 'g')
				nextRank++;
			else if (/^[0-9]+$/.test(item))
				ranks[Number(item) - 1] = nextRank;
			else if (item != 'e')
				throw "Invalid format";
		}
		
		return ranks;
	});
}

export function areValid(ballots) {
	const nCandidates = ballots[0].length;
	
	return ballots.every(ballot =>
		ballot.length == nCandidates && ballot.every(rank => Number.isInteger(rank))
	);
}
