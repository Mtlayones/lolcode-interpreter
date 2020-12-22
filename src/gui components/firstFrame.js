import React, { useState } from 'react'
import { Upload } from 'antd'
import 'antd/dist/antd.css';
import '../App.css'
function FirstFrame (props) {
  const { Dragger } = Upload
  const [text, setText] = useState('')
  const [files, setfiles] = useState([])
  const [fileProperty, setFileProperty] = useState({
  name: 'file',
  multiple: false,
  accept : ".lol",
  beforeUpload(file){
    readFile(file)
    return false
  },
  onChange(info){
    handleChange(info)
  },
  onRemove(file){
    setText('')
  }
})
// This Part handle changes in the file (i.e if a file is added)
const handleChange = (info) => {
  let fileList = [...info.fileList];
  fileList = fileList.slice(-1);
  setfiles(fileList)
}
// This part catches the file that is uploaded/dragged to the Upload field
const readFile = async(file) => {
    const text = await file.text()
    setText(text)
  }

  return (
    <div className="firstFrame"> 
      <div className="dragBox">
        <Dragger {...fileProperty} fileList = {files}>
          <p>Drag Your LOL Code File Here</p>
        </Dragger>
      </div>

     <p className="dragBoxContent">{text}</p>
    </div>
  )
}

export default FirstFrame