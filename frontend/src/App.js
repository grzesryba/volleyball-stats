import React from "react";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Home from "./components/pages/Home";
import Teams from "./components/pages/Teams";
import Matches from "./components/pages/Matches";
import MatchA from "./components/pages/MatchA";
import Match from "./components/pages/Match";

function App() {
    return (
        <Router>
            <div style={{padding: "20px"}}>
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/teams" element={<Teams/>}/>
                    <Route path="/matches" element={<Matches/>}/>
                    <Route path="/matchA" element={<MatchA
                        teamA={{id: 1, name: "Team A"}}
                        teamB={{id: 2, name: "Team B"}}
                        positionsA={{
                            1: {id: 101, number: 5, name: "Jan", surname: "Kowalski"},
                            2: {id: 102, number: 7, name: "Piotr", surname: "Nowak"},
                            3: {id: 103, number: 9, name: "Adam", surname: "X"},
                            4: {id: 104, number: 11, name: "Krzysztof", surname: "Y"},
                            5: {id: 105, number: 2, name: "Łukasz", surname: "Z"},
                            6: {id: 106, number: 4, name: "Mateusz", surname: "W"},
                        }}
                        positionsB={{
                            1: {id: 107, number: 5, name: "Jan", surname: "Kowalski"},
                            2: {id: 108, number: 7, name: "Piotr", surname: "Nowak"},
                            3: {id: 109, number: 9, name: "Adam", surname: "X"},
                            4: {id: 112, number: 11, name: "Krzysztof", surname: "Y"},
                            5: {id: 110, number: 2, name: "Łukasz", surname: "Z"},
                            6: {id: 111, number: 4, name: "Mateusz", surname: "W"},
                        }}
                        startingServerTeamId={1}
                    />}/>

                    <Route path="/match/:id" element={<Match
                        // teamA={{id: 1, name: "Team A"}}
                        // teamB={{id: 2, name: "Team B"}}
                        // positionsA={{
                        //     1: {id: 101, number: 5, name: "Jan", surname: "Kowalski"},
                        //     2: {id: 102, number: 7, name: "Piotr", surname: "Nowak"},
                        //     3: {id: 103, number: 9, name: "Adam", surname: "X"},
                        //     4: {id: 104, number: 11, name: "Krzysztof", surname: "Y"},
                        //     5: {id: 105, number: 2, name: "Łukasz", surname: "Z"},
                        //     6: {id: 106, number: 4, name: "Mateusz", surname: "W"},
                        // }}
                        // positionsB={{
                        //     1: {id: 107, number: 5, name: "Jan", surname: "Kowalski"},
                        //     2: {id: 108, number: 7, name: "Piotr", surname: "Nowak"},
                        //     3: {id: 109, number: 9, name: "Adam", surname: "X"},
                        //     4: {id: 112, number: 11, name: "Krzysztof", surname: "Y"},
                        //     5: {id: 110, number: 2, name: "Łukasz", surname: "Z"},
                        //     6: {id: 111, number: 4, name: "Mateusz", surname: "W"},
                        // }}
                        // startingServerTeamId={1}
                    />}/>
                </Routes>
            </div>
        </Router>
    );
}

export default App;
