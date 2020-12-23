import React, { useState,useEffect } from 'react';
import { Table, Empty, Tag, Space } from 'antd'

function SecondFrame(props){
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
        console.log(props.parsedLol)
    },[])

    // Updates the parser for every change in the text in the first frame
    useEffect(() => {
        const hello = props.program_abs(props.lolText,[],1)
        const test = hello[1]
        // filters the newlines
        const filter = (typeof test != 'string') ? test.filter(x=> x.value != '\n') : null
        console.log(filter)
        props.setParsedLol(filter)
    },[props.lolText])

    return props.parsedLol == 0? <Empty className = "secondFrameContent"/> : <Table className = "secondFrameContent" dataSource = {props.parsedLol} columns = {columns} width = {100}    pagination = {false} sticky = {true}/>
}

export default SecondFrame