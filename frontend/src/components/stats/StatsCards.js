import React from 'react';
import './stats.css';


const StatCard = ({title, value, subtitle, icon, trend}) => (
    <div className="stats-stat-card">
        <div className="stats-stat-content">
            <div className="stats-stat-text">
                <p className="stats-stat-title">{title}</p>
                <p className="stats-stat-value">{value}</p>
                <p className="stats-stat-subtitle">{subtitle}</p>
            </div>
        </div>
    </div>
);

function StatsCards({selectedElement, selectedSet, points}) {
    const getStats = () => {
        const calculateEfficiency = (data) => {
            const allSituations = data.length;
            const totalErrors = data.filter(x => x[7] === "=").length;
            return allSituations > 0
                ? ((data.filter(x => x[7] === "#").length + totalErrors) / allSituations * 100).toFixed(2)
                : 0;
        }

        const filteredPoints = selectedSet !== "all"
            ? points.filter(p => p[1] === selectedSet)
            : points;

        const filteredByElement = selectedElement !== "Wszystkie elementy"
            ? filteredPoints.filter(p => p[6] === selectedElement)
            : filteredPoints;

        const countBySymbol = (data, symbol) => data.filter(x => x[7] === symbol).length;


        switch (selectedElement) {
            case "Atak":
                return [
                    {
                        title: "Point Attacks",
                        value: countBySymbol(filteredByElement, "#"),
                        subtitle: "Scored attacks"
                    },
                    {
                        title: "Defended",
                        value: countBySymbol(filteredByElement, "+") +
                            countBySymbol(filteredByElement, "!") +
                            countBySymbol(filteredByElement, "-"),
                        subtitle: "Opponent defended"
                    },
                    {
                        title: "Blocked/Errors",
                        value: countBySymbol(filteredByElement, "/") +
                            countBySymbol(filteredByElement, "="),
                        subtitle: "Unsuccessful"
                    },
                ];
            case "Zagrywka":
                return [
                    {
                        title: "Aces",
                        value: countBySymbol(filteredByElement, "#"),
                        subtitle: "Point serves"
                    },
                    {
                        title: "Opponent Bad Reception",
                        value: countBySymbol(filteredByElement, "+") + countBySymbol(filteredByElement, "!"),
                        subtitle: "Pressure serves"
                    },
                    {
                        title: "Errors",
                        value: countBySymbol(filteredByElement, "="),
                        subtitle: "Service errors"
                    },
                ];
            case "Blok":
                return [
                    {
                        title: "Point Blocks",
                        value: countBySymbol(filteredByElement, "#"),
                        subtitle: "Direct block points"
                    },
                    {
                        title: "Touches",
                        value: countBySymbol(filteredByElement, "+") + countBySymbol(filteredByElement, "!"),
                        subtitle: "Secured blocks"
                    },
                    {
                        title: "Errors",
                        value: countBySymbol(filteredByElement, "/") + countBySymbol(filteredByElement, "="),
                        subtitle: "Block out / net touch"
                    },
                ];
            case "Przyjęcie":
                return [
                    {
                        title: "Perfect Reception",
                        value: countBySymbol(filteredByElement, "#"),
                        subtitle: "Ideal pass"
                    },
                    {
                        title: "Good Reception",
                        value: countBySymbol(filteredByElement, "+"),
                        subtitle: "Playable pass"
                    },
                    {
                        title: "Errors",
                        value: countBySymbol(filteredByElement, "="),
                        subtitle: "Reception errors"
                    },
                ];
            case "Obrona":
                return [
                    {
                        title: "Perfect Defense",
                        value: countBySymbol(filteredByElement, "#"),
                        subtitle: "Perfect dig"
                    },
                    {
                        title: "Good Defense",
                        value: countBySymbol(filteredByElement, "+"),
                        subtitle: "Playable dig"
                    },
                    {
                        title: "Errors",
                        value: countBySymbol(filteredByElement, "="),
                        subtitle: "Failed defense"
                    },
                ];
            default:
                return [
                    {
                        title: "Total Actions",
                        value: filteredByElement.length,
                        subtitle: "All recorded actions"
                    },
                    {
                        title: "Efficiency",
                        value: `${calculateEfficiency(filteredByElement)}%`,
                        subtitle: "Overall performance"
                    },
                    {
                        title: "Errors",
                        value: countBySymbol(filteredByElement, "="),
                        subtitle: "Total errors"
                    },
                ];
        }
    };

    const stats = getStats();

    return (
        <div className="stats-cards-grid">
            {stats.map((stat, index) => (
                <StatCard key={index} {...stat}/>
            ))}
        </div>
    );
}

export default StatsCards;