import './App.css';
import React, {useState} from 'react'
import FirstFrame from './gui components/firstFrame';

function App() {
  const [lolCodeData,setLolCodeData] = useState({})
  console.log(lolCodeData)
  return (
    <div className="App">
      <div className = "mainWrapper">

        <div className = "firstRow">
            <FirstFrame></FirstFrame>
            
          <div className = "secondFrame">
            UWU2
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
