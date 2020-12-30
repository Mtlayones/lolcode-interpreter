import React, { useState, useRef, useEffect } from 'react'
import TextArea from 'antd/lib/input/TextArea'

function FifthFrame(props) {
    // This will keep track of the output key words i.e VISIBLE
    // used to check if first time getting mounted
    const isInitialMountFifthFrame = useRef(true)
    // this is used to keep track of the values of prefixText
    const prefixTextRef = useRef('')

    // Handles the changes for the prefixText
    const handlePrefixChanges = (strings) => {
        prefixTextRef.current = prefixTextRef.current.concat(strings)
        // setPrefixText(prefixTextRef.current)
    }

    useEffect(() => {
        // Initial Mount
        if(isInitialMountFifthFrame.current){
            isInitialMountFifthFrame.current = false
        }else{
            console.log("length of props lol",props.parsedLol.length)
            // clear the terminal
            prefixTextRef.current = ""
            if(props.parsedLol.length !== 0){
                console.log("PARSED LOL IS")
                // console.log([...props.parsedLol])
                let copy = [...props.parsedLol]
                const symbol_table = props.program_start(copy,handlePrefixChanges)
                // console.log("the symbol table is",symbol_table)
                if(typeof symbol_table === 'string'){
                    console.log("THE SYMBOL TABLE RETURNED A STRING")
                    prefixTextRef.current = symbol_table
                }else{
                    console.log("CHANGING THE SYMBOL TABLE")
                    props.setSymbolTable(symbol_table)
                }
            }
        }
    },[props.parsedLol])

    console.log("FIFTH FRAME HERE")
    return (
        <div className = "fifthFrame">
        <TextArea className="fifthFrameTerminal" bordered={false} value={prefixTextRef.current} readOnly></TextArea>
        </div>
    )
}

export default FifthFrame
