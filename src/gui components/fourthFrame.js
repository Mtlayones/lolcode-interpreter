import React, { useState } from 'react';
import { Button } from 'antd';
import '../App.css';

function FourthFrame(props) {

  return(
    <div className="fourthFrame">
        <Button className="executeButton" shape = {'round'} onClick = {(event) => props.setButtonEventClick(event.type)}> Execute </Button>
    </div>
  )
}
export default FourthFrame
