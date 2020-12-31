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
  const [buttonClickCount, setButtonClickCount] = useState(0)

  return (
    <div className="App">
      {/* mainWrapper is the Main parent for all the components */}
      <div className="mainWrapper">
      {/* First Row contains the First Frame and Second Frame (File Browser and Symbol Table) */}
        <div className="firstRow">
            <FirstFrame lolText={lolText} setLolText={setLolText} buttonClickCount={buttonClickCount} />

            <SecondFrame setParsedLol={setParsedLol} parsedLol={parsedLol} lolText={lolText} program_abs={program_abs} buttonClickCount={buttonClickCount}/>

            <ThirdFrame buttonClickCount={buttonClickCount} symbolTable={symbolTable}></ThirdFrame>
        </div>
        {/* The Second Row contains the Third Frame (Terminal) */}

        <div className="secondRow">
            <FourthFrame setButtonClickCount={setButtonClickCount} buttonClickCount={buttonClickCount}/>
        </div>
        <div className="thirdRow">
            <FifthFrame symbolTable={symbolTable} setSymbolTable={setSymbolTable} parsedLol={parsedLol} program_start={program_start} ></FifthFrame>

        </div>
      </div>
    </div>
  );
}

export default App;
