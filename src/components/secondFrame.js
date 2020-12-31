import React, { useState,useEffect } from 'react';
import { Table, Empty } from 'antd'

export const SecondFrame = ({ parsedLol }) => {
    // This will be the filtered parsed lol code to display in this frame and is different from the single source of truth
    const [filteredLolCode, setfilteredLolCode] = useState('')

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
        setfilteredLolCode(parsedLol.filter(x=> x.value !== '\n'))  
    },[parsedLol])

    return(
        <div className = "secondFrame">
            {
                (parsedLol.length === 0)?(
                    <div className = "secondFrameCont">
                        <Empty description={"We Have Nothing to Work On UwU"} style={{color:"white"}}/>
                    </div> 
                ):(
                    <Table className ="secondFrameContent" dataSource = {filteredLolCode} columns = {columns} width = {100} pagination = {false}/>
                )
            }
        </div>
    )    
}