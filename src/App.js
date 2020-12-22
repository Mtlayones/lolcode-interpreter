import './App.css';
import React, {useState} from 'react'
import FirstFrame from './gui components/firstFrame';
import SecondFrame from './gui components/secondFrame'

function App() {
  const [lolText,setLolText] = useState('')
  return (
    <div className="App">
      <div className = "mainWrapper">

        <div className = "firstRow">
          <FirstFrame lolText = {lolText} setLolText = {setLolText} />
            
          <div className = "secondFrame">
            <SecondFrame lolText = {lolText}/>
          </div>

        </div>
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
