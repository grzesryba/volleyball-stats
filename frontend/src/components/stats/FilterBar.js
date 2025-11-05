import React, {useState} from 'react';
import './stats.css';

function FilterBar({
                       selectedSet,
                       setSelectedSet,
                       selectedPlayer,
                       setSelectedPlayer,
                       selectedElement,
                       setSelectedElement,
                       setsIds,
                       points
                   }) {
    const [isSetOpen, setIsSetOpen] = useState(false);
    const [isPlayerOpen, setIsPlayerOpen] = useState(false);
    const [isElementOpen, setIsElementOpen] = useState(false);

    const players = [
        "All Players",
        ...Array.from(
            new Set(points.map(p => `#${p[3]}  ${p[4]} ${p[5]}`))
        ),
    ];

    const gameElements = ["Wszystkie elementy", "Zagrywka", "Przyjęcie", "Atak", "Obrona", "Blok", "Dogranie"];

    console.log(setsIds)
    const sets = [
        {value: "all", label: "Cały mecz"},
        ...setsIds
            .sort((a, b) => a - b)
            .map((setId, index) => ({
                value: setId,
                label: `Set ${index + 1}`
            }))
    ];


    const getSetLabel = (value) => {
        const set = sets.find(s => s.value === value);
        return set ? set.label : "Whole Match";
    };

    return (
        <div className="stats-filter-bar">
            <div className="stats-filter-controls">
                <div className="stats-filter-group">
                    <label className="stats-filter-label">Set</label>
                    <div className="stats-dropdown">
                        <button
                            className="stats-dropdown-trigger"
                            onClick={() => setIsSetOpen(!isSetOpen)}
                        >
                            <span>{getSetLabel(selectedSet)}</span>
                            <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
                                <path d="M4 6H11L7.5 10.5L4 6Z"></path>
                            </svg>
                        </button>
                        {isSetOpen && (
                            <div className="stats-dropdown-content">
                                {sets.map((set) => (
                                    <div
                                        key={set.value}
                                        className={`stats-dropdown-item ${selectedSet === set.value ? 'active' : ''}`}
                                        onClick={() => {
                                            setSelectedSet(set.value);
                                            setIsSetOpen(false);
                                        }}
                                    >
                                        {set.label}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="stats-filter-group">
                    <label className="stats-filter-label">Player</label>
                    <div className="stats-dropdown">
                        <button
                            className="stats-dropdown-trigger"
                            onClick={() => setIsPlayerOpen(!isPlayerOpen)}
                        >
                            <span>{selectedPlayer}</span>
                            <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
                                <path d="M4 6H11L7.5 10.5L4 6Z"></path>
                            </svg>
                        </button>
                        {isPlayerOpen && (
                            <div className="stats-dropdown-content">
                                {players.map((player) => (
                                    <div
                                        key={player}
                                        className={`stats-dropdown-item ${selectedPlayer === player ? 'active' : ''}`}
                                        onClick={() => {
                                            setSelectedPlayer(player);
                                            setIsPlayerOpen(false);
                                        }}
                                    >
                                        {player}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="stats-filter-group">
                    <label className="stats-filter-label">Game Element</label>
                    <div className="stats-dropdown">
                        <button
                            className="stats-dropdown-trigger"
                            onClick={() => setIsElementOpen(!isElementOpen)}
                        >
                            <span>{selectedElement}</span>
                            <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
                                <path d="M4 6H11L7.5 10.5L4 6Z"></path>
                            </svg>
                        </button>
                        {isElementOpen && (
                            <div className="stats-dropdown-content">
                                {gameElements.map((element) => (
                                    <div
                                        key={element}
                                        className={`stats-dropdown-item ${selectedElement === element ? 'active' : ''}`}
                                        onClick={() => {
                                            setSelectedElement(element);
                                            setIsElementOpen(false);
                                        }}
                                    >
                                        {element}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FilterBar;