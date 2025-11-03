import React from 'react';
import './stats.css';

function DetailedStatsTable({selectedElement, selectedSet, points}) {
    const getTableData = () => {
        const isFiltered = selectedSet !== "all";

        const filteredPoints = isFiltered
            ? points.filter(p => p[1] === selectedSet)
            : points;


        const countBySymbol = (data, symbol) => data.filter(x => x[7] === symbol).length;

        const successRate = (data, el) => {
            if (el === "Błąd przeciwnika" || el === "Nietypowy błąd") {
                const total = filteredPoints.length;
                const cnt = data.length;
                const rate = cnt / total * 100;
                return `${rate.toFixed(1)}%`;
            }
            const total = data.length;
            if (total === 0) return "0%";
            const positive = countBySymbol(data, "#") + countBySymbol(data, "+");
            const negative = countBySymbol(data, "=") + countBySymbol(data, "/");
            const rate = ((positive - negative) / total) * 100;
            return `${rate.toFixed(1)}%`;
        };

        const getQualityFromRate = (rate, el) => {
            if (el==="Błąd przeciwnika") {
                return "neutral"
            }
            if(el === "Nietypowy błąd"){
                return "error"
            }
            const value = parseFloat(rate.replace('%', ''));
            if (isNaN(value)) return "neutral";
            if (value >= 80) return "perfect";
            if (value >= 70) return "great";
            if (value >= 55) return "good";
            if (value >= 40) return "bad";
            return "terrible";
        };


        if (selectedElement && selectedElement !== "Wszystkie elementy") {
            const filteredByElement = filteredPoints.filter(p => p[6] === selectedElement);
            const total = filteredByElement.length || 1;

            const createRows = (element) => {
                switch (element) {
                    case "Zagrywka":
                        return [
                            {outcome: "Punktowa (#)", symbol: "#", quality: "success"},
                            {outcome: "Złe przyjęcie przeciwnika (+ / !)", symbols: ["+", "!"], quality: "good"},
                            {outcome: "Dobre przyjęcie (-)", symbol: "-", quality: "neutral"},
                            {outcome: "Przyjęcie na drugą stronę (/)", symbol: "/", quality: "error"},
                            {outcome: "Błąd serwisowy (=)", symbol: "=", quality: "error"},
                        ];
                    case "Atak":
                        return [
                            {outcome: "Punktowy (#)", symbol: "#", quality: "success"},
                            {outcome: "Obroniony (+)", symbol: "+", quality: "good"},
                            {outcome: "Blok wyasekurowany (!)", symbol: "!", quality: "neutral"},
                            {outcome: "Zablokowany (/)", symbol: "/", quality: "error"},
                            {outcome: "Błąd (=)", symbol: "=", quality: "error"},
                        ];
                    case "Obrona":
                        return [
                            {outcome: "Perfekcyjna (#)", symbol: "#", quality: "success"},
                            {outcome: "Dobra (+)", symbol: "+", quality: "good"},
                            {outcome: "Zła (-)", symbol: "-", quality: "error"},
                            {outcome: "Błąd (=)", symbol: "=", quality: "error"},
                        ];
                    case "Blok":
                        return [
                            {outcome: "Punktowy (#)", symbol: "#", quality: "success"},
                            {outcome: "Wyblokowany (+)", symbol: "+", quality: "good"},
                            {outcome: "Wyasekurowany (!)", symbol: "!", quality: "neutral"},
                            {outcome: "Dotknięcie siatki (/)", symbol: "/", quality: "error"},
                            {outcome: "Błąd / blok obity (=)", symbol: "=", quality: "error"},
                        ];
                    case "Przyjęcie":
                        return [
                            {outcome: "Perfekcyjne (#)", symbol: "#", quality: "success"},
                            {outcome: "Dobre (+)", symbol: "+", quality: "good"},
                            {outcome: "Złe (-)", symbol: "-", quality: "error"},
                            {outcome: "Na drugą stronę (/)", symbol: "/", quality: "error"},
                            {outcome: "Błąd (=)", symbol: "=", quality: "error"},
                        ];
                    default:
                        return [
                            {outcome: "Punkt przeciwnika (x)", symbol: "x", quality: "error"},
                            {outcome: "Nietypowy błąd (?)", symbol: "?", quality: "error"},
                        ];
                }
            };

            const rowsDef = createRows(selectedElement);
            const rows = rowsDef.map(r => {
                const count = r.symbols
                    ? r.symbols.reduce((sum, s) => sum + countBySymbol(filteredByElement, s), 0)
                    : countBySymbol(filteredByElement, r.symbol);
                const percentage = ((count / total) * 100).toFixed(1) + "%";
                return {...r, count, percentage};
            });

            return {
                headers: ["Outcome", "Count", "Percentage", "Quality"],
                rows,
            };
        }


        const elements = ["Zagrywka", "Atak", "Obrona", "Blok", "Przyjęcie", "Błąd przeciwnika", "Nietypowy błąd"];
        const rows = elements.map(el => {
            const data = filteredPoints.filter(p => p[6] === el);
            const rate = successRate(data, el);
            return {
                outcome: el,
                count: data.length,
                percentage: rate,
                quality: getQualityFromRate(rate, el)
            };
        });

        return {
            headers: ["Action Type", "Count", "Success Rate", "Quality"],
            rows,
        };
    };

    const getQualityBadge = (quality) => {
        switch (quality) {
            case "success":
            case "perfect":
                return <span className="badge success">{quality}</span>;
            case "great":
            case "good":
                return <span className="badge good">{quality}</span>;
            case "bad":
                return <span className="badge bad">{quality}</span>;
            case "terrible":
            case "error":
                return <span className="badge error">{quality}</span>;
            default:
                return <span className="badge neutral">Neutral</span>;
        }
    };

    const tableData = getTableData();

    return (
        <div className="detailed-stats-table">
            <h3 className="table-title">
                {selectedElement === "All Elements" ? "Action Summary" : `${selectedElement} Detailed Breakdown`}
            </h3>
            <div className="table-container">
                <table className="stats-table">
                    <thead>
                    <tr className="table-header">
                        {tableData.headers.map((header, index) => (
                            <th key={index} className="table-head">{header}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {tableData.rows.map((row, index) => (
                        <tr key={index} className="table-row">
                            <td className="table-cell outcome">{row.outcome}</td>
                            <td className="table-cell">{row.count}</td>
                            <td className="table-cell">{row.percentage}</td>
                            <td className="table-cell">{getQualityBadge(row.quality)}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default DetailedStatsTable;