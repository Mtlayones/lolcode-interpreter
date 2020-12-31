import React, { useState,useEffect, useRef } from 'react';
import { Table, Empty } from 'antd'
import { CloseOutlined } from '@ant-design/icons'

export const SecondFrame = (props) => {
    // Will be used to check if its the first time the app will be mounted. This will not trigger a render when changed
    const isInitialMount = useRef(true)
    // This will be the filtered parsed lol code to display in this frame and is different from the single source of truth
    const [filteredLolCode, setfilteredLolCode] = useState('')
    // Will be used for the initial mount description and if there is a syntax error
    const [description, setDescription] = useState("We Have Nothing to Work On UwU")


    // Title for the colums
    const columns = [
        {
            title: 'Lexemes',
            dataIndex: 'value',
            key: 'value'
        },
        {
            title: 'Classification',
            dataIndex: 'description',
            key: 'description'
        }
    ]

    // Updates the parser for every change in the text in the first frame
    useEffect(() => {
        if(!isInitialMount.current){
            console.log("LOL TEXT IS",props.lolText)
            const parsedText = props.program_abs(props.lolText,[],1)
            if(Array.isArray(parsedText)){
                const test = parsedText[1]
                console.log("parsedText")
                const filter = test.filter(x=> x.value !== '\n')
                setfilteredLolCode(filter)  
                props.setParsedLol(test)
            }else if(typeof parsedText == 'string'){
                setDescription(parsedText)
                props.setParsedLol([])
            }
        }else{
            isInitialMount.current = false
        }
    },[props.lolText])
    console.log("SECOND FRAME HERE")



    // If the execute Button has not been pressed yet, display empty, else display the Table
    if(props.buttonClickCount === 0){
         return(
            <div className = "secondFrame">
                <Empty description={description} />
            </div>
         )   
    }else if (props.parsedLol.length === 0){
        console.log("HERE at second frame",props.parsedLol)
        return (
            <div className = "secondFrame">
             <CloseOutlined style={{fontSize: "25px"}}/>
             <p style={{color:"darkred"}}>{description}</p>
            </div>
        )
    }else{
        return (
            <div className="secondFrame">
                <Table className ="secondFrameContent" dataSource = {filteredLolCode} columns = {columns} width = {100} pagination = {false}/>
            </div>
        )
    }
    
}