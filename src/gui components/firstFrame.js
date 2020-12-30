import React, { useState,useRef,useEffect } from 'react';
import { Upload } from 'antd';
import 'antd/dist/antd.css';
import '../App.css';
import AceEditor from 'react-ace';
import "ace-builds/src-noconflict/theme-github";

function FirstFrame (props) {
  // Dragger is the file uploader above
  const isInitialMountFirstFrame = useRef(true)
  const [localLolText,setLocalLolText] = useState(props.lolText)
  const { Dragger } = Upload
  const [files, setfiles] = useState([])
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

const onChange = (newValue) => {
  setLocalLolText(newValue)
}

// This part catches the file that is uploaded/dragged to the Upload field
const readFile = async(file) => {
    const text = await file.text()
    console.log("READ File")
    setLocalLolText(text)
}

// If the button is clicked we set the main lol text which signals the second frame to parse the data
useEffect(() => {
  if(isInitialMountFirstFrame.current){
    isInitialMountFirstFrame.current = false
  }else{
    props.setLolText(localLolText)
    console.log("CHANGING THE VALUE OF LOL TEXT")
  }
},[props.buttonClickCount])

console.log("FIRST FRAME HERE")

  return (
    <div className="firstFrame">
        <Dragger className="dragBox" {...fileProperty} fileList = {files} showUploadList={false}>
          Drag Your LOL Code File Here
        </Dragger>
        <AceEditor mode={"null"} theme={"github"} width={"100%"} height={"100%"} showPrintMargin={false} placeholder={"BTW Your code goes here"} value = {localLolText} onChange ={onChange}/>
    </div>
  )
}

export default FirstFrame
