import React, { useState,useEffect } from 'react';

function SecondFrame(props){
    const [parsed, setparsed] = useState(props.lolParser)

    // component on Mount
    useEffect(() => {
        console.log(parsed)
    },[])

    useEffect(() => {
        const hello = props.program_abs(props.lolText,[],1)
        setparsed({...hello[2]})
        console.log(parsed)
    },[props.lolText])
    
    return(
        <p></p>
    )

}

export default SecondFrame