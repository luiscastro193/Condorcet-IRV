"use strict";
async function mergeSort(values, compare) {
	if (values.length == 1)
		return [values[0]];
	
	if (values.length == 3) {
		let order = await compare(values[0], values[2]);
		
		values[1] = order != 0 ? 'g' : 'e';
		
		if (order > 0)
			[values[0], values[2]] = [values[2], values[0]]
		
		return values;
	}
	
	let splitIndex = Math.floor(Math.ceil(values.length / 2) / 2) * 2 - 1;
	let ordered = [await mergeSort(values.slice(0, splitIndex), compare), await mergeSort(values.slice(splitIndex + 1), compare)];
	let indexes = [0, 0];
	let result = [];
	
	function pushWithEquals(i) {
		result.push(ordered[i][indexes[i]]);
		
		while (ordered[i][indexes[i] + 1] == 'e') {
			result.push('e');
			result.push(ordered[i][indexes[i] + 2]);
			indexes[i] += 2;
		}
		
		indexes[i] += 2;
	}
	
	while (indexes[0] < ordered[0].length && indexes[1] < ordered[1].length) {
		let order = await compare(ordered[0][indexes[0]], ordered[1][indexes[1]]);
		
		if (result.length)
			result.push('g');
		
		if (order != 0)
			pushWithEquals(order < 0 ? 0 : 1);
		else {
			pushWithEquals(0);
			result.push('e');
			pushWithEquals(1);
		}
	}
	
	if (indexes[0] < ordered[0].length || indexes[1] < ordered[1].length) {
		result.push('g');
		result = result.concat(ordered[0].slice(indexes[0]), ordered[1].slice(indexes[1]));
	}
	
	return result;
}

async function sort(values, compare) {
	values = [].concat(...values.map(item => [item, 'u']));
	values.pop();
	return mergeSort(values, compare);
}
