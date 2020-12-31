import React from 'react';
import './TitlePage.css';
import LolCodeIcon from '../etc/img/LolCodeIcon.png'
import { Button, Layout, Image } from 'antd';
import { useHistory } from 'react-router-dom';

export const TitlePage = () => {
    const { Content,Footer } = Layout;
    const history = useHistory();
    return(
        <Layout>
            <Content className="content">
                <div className="content-container" style={{ justifyContent: 'center' }}>
                    <p style={{fontSize: '32px', fontWeight: 'bold'}}><b>LOLCODE<br/>INTERPRETER</b></p>
                </div>
                <div className="content-container" style={{ justifyContent: 'center' }}>
                    <Image src={LolCodeIcon}/>
                    <Button className="startButton" type="primary" shape="round" onClick = {()=>{history.push('/interpreter')}}> Start </Button>
                </div>
                <div className="content-container" style={{ justifyContent: 'center' }}>
                    <p style={{fontSize: '32px', fontWeight: 'bold'}}><b>BY<br/>UTOTCODE</b></p>
                </div>
            </Content>
            <Footer className="footer">
                <b>LOLCODE Interpreter © 2020 Created by UTOTCODE</b><br/><b>UTOTCODE MEMBERS: Carl Joshua Fabregas, Mark Adrian Layones and Paulo Rodriguez</b>
            </Footer>
        </Layout>
    );
}