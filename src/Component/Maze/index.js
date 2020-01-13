import React, { useState, useEffect, useCallback } from 'react';
import { times, map } from 'lodash';
import './index.css';

const endTag = 'End tag';
const classNameList = [ '', 't', 'r', 'b', 'l' ];
const contraryClassNameList = [ '', 'b', 'l', 't', 'r' ];
function getRandomDirection() {
	const list = [ 1, 2, 3, 4 ];
	const arr = [];
	function random() {
		const num = Math.floor(Math.random() * list.length);
		arr.push(list[num]);
		list.splice(num, 1);
		if (arr.length >= 4) return arr;
		return random();
	}
	return random();
}

function depthTraversal(option) {
	const { gridNum, start, end, grid } = option;
	if (start === end) {
		grid[start].isRoute = true;
		return endTag;
	}
	let isEnd = false;
	const { direction } = grid[start];
	grid[start].isVisited = true;
	direction.forEach((item) => {
		const nextGridIndex = getNextGridIndex(option, item);
		if (nextGridIndex === false || grid[nextGridIndex].isVisited) return;
		grid[start].className.push(classNameList[item]);
		grid[nextGridIndex].className.push(contraryClassNameList[item]);
		const temp = depthTraversal({ gridNum, start: nextGridIndex, end, grid });
		if (temp === endTag) {
			isEnd = true;
		}
	});
	if (isEnd) {
		grid[start].isRoute = true;
		return endTag;
	}
}

function getNextGridIndex(option, item) {
	const { gridNum, start, end, grid } = option;
	if (item === 1) {
		return start < gridNum ? false : start - gridNum;
	} else if (item === 2) {
		return (start + 1) % gridNum ? start + 1 : false;
	} else if (item === 3) {
		return start >= gridNum * (gridNum - 1) ? false : start + gridNum;
	} else if (item === 4) {
		return start % gridNum ? start - 1 : false;
	}
	return false;
}

function getRandomMaze({ gridNum, start, end }) {
	const grid = times(gridNum * gridNum, (index) => {
		return {
			index,
			isVisited: false,
			// 1: 上 ，2：右； 3：下； 4：左
			direction: getRandomDirection(),
			className: []
		};
	});
	depthTraversal({ gridNum, start, end, grid });
	return grid;
}

function getPath(start, gridList) {}

function Maze({ gridNum }) {
	const [ start, setStartGrid ] = useState(0);
	const [ end ] = useState(gridNum * gridNum - 1);
	const [ gridList, setGridList ] = useState([]);
	useEffect(
		() => {
			setGridList(getRandomMaze({ gridNum, start, end }));
		},
		[ gridNum ]
	);
	return (
		<div>
			<ul className="list">
				{map(gridList, (item, index) => {
					let className = item.className.join(' ');
					if (index === start) {
						className += ' red';
					}
					if (index === end) {
						className += ' black';
					}
					if (item.isRoute) {
						className += ' gray';
					}
					return <li className={className} key={`${index}_${gridNum}`} />;
				})}
			</ul>
			<div onClick={() => getPath(start, gridList)}>获取路径</div>
		</div>
	);
}

export default Maze;
