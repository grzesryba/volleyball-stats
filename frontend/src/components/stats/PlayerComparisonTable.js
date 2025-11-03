import React from 'react';
import './stats.css';

function PlayerComparisonTable({selectedPlayer, points}) {

    const players = [...new Set(points.map(p => p[4] + ' ' + p[5]))];

    console.log(selectedPlayer)

    if (selectedPlayer === "All Players") {
        const playerStats = players.map(playerName => {
            const playerPoints = points.filter(p => `${p[4]} ${p[5]}` === playerName);
            const attacks = playerPoints.filter(p => p[6] === "Atak").length;
            const serves = playerPoints.filter(p => p[6] === "Zagrywka").length;
            const blocks = playerPoints.filter(p => p[6] === "Blok").length;
            const digs = playerPoints.filter(p => p[6] === "Obrona").length;
            const receptions = playerPoints.filter(p => p[6] === "Przyjęcie").length;

            const total = playerPoints.length;
            const positive = playerPoints.filter(p => p[7] === "#" || p[7] === "+").length;
            const negative = playerPoints.filter(p => p[7] === "=" || p[7] === "/").length;
            const efficiency = total > 0 ? ((positive - negative) / total * 100).toFixed(1) : 0;

            return {name: playerName, attacks, serves, blocks, digs, receptions, efficiency};
        });

        return (
            <div className="player-comparison-table">
                <h3 className="table-title">Player Performance Comparison</h3>
                <div className="table-container">
                    <table className="stats-table">
                        <thead>
                        <tr className="table-header">
                            <th className="table-head">Player</th>
                            <th className="table-head text-center">Attacks</th>
                            <th className="table-head text-center">Serves</th>
                            <th className="table-head text-center">Blocks</th>
                            <th className="table-head text-center">Digs</th>
                            <th className="table-head text-center">Receptions</th>
                            <th className="table-head">Efficiency</th>
                        </tr>
                        </thead>
                        <tbody>
                        {playerStats.map((player, index) => (
                            <tr key={index} className="table-row">
                                <td className="table-cell player-name">{player.name}</td>
                                <td className="table-cell text-center">{player.attacks}</td>
                                <td className="table-cell text-center">{player.serves}</td>
                                <td className="table-cell text-center">{player.blocks}</td>
                                <td className="table-cell text-center">{player.digs}</td>
                                <td className="table-cell text-center">{player.receptions}</td>
                                <td className="table-cell">
                                    <div className="efficiency-display">
                                        <div className="progress-bar-container">
                                            <div
                                                className="progress-bar-fill"
                                                style={{width: `${player.efficiency}%`}}
                                            ></div>
                                        </div>
                                        <span className="efficiency-text">{player.efficiency}%</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    const playerPoints = points.filter(p => `#${p[3]}  ${p[4]} ${p[5]}` === selectedPlayer);

    const groupedByElement = playerPoints.filter(p => p[7] !== "x" && p[7] !== "?").reduce((acc, p) => {
        const el = p[6];
        if (!acc[el]) acc[el] = [];
        acc[el].push(p);
        return acc;
    }, {});

    const calcEfficiency = (data) => {
        const total = data.length;
        const positive = data.filter(x => x[7] === "#" || x[7] === "+").length;
        const negative = data.filter(x => x[7] === "=" || x[7] === "/").length;
        return total > 0 ? ((positive - negative) / total * 100).toFixed(1) : 0;
    };

    const stats = Object.entries(groupedByElement).map(([el, data]) => {
        const total = data.length;
        const efficiency = calcEfficiency(data);

        const symbols = data.reduce((acc, p) => {
            const sym = p[7];
            if (!acc[sym]) acc[sym] = 0;
            acc[sym]++;
            return acc;
        }, {});

        const symbolStats = Object.entries(symbols).map(([sym, count]) => {
            const percentage = ((count / total) * 100).toFixed(1);
            return {symbol: sym, count, percentage};
        }).sort((a, b) => b.count - a.count);

        return {element: el, count: total, efficiency, symbolStats};
    });

    const sortedStats = stats.sort((a, b) => b.count - a.count);

    return (
        <div className="player-comparison-table">
            <h3 className="table-title">Detailed Breakdown – {selectedPlayer}</h3>
            <div className="table-container">
                <table className="stats-table">
                    <thead>
                    <tr className="table-header">
                        <th className="table-head">Action Type</th>
                        <th className="table-head text-center">Count</th>
                        <th className="table-head">Efficiency</th>
                        <th className="table-head">Details by Symbol</th>
                    </tr>
                    </thead>
                    <tbody>
                    {sortedStats.map((row, index) => (
                        <tr key={index} className="table-row">
                            <td className="table-cell">{row.element}</td>
                            <td className="table-cell text-center">{row.count}</td>
                            <td className="table-cell">
                                <div className="efficiency-display">
                                    <div className="progress-bar-container">
                                        <div
                                            className="progress-bar-fill"
                                            style={{width: `${row.efficiency}%`}}
                                        ></div>
                                    </div>
                                    <span className="efficiency-text">{row.efficiency}%</span>
                                </div>
                            </td>
                            <td className="table-cell">
                                <div className="symbol-breakdown">
                                    {row.symbolStats.map((s, i) => (
                                        <div key={i} className="symbol-item">
                                            <span className="symbol-char">{s.symbol}</span>
                                            <span className="symbol-count">{s.count}</span>
                                            <span className="symbol-percent">({s.percentage}%)</span>
                                        </div>
                                    ))}
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

}

export default PlayerComparisonTable;
