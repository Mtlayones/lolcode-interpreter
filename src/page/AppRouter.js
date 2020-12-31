import { BrowserRouter, Redirect, Switch, Route } from 'react-router-dom';
import { Interpreter, TitlePage } from '../page';
import React from 'react';

export const AppRouter = () => {
    return(
        <BrowserRouter>
            <Switch>
                <Route exact path={'/home'} component={TitlePage}/>
                <Route exact path={'/interpreter'} component={Interpreter}/>
                <Redirect to="/home" />
            </Switch>   
        </BrowserRouter>
    )
}