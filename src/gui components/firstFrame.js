import React, { useState } from 'react'
import { Upload } from 'antd'
import 'antd/dist/antd.css';
import '../App.css'
function FirstFrame (props) {
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
  },
  onRemove(file){
    console.log("REMOVE")
    props.setLolText('')
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

  console.log("First Frame")

  return (
    <div className="firstFrame"> 
      <div className="dragBox">
        <Dragger {...fileProperty} fileList = {files}>
          <p>Drag Your LOL Code File Here</p>
        </Dragger>
      </div>

     <p className="dragBoxContent">{props.lolText}</p>
    </div>
  )
}

export default FirstFrame