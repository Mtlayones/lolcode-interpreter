import React, { useState } from 'react';
import { Button } from 'antd';
import '../App.css';

function FourthFrame(props) {

  const handleOnClick = (event) => {
    // props.setParsedLol([])
    // props.setSymbolTable([])
    console.log("BUTTON CLICKED")
    props.setButtonClickCount(props.buttonClickCount+1)
    console.log(props.buttonClickCount)
  }

  console.log("FOURTH FRAME HERE")

  return(
    <div className="fourthFrame">
        <Button className="executeButton" shape = {'round'} onClick = {handleOnClick}> Execute </Button>
    </div>
  )
}
export default FourthFrame
