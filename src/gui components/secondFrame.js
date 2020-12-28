import React, { useState,useEffect } from 'react';
import { Table, Empty, Tag, Space } from 'antd'

function SecondFrame(props){
    // Title for the colums
    const [filteredLolCode, setfilteredLolCode] = useState('')
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
        const parsedText = props.program_abs(props.lolText,[],1)
        const test = parsedText[1]
        // filters the newlines
        const filter = (typeof test != 'string') ? test.filter(x=> x.value != '\n') : null
        setfilteredLolCode(filter)
        props.setParsedLol(test)
    },[props.buttonEventClick])

    // If the execute Button has not been pressed yet, display empty, else display the Table
    return props.buttonEventClick === false? <Empty className = "secondFrameContent"/> : <Table className = "secondFrameContent" dataSource = {filteredLolCode} columns = {columns} width = {100} pagination = {false} sticky = {true}/>
}

export default SecondFrame