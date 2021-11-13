import React from "react";
import {Container, Jumbotron} from "react-bootstrap";
import {useDebugStatusAPI} from "../api";
import {Link} from "react-router-dom";


export const HomePage = () => {
    const { data: debugStatus } = useDebugStatusAPI()

    const username = debugStatus && debugStatus.user && debugStatus.user.username;

    return <Container>
        <Jumbotron>
            Welcome,
            { username ?
                <p>You are currently logged in as <b>{username}</b></p>:
                <p>Please <Link to="/login">login or register</Link></p>
            }

        </Jumbotron>
    </Container>
}