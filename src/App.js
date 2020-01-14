import React, { useState } from 'react';
import Maze from './Component/Maze';
import './App.css';

function App() {
	const [ gridNum, setgridNum ] = useState(5);
	return <Maze key={gridNum}  setgridNum={setgridNum} gridNum={gridNum} />;
}

export default App;
