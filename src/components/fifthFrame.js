import React, { useState, useRef, useEffect } from 'react'
import TextArea from 'antd/lib/input/TextArea'

export const FifthFrame = ({ lolText, symbolTable, setSymbolTable, parsedLol, setParsedLol, program_start, program_abs, buttonClick, setButtonClick }) => {
    // This will keep track of the output key words i.e VISIBLE
    // this is used to keep track of the values of prefixText
    const prefixTextRef = useRef('')
    const [prefixText,setPrefixText] = useState('');

    // Handles the changes for the prefixText
    const handlePrefixChanges = (strings) => {
        prefixTextRef.current = prefixTextRef.current.concat(strings)
        // setPrefixText(prefixTextRef.current)
    }

    useEffect(() => {
        if(buttonClick){
            const parsed_table = program_abs(lolText,[],1);
            if(Array.isArray(parsed_table)){
                prefixTextRef.current = "";
                setParsedLol(parsed_table[1]);
                const symbol_table = program_start([...parsed_table[1]],handlePrefixChanges);
                if(Array.isArray(symbol_table)){
                    setSymbolTable(symbol_table);
                }else{
                    prefixTextRef.current = symbol_table;
                    setParsedLol([]);
                    setSymbolTable([]);
                }
            }else{
                prefixTextRef.current = parsed_table;
                setParsedLol([]);
                setSymbolTable([]);
            }
            setPrefixText(prefixTextRef.current);
            setButtonClick(false);
        }
    },[buttonClick])

    return (
        <div className = "fifthFrame">
        <TextArea className="fifthFrameTerminal" bordered={false} value={prefixText} readOnly></TextArea>
        </div>
    )
}
