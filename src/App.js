import './App.css';
import React, {useState} from 'react'
import FirstFrame from './gui components/firstFrame';
import SecondFrame from './gui components/secondFrame'
import program_abs from './gui components/parser'

function App() {
  // lolText contains the text data only
  const [lolText,setLolText] = useState('')
  // lolParser will contain the parsed data
  const [lolParser,setLolParser] = useState([])
  return (
    <div className="App">
      {/* mainWrapper is the Main parent for all the components */}
      <div className = "mainWrapper">
      {/* First Row contains the First Frame and Second Frame (File Browser and Symbol Table) */}
        <div className = "firstRow">
          <FirstFrame lolText = {lolText} setLolText = {setLolText}/>
      
          <div className = "secondFrame">
            <SecondFrame setLolParser = {setLolParser} lolParser = {lolParser} lolText = {lolText} program_abs = {program_abs}/>
          </div>
        
        </div>
        {/* The Second Row contains the Third Frame (Terminal) */}
        <div className="secondRow">
          <div className="thirdFrame">
            UWU3
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
