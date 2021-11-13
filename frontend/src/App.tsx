import React from 'react';
import {BrowserRouter as Router, Switch, Route, Link} from "react-router-dom";

import styled from "styled-components";
import {HomePage} from "./pages/HomePage"
import {Nav, Navbar, Container} from "react-bootstrap";

import 'bootstrap/dist/css/bootstrap.min.css';

const AppContainer = styled.div`
  padding: 4em 0em;
`;

function App() {
    return (
        <div className="App">
            <Router>
                <Navbar bg="light" variant="light">
                    <Nav className="mr-auto">
                        <Link className="nav-link" to="/">Home</Link>
                    </Nav>
                </Navbar>

                <AppContainer>
                    <Switch>
                        <Route path="/">
                            <HomePage />
                        </Route>
                    </Switch>
                </AppContainer>
            </Router>
        </div>
    );
}

export default App;
