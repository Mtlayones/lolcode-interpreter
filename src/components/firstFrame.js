import React, { useState, useEffect } from 'react';
import { Upload } from 'antd';
import AceEditor from 'react-ace';
import 'antd/dist/antd.css';
import '../main/App.css';
import "ace-builds/src-noconflict/theme-github";

export const FirstFrame = ({ lolText, setLolText}) => {
  // Dragger is the file uploader above
  const [localLolText,setLocalLolText] = useState('');
  const { Dragger } = Upload;
  const [files, setfiles] = useState([]);
  const [fileProperty] = useState(
    {
      name: 'file',
      multiple: false,
      accept : ".lol",
      beforeUpload(file){
        readFile(file);
        return false;
      },
      onChange(info){
        handleChange(info);
      }
    }
  );

// This Part handle changes in the file (i.e if a file is added)
const handleChange = (info) => {
  setfiles([...info.fileList].slice(-1));
}

// This part catches the file that is uploaded/dragged to the Upload field
const readFile = async(file) => {
    setLocalLolText(await file.text());
}

// If the button is clicked we set the main lol text which signals the second frame to parse the data
useEffect(() => {
  setLolText(localLolText)
},[localLolText])

  return (
    <div className="firstFrame">
        <Dragger className="dragBox" {...fileProperty} fileList = {files} showUploadList={false}>
          <p style={{color:'white'}}>Drag Your LOL Code File Here</p>
        </Dragger>
        <AceEditor mode={"null"} theme={"github"} width={"100%"} height={"100%"} showPrintMargin={false} placeholder={"BTW Your code goes here"} value = {localLolText} onChange ={(value)=>{setLocalLolText(value)}}/>
    </div>
  )
}
