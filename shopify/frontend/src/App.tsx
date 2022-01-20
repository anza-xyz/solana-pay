import React from 'react';
import { Switch, Route } from "react-router-dom";
import { Landing } from './components/Landing';
import { PaymentSessionProvider } from './providers/PaymentSessionProvider';
import { Payment } from './components/Payment';

function App() {
    return (
        <PaymentSessionProvider>
            <Switch>
                <Route exact path="/">
                    <Landing />
                </Route>
                <Route exact path="/error">
                    <h1>Some error!</h1>
                </Route>
                <Route exact path="/pay">
                    <Payment />
                </Route>
            </Switch>
        </PaymentSessionProvider>
    );
}

export default App;
