import React from 'react';
import { Button } from 'antd';
import '../main/App.css';

export const FourthFrame = ({ setButtonClick }) => {
  return(
    <div className="fourthFrame">
        <Button className="executeButton" type="primary" onClick = {()=>{setButtonClick(true)}}> Execute </Button>
    </div>
  )
}
