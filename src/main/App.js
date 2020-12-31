import './App.css';
import React, { useState } from 'react';
import { FirstFrame, SecondFrame, ThirdFrame, FourthFrame, FifthFrame } from '../components';
import { program_abs } from '../utils/parser';
import { program_start } from '../utils/semantics';

const App = () => {
  // lolText contains the text data only
  const [lolText,setLolText] = useState('')
  // lolParser will contain the parsed data
  const [parsedLol,setParsedLol] = useState([])
  // for The Symbol Table
  const [symbolTable, setSymbolTable] = useState([])
  // If a Button is clicked
  const [buttonClick, setButtonClick] = useState(false)

  return (
    <div className="App">
      {/* mainWrapper is the Main parent for all the components */}
      <div className="mainWrapper">
      {/* First Row contains the First Frame and Second Frame (File Browser and Symbol Table) */}
        <div className="firstRow">
            <FirstFrame lolText={lolText} setLolText={setLolText}/>
            <SecondFrame parsedLol={parsedLol}/>
            <ThirdFrame symbolTable={symbolTable}/>
        </div>
        {/* The Second Row contains the Third Frame (Terminal) */}
        <div className="secondRow">
            <FourthFrame setButtonClick={setButtonClick}/>
        </div>
        <div className="thirdRow">
            <FifthFrame lolText={lolText} symbolTable={symbolTable} setSymbolTable={setSymbolTable} parsedLol={parsedLol} setParsedLol={setParsedLol} program_start={program_start} program_abs={program_abs} buttonClick={buttonClick} setButtonClick={setButtonClick}/>
        </div>
      </div>
    </div>
  );
}

export default App;
