import React from 'react'
import { Table, Empty } from 'antd'

export const ThirdFrame = ({ symbolTable }) => {
    
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

    return(
        <div className = "thirdFrame">
            {
                (symbolTable.length === 0)?(
                    <div className = "thirdFrameCont">
                        <Empty description={"We Have Nothing to Work On UwU"} style={{color:"white",width:'100%',justifyContent:'center',alignItems:'center',display:'flex',flexDirection:'column'}}/>
                    </div>
                ):(
                    <Table className ="thirdFrameContent" dataSource = {symbolTable} columns = {columns} width = {100} pagination = {false}/>
                )
            }
        </div>
    )    
}
