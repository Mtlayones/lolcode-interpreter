import './App.css';
import React, {useState} from 'react';
import FirstFrame from './gui components/firstFrame';
import SecondFrame from './gui components/secondFrame';
import program_abs from './gui components/parser';
import FourthFrame from './gui components/fourthFrame';



function App() {
  // lolText contains the text data only
  const [lolText,setLolText] = useState('')
  // lolParser will contain the parsed data
  const [parsedLol,setParsedLol] = useState([])
  // If a Button is clicked
  const [buttonEventClick, setButtonEventClick] = useState(false)


  return (
    <div className="App">
      {/* mainWrapper is the Main parent for all the components */}
      <div className="mainWrapper">
      {/* First Row contains the First Frame and Second Frame (File Browser and Symbol Table) */}
        <div className="firstRow">
            <FirstFrame lolText={lolText} setLolText={setLolText} buttonEventClick={buttonEventClick} />

          <div className="secondFrame">
            <SecondFrame setParsedLol={setParsedLol} parsedLol={parsedLol} lolText={lolText} program_abs={program_abs} buttonEventClick={buttonEventClick}/>
          </div>

          <div className="thirdFrame">

          </div>
        </div>
        {/* The Second Row contains the Third Frame (Terminal) */}
        <div className="secondRow">
            <FourthFrame setButtonEventClick={setButtonEventClick}/>
        </div>
        <div className="thirdRow">
          <div className="fifthFrame">
            UwU5
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;
