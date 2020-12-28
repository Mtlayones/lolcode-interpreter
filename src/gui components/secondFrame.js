import React, { useState,useEffect, useRef } from 'react';
import { Table, Empty } from 'antd'

function SecondFrame(props){
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

    // component on Mount
    useEffect(() => {
        console.log(props.buttonEventClick)
    },[])

    // Updates the parser for every change in the text in the first frame
    useEffect(() => {
        if(!isInitialMount.current){
            const parsedText = props.program_abs(props.lolText,[],1)
            console.log(typeof parsedText)
            // filters the newlines
            if(Array.isArray(parsedText)){
                const test = parsedText[1]
                const filter = test.filter(x=> x.value != '\n')
                setfilteredLolCode(filter)  
                props.setParsedLol(test)
            }else if(typeof parsedText == 'string'){
                setDescription(parsedText)
                props.setButtonEventClick(false)
                console.log("HERE")
            }
        }else{
            isInitialMount.current = false
        }
    },[props.buttonEventClick])


    // If the execute Button has not been pressed yet, display empty, else display the Table
    return props.buttonEventClick === false? <Empty className = "secondFrameContent" description={description}/> : <Table className = "secondFrameContent" dataSource = {filteredLolCode} columns = {columns} width = {100} pagination = {false} sticky = {true}/>
}

export default SecondFrame