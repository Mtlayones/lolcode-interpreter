import React, { useState,useRef,useEffect} from 'react'
import { Table, Empty } from 'antd'
import { CloseOutlined } from '@ant-design/icons'

export const ThirdFrame = (props) => {
    const isInitialMount = useRef(true);
    const [description,setDescription] = useState("We Have Nothing to Work On UwU")

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

    return(
        <div className = "thirdFrame">
            {(props.buttonClickCount === 0)?(
                <div className = "thirdFrameCont">
                    <Empty description={description} style={{color:"white"}}/>
                </div>
                ): 
                (props.symbolTable.length === 0)?(
                    <div className = "thirdFrameCont">
                            <CloseOutlined style={{fontSize: "25px", color:"white"}}/>
                            <p style={{color:"white"}}>{description}</p>
                    </div>  
                ):(
                    <Table className ="thirdFrameContent" dataSource = {props.symbolTable} columns = {columns} width = {100} pagination = {false}/>
                )
            }
        </div>
    )    
}
