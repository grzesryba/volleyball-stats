import React from "react";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Home from "./components/pages/Home";
import Teams from "./components/pages/Teams";
import Matches from "./components/pages/Matches";
import Match from "./components/pages/Match";
import MatchStats from "./components/stats/MatchStats";

function App() {
    return (
        <Router>
            <div style={{padding: "20px"}}>
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/teams" element={<Teams/>}/>
                    <Route path="/matches" element={<Matches/>}/>
                    <Route path="/match/:id" element={<Match/>}/>
                    <Route path="stats/:id" element={<MatchStats/>}/>
                </Routes>
            </div>
        </Router>
    );
}

export default App;
