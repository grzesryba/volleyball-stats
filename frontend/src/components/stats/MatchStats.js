import React, {useEffect, useState} from 'react';
import StatsHeader from './StatsHeader';
import FilterBar from './FilterBar';
import StatsCards from './StatsCards';
import DetailedStatsTable from './DetailedStatsTable';
import PlayerComparisonTable from './PlayerComparisonTable';
import {useParams} from "react-router-dom";
import './stats.css';

function MatchStats() {
    const {id} = useParams();

    const [selectedSet, setSelectedSet] = useState("all");
    const [selectedPlayer, setSelectedPlayer] = useState("All Players");
    const [selectedElement, setSelectedElement] = useState("Wszystkie elementy");

    const [points, setPoints] = useState([])
    const [teamName, setTeamName] = useState("")
    const [matchDate, setMatchDate] = useState(null)
    const [ASets, setASets] = useState(0)
    const [BSets, setBSets] = useState(0)
    const [setsIds, setSetsIds] = useState([])

    const fetchPointsSituations = async () => {
        try {
            const res = await fetch(`/api/stats/match/${id}`);
            const data = await res.json();
            setPoints(data)
            console.log(data)
        } catch (err) {
            console.error("error while getting points", err);
        }
    };

    const fetchMatchInfo = async () => {
        try {
            const res = await fetch(`/api/match/${id}/info`);
            const data = await res.json();
            setTeamName(data.name)
            setMatchDate(data.date)
            setASets(data.A_winner)
            setBSets(data.B_winner)
        } catch (err) {
            console.error("error while team name", err);
        }
    };

    const fetchSets = async () => {
        try {
            const res = await fetch(`/api/match/${id}/sets`);
            const data = await res.json();
            if (res.ok && data) {
                setSetsIds(data)
            }
        } catch (err) {
            console.error("error while getting sets", err);
        }
    };


    useEffect(() => {
        fetchPointsSituations()
        fetchMatchInfo()
        fetchSets()
    }, [])

    return (
        <body className="stats-body">
        <div className="stats-root stats-min-h-screen stats-bg-background stats-p-6">
            <div className="stats-max-w-7xl stats-mx-auto">
                <StatsHeader
                    homeTeam={teamName}
                    awayTeam="Opponents"
                    homeScore={ASets}
                    awayScore={BSets}
                    date={matchDate}
                />

                <FilterBar
                    selectedSet={selectedSet}
                    setSelectedSet={setSelectedSet}
                    selectedPlayer={selectedPlayer}
                    setSelectedPlayer={setSelectedPlayer}
                    selectedElement={selectedElement}
                    setSelectedElement={setSelectedElement}
                    setsIds={setsIds}
                    points={points}
                />

                {selectedPlayer === "All Players" ? (
                    <>
                        <StatsCards
                            selectedElement={selectedElement}
                            selectedSet={selectedSet}
                            selectedPlayer={selectedPlayer}
                            points={points}
                        />

                        <DetailedStatsTable
                            selectedElement={selectedElement}
                            selectedSet={selectedSet}
                            points={points}
                        />
                    </>
                ) : null}

                <PlayerComparisonTable
                    selectedPlayer={selectedPlayer}
                    points={points}
                />
            </div>
        </div>
        </body>
    );
}

export default MatchStats;