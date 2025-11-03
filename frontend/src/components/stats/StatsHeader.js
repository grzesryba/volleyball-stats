import React from 'react';
import './stats.css';

function StatsHeader({homeTeam, awayTeam, homeScore, awayScore, date}) {
    return (
        <div className="stats-header">
            <div className="header-content">
                <div className="header-left">
                    <div>
                        <h1 className="header-title">
                            Match Statistics
                        </h1>
                        <p className="header-date">{date}</p>
                    </div>
                </div>
                <div className="header-right">
                    <div className="team-info">
                        <p className="team-label">Home</p>
                        <p className="team-name">{homeTeam}</p>
                    </div>
                    <div className="score-container">
                        <span className="home-score">{homeScore}</span>
                        <span className="score-separator">-</span>
                        <span className="away-score">{awayScore}</span>
                    </div>
                    <div className="team-info">
                        <p className="team-label">Away</p>
                        <p className="team-name">{awayTeam}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StatsHeader;