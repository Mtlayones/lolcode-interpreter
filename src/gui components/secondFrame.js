import React, { useState,useEffect } from 'react';

function SecondFrame(props){
    // component on Mount
    useEffect(() => {
        console.log(props.lolParser)
    },[])
    // Updates the parser for every change in the text in the first frame
    useEffect(() => {
        const hello = props.program_abs(props.lolText,[],1)
        props.setLolParser(hello[2])
        console.log(props.lolParser)
    },[props.lolText])

    return(
        <p></p>
    )

}

export default SecondFrame