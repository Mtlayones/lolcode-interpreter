import React, { useState, useRef, useEffect } from 'react'
import TextArea from 'antd/lib/input/TextArea'

function FifthFrame(props) {
    // This will keep track of the output key words i.e VISIBLE
    const [prefixText,setPrefixText] = useState([])
    // used to check if first time getting mounted
    const isInitialMountFifthFrame = useRef(true)
    // this is used to keep track of the values of prefixText
    const prefixTextRef = useRef(prefixText)

    // Handles the changes for the prefixText
    const handlePrefixChanges = (strings) => {
        let array = [...prefixTextRef.current]
        prefixTextRef.current = array.concat(strings)
    }

    useEffect(() => {
        // Initial Mount
        if(isInitialMountFifthFrame.current){
            isInitialMountFifthFrame.current = false
        }else{
            console.log("length of props lol",props.parsedLol.length)
            if(props.parsedLol.length !== 0){
                console.log("PARSED LOL IS")
                console.log([...props.parsedLol])
                const symbol_table = props.program_start(props.parsedLol,handlePrefixChanges)
                // console.log("the symbol table is",symbol_table)
                console.log([...symbol_table])
                if(typeof symbol_table === 'string'){
                    console.log("THE SYMBOL TABLE RETURNED A STRING")
                    setPrefixText(symbol_table)
                    // console.log(prefixText,typeof symbol_table)
                }else{
                    console.log("CHANGING THE SYMBOL TABLE")
                    props.setSymbolTable(symbol_table)
                }
            }
        }
    },[props.parsedLol])

    const handlePreview = () => {
        if (Array.isArray(prefixText)){
            return prefixText.join("")
        }else{
            return prefixText
        }
    }

    console.log("FIFTH FRAME HERE")
    return (
        <div className = "fifthFrame">
        <TextArea className="fifthFrameTerminal" bordered={false} value={handlePreview} readOnly></TextArea>
        </div>
    )
}

export default FifthFrame
