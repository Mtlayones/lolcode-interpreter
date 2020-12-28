import React, { useState } from 'react';
import { Upload } from 'antd';
import 'antd/dist/antd.css';
import '../App.css';
import AceEditor from 'react-ace';

function FirstFrame (props) {
  const { Dragger } = Upload
  const [files, setfiles] = useState([])
  // const [codeEditorText, setCodeEditorText] = useState("")
  const [fileProperty] = useState({
  name: 'file',
  multiple: false,
  accept : ".lol",
  beforeUpload(file){
    console.log("BEFORE UPLOAD")
    readFile(file)
    return false
  },
  onChange(info){
    console.log("Change")
    handleChange(info)
  }
})
// This Part handle changes in the file (i.e if a file is added)
const handleChange = (info) => {
  console.log("HANDLE CHANGE")
  let fileList = [...info.fileList];
  fileList = fileList.slice(-1);
  setfiles(fileList)
}


// This part catches the file that is uploaded/dragged to the Upload field
const readFile = async(file) => {
    const text = await file.text()
    console.log("READ File")
    props.setLolText(text)
  }

  return (
    <div className="firstFrame">
        <Dragger className="dragBox" {...fileProperty} fileList = {files}>
          Drag Your LOL Code File Here
        </Dragger>
        <AceEditor width={"100%"} height={"100%"} showPrintMargin={false} placeholder={"BTW Your code goes here"}/>
    </div>
  )
}

export default FirstFrame
