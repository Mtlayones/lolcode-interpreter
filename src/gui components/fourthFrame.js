import React, { useState } from 'react';
import { Button } from 'antd';
import '../App.css';

function FourthFrame(props) {

  const handleOnClick = (event) => {
    console.log(props.lolText)
  }

  return(
    <div className="fourthFrame">
        <Button className="executeButton" shape = {'round'} onClick = {handleOnClick}> Execute </Button>
    </div>
  )
}
export default FourthFrame
