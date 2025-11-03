import React from 'react';
import './styles/new_match_config_window.css'

function CourtSetup({players, positions, liberoId, assignPlayerToZone, title = "Ustawienie początkowe"}) {

    return (
        <div className="courtWrapper">
            <h3>Ustawienie początkowe</h3>
            <div className="courtGrid">
                {[4, 3, 2, 5, 6, 1].map((zone) => {
                    // id zawodników przypisanych do innych stref (bez bieżącej strefy)
                    const assignedPlayerIds = Object.values(positions)
                        .filter((p) => p && p.id !== positions[zone]?.id)
                        .map((p) => p.id);

                    // zablokuj także przypisanie zawodnika będącego libero
                    if (liberoId && liberoId !== positions[zone]?.id) {
                        assignedPlayerIds.push(liberoId);
                    }

                    return (
                        <div key={zone} className="courtCell">
                            <strong>{zone}</strong>
                            <select
                                value={positions[zone]?.id ?? ""}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (!val) {
                                        assignPlayerToZone(zone, null);
                                        return;
                                    }
                                    const player = players.find((pl) => pl.id === parseInt(val, 10));
                                    assignPlayerToZone(zone, player || null);
                                }}
                            >
                                <option value="">--</option>
                                {players
                                    .filter((p) => !assignedPlayerIds.includes(p.id))
                                    .map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.number}. {p.name} {p.surname}
                                        </option>
                                    ))}
                            </select>
                        </div>
                    );
                })}
            </div>
        </div>
    )
}

export default CourtSetup;