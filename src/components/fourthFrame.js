import React, { useState } from 'react';
import { Button } from 'antd';
import '../main/App.css';

export const FourthFrame = (props) => {

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
        <Button className="executeButton" onClick = {handleOnClick}> Execute </Button>
    </div>
  )
}
