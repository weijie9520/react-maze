import React, { useState } from 'react';
import Maze from './Component/Maze';
import './App.css';

function App() {
	const [ gridNum, setgridNum ] = useState(20);
	return <Maze key={gridNum} gridNum={gridNum} />;
}

export default App;
