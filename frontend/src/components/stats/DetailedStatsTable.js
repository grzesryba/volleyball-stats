import React from 'react';
import './stats.css';

function DetailedStatsTable({ selectedElement, selectedSet, points }) {
    const getTableData = () => {
        const isFiltered = selectedSet !== "all";
        const filteredPoints = isFiltered ? points.filter(p => p[1] === selectedSet) : points;

        const calcEfficiency = (data) => {
            const total = data.length;
            const positive = data.filter(x => x[7] === "#" || x[7] === "+").length;
            const negative = data.filter(x => x[7] === "=" || x[7] === "/").length;
            return total > 0 ? ((positive - negative) / total * 100).toFixed(1) : 0;
        };

        const getQualityFromRate = (rate) => {
            const value = parseFloat(rate);
            if (isNaN(value)) return "neutral";
            if (value >= 80) return "perfect";
            if (value >= 70) return "great";
            if (value >= 55) return "good";
            if (value >= 40) return "bad";
            return "terrible";
        };

        const elements = [
            "Atak", "Zagrywka", "Blok", "Przyjęcie", "Obrona", "Dogranie",
            "Błąd przeciwnika", "Nietypowy błąd"
        ];

        const relevantElements =
            selectedElement && selectedElement !== "Wszystkie elementy"
                ? [selectedElement]
                : elements;

        return relevantElements.map(el => {
            const data = filteredPoints.filter(p => p[6] === el);
            const total = data.length;
            const efficiency = calcEfficiency(data);
            const quality = getQualityFromRate(efficiency);

            // policz wystąpienia symboli
            const symbols = data.reduce((acc, p) => {
                const sym = p[7];
                if (!acc[sym]) acc[sym] = 0;
                acc[sym]++;
                return acc;
            }, {});

            const symbolStats = Object.entries(symbols).map(([sym, count]) => {
                const percentage = ((count / total) * 100).toFixed(1);
                return { symbol: sym, count, percentage };
            }).sort((a, b) => b.count - a.count);

            return {
                action: el,
                count: total,
                efficiency,
                quality,
                symbolStats
            };
        }).filter(row => row.count > 0);
    };

    const tableData = getTableData();

    const getBadgeClass = (quality) => {
        switch (quality) {
            case "perfect": return "stats-badge success";
            case "great": return "stats-badge good";
            case "good": return "stats-badge neutral";
            case "bad": return "stats-badge bad";
            case "terrible": return "stats-badge error";
            default: return "stats-badge neutral";
        }
    };

    const getBadgeText = (quality) => {
        switch (quality) {
            case "perfect": return "Perfect";
            case "great": return "Great";
            case "good": return "Good";
            case "bad": return "Poor";
            case "terrible": return "Terrible";
            default: return "Neutral";
        }
    };

    return (
        <div className="stats-detailed-stats-table">
            <h3 className="stats-table-title">Detailed Statistics</h3>
            <div className="stats-table-container">
                <table className="stats-stats-table">
                    <thead>
                    <tr className="stats-table-header">
                        <th className="stats-table-head">Action</th>
                        <th className="stats-table-head stats-text-center">Count</th>
                        <th className="stats-table-head">Efficiency</th>
                        <th className="stats-table-head">Details by Symbol</th>
                        <th className="stats-table-head">Quality</th>
                    </tr>
                    </thead>
                    <tbody>
                    {tableData.map((row, index) => (
                        <tr key={index} className="stats-table-row">
                            <td className="stats-table-cell">{row.action}</td>
                            <td className="stats-table-cell stats-text-center">{row.count}</td>
                            <td className="stats-table-cell">
                                <div className="stats-efficiency-display">
                                    <div className="stats-progress-bar-container">
                                        <div
                                            className="stats-progress-bar-fill"
                                            style={{ width: `${row.efficiency}%` }}
                                        ></div>
                                    </div>
                                    <span className="stats-efficiency-text">{row.efficiency}%</span>
                                </div>
                            </td>
                            <td className="stats-table-cell">
                                <div className="stats-symbol-breakdown">
                                    {row.symbolStats.map((s, i) => (
                                        <div key={i} className="stats-symbol-item">
                                            <span className="stats-symbol-char">{s.symbol}</span>
                                            <span className="stats-symbol-count">{s.count}</span>
                                            <span className="stats-symbol-percent">({s.percentage}%)</span>
                                        </div>
                                    ))}
                                </div>
                            </td>
                            <td className="stats-table-cell">
                                <span className={getBadgeClass(row.quality)}>
                                    {getBadgeText(row.quality)}
                                </span>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default DetailedStatsTable;
