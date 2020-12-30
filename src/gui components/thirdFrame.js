import React, { useState,useRef,useEffect} from 'react'
import { Table, Empty } from 'antd'
import { CloseOutlined } from '@ant-design/icons'

function ThirdFrame(props) {
    const isInitialMount = useRef(true);
    const [description,setDescription] = useState("Nothing is getting parsed yet UwU")

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: 'Value',
            dataIndex: 'value',
            key: 'value'
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type'
        }
    ]

    // If the symbolTable has changed we update the values
    useEffect(() => {
        if(isInitialMount.current){
            console.log("Third Frame start here")
            isInitialMount.current = false
           
        }else{
            console.log(props.symbolTable)
            if(props.symbolTable === 'string'){
                setDescription(props.symbolTable)
            }
        }
    },[props.symbolTable])

    console.log("THIRD FRAME HERE")

    if(props.buttonClickCount===0){
         return(
            <div className = "thirdFrame">
                <Empty description={description}/>
            </div>
         )   
    }else if (props.symbolTable.length === 0){
        return (
            <div className = "thirdFrame">
                <CloseOutlined style={{fontSize: "25px"}}/>
                <p style={{color:"darkred"}}>{description}</p>
            </div>
        )
    }else{
        return (
            <div className="thirdFrame">
                <Table className = "thirdFrameContent" dataSource = {props.symbolTable} columns = {columns} width = {100} pagination = {false}/>
            </div>
        )
    }
}

export default ThirdFrame
