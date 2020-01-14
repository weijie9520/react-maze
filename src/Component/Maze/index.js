import React, { useState, useEffect, useCallback, Component } from 'react';
import { times, map, noop } from 'lodash';
import './index.css';

const endTag = 'End tag';
const classNameList = [ '', 't', 'r', 'b', 'l' ];
const contraryClassNameList = [ '', 'b', 'l', 't', 'r' ];

let currentPathPoint = {};

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
	grid[start].isVisited = true;
	if (start === end) {
		currentPathPoint[start] = grid[start];
		// grid[start].isRoute = true;
		return endTag;
	}
	let isEnd = false;
	const { direction } = grid[start];
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
		currentPathPoint[start] = grid[start];
		// grid[start].isRoute = true;
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

function getTypeIndex(key) {
	return classNameList.findIndex((k) => k === key);
}

class Maze extends Component {
	constructor(props) {
		super();
		const { gridNum } = props;
		this.state = {
			start: 0,
			end: gridNum * gridNum - 1,
			showPath: 0,
			gridList: []
		};
	}

	componentDidMount() {
		const { gridNum } = this.props;
		const { start, end } = this.state;
		this.setState({
			gridList: getRandomMaze({ gridNum, start, end })
		});

		document.addEventListener('keydown', this.keydοwn);
	}
	componentDidUpdate(preProps) {
		const { gridNum } = this.props;
		if (preProps.gridNum !== gridNum) {
			this.reset();
		}
	}
	componentWillUnmount() {
		document.removeEventListener('keydown', this.keydοwn);
	}

	render() {
		const { gridNum } = this.props;
		const { gridList, start, end, showPath } = this.state;
		return (
			<div>
				<ul className="list" style={{ width: gridNum * 20 }}>
					{map(gridList, (item, index) => {
						let className = item.className.join(' ');
						if (index === start) {
							className += ' red';
						}
						if (index === end) {
							className += ' black';
						}
						if (showPath && item.isPath) {
							className += ' gray';
						}
						return <li className={className} key={`${index}_${gridNum}`} />;
					})}
				</ul>
				<div className="info">
					<p>当前等级：{gridNum}(最高：100)</p>
					<p> 操作键：w,a,s,d </p>
					<div className="btn" onClick={this.getPath}>
						{showPath ? '移除路径显示' : '获取路径'}
					</div>
					<div className="input">
						调整当前等级
						<input ref={(dom) => (this.input = dom)} type="number" />
						<button onClick={this.confirm}>确定</button>
					</div>
				</div>
			</div>
		);
	}

	getPath = () => {
		const { gridNum } = this.props;
		const { gridList, start, end, showPath } = this.state;

		if (showPath)
			return this.setState({
				showPath: false
			});
		const loop = function(index) {
			if (index === end) {
				currentPathPoint[index].isPath = true;
				return endTag;
			}

			if (!currentPathPoint[index]) return;
			const { className, _path } = currentPathPoint[index];
			if (_path) return;
			currentPathPoint[index]['_path'] = true;
			for (let i = 0; i < className.length; i++) {
				const typeIndex = getTypeIndex(className[i]);

				const next = getNextGridIndex({ gridNum, start: index }, typeIndex);
				const temp = loop(next);
				if (temp === endTag) {
					currentPathPoint[index].isPath = true;
					return endTag;
				}
			}
		};
		Object.keys(currentPathPoint).forEach((item) => {
			currentPathPoint[item].isPath = false;
			currentPathPoint[item]._path = false;
		});
		loop(start);
		this.setState({
			showPath: true
		});
	};

	confirm = () => {
		const { setgridNum } = this.props;
		if (!this.input || !this.input.value) return;
		const value = Math.abs(Math.floor(Number(this.input.value)));
		setgridNum(value);
	};

	keydοwn = (event) => {
		const { keyCode } = event;
		if (keyCode === undefined) return;

		switch (keyCode) {
			// w
			case 87:
				return this.move('t');
			// s
			case 83:
				return this.move('b');
			// a
			case 65:
				return this.move('l');
			// d
			case 68:
				return this.move('r');
		}
	};

	move = (type) => {
		const { gridNum, setgridNum } = this.props;
		const { gridList, start, end, showPath } = this.state;
		if (gridList[start].className.includes(type)) {
			const next = getNextGridIndex({ gridNum, start }, getTypeIndex(type));
			if (next === end) {
				alert('恭喜通过关卡！');
				setgridNum(gridNum + 1);
				// onComplate();
				// this.reset();
			} else {
				this.setState({ start: next });
			}
		}
	};
	reset = () => {
		const { gridNum } = this.props;
		currentPathPoint = {};
		const start = 0;
		const end = gridNum * gridNum - 1;
		this.setState({
			gridList: getRandomMaze({ gridNum, start, end }),
			start,
			end
		});
	};
}

export default Maze;
