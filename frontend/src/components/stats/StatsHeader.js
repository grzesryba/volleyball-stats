import React from 'react';
import './stats.css';

function StatsHeader({homeTeam, awayTeam, homeScore, awayScore, date}) {
    return (
        <div className="stats-header">
            <div className="stats-header-content">
                <div className="stats-header-left">
                    <div>
                        <h1 className="stats-header-title">
                            Match Statistics
                        </h1>
                        <p className="stats-header-date">{date}</p>
                    </div>
                </div>
                <div className="stats-header-right">
                    <div className="stats-team-info">
                        <p className="stats-team-label">Home</p>
                        <p className="stats-team-name">{homeTeam}</p>
                    </div>
                    <div className="stats-score-container">
                        <span className="stats-home-score">{homeScore}</span>
                        <span className="stats-score-separator">-</span>
                        <span className="stats-away-score">{awayScore}</span>
                    </div>
                    <div className="stats-team-info">
                        <p className="stats-team-label">Away</p>
                        <p className="stats-team-name">{awayTeam}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StatsHeader;