import React, { useState } from 'react';
import { Button } from 'antd';
import '../App.css';

function FourthFrame(props) {

  const handleOnClick = (event) => {
    props.setButtonEventClick(event.type)
    console.log("BUTTON CLICKED")
  }

  console.log("FOURTH FRAME HERE")

  return(
    <div className="fourthFrame">
        <Button className="executeButton" shape = {'round'} onClick = {handleOnClick}> Execute </Button>
    </div>
  )
}
export default FourthFrame
