import React from 'react';
import './styles/new_match_config_window.css';

function LiberoConfig({
                          players,
                          positions,
                          liberoId,
                          setLiberoId,
                          liberoPartner1Id,
                          setLiberoPartner1Id,
                          liberoPartner2Id,
                          setLiberoPartner2Id,
                          setterPosition,
                          setSetterPosition,
                          playersOnCourtIds,
                      }) {
    return (
        <div className="libero-config">
            <h3>Libero i rozgrywający</h3>

            <div className="libero-row">
                <div className="form-group">
                    <label>Wybierz libero:</label>
                    <select
                        value={liberoId ?? ""}
                        onChange={(e) => setLiberoId(e.target.value ? parseInt(e.target.value, 10) : null)}
                    >
                        <option value="">-- brak --</option>
                        {players
                            .filter(p => !playersOnCourtIds.includes(p.id))
                            .map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.number}. {p.name} {p.surname}
                                </option>
                            ))}
                    </select>
                </div>
            </div>

            <div className="libero-row">
                <div className="form-group">
                    <label>Partnerzy libero (zmiany):</label>
                    <div className="partners-container">
                        <div className="partner-item">
                            <label>1 do zmiany</label>
                            <select
                                value={liberoPartner1Id ?? ""}
                                onChange={(e) => setLiberoPartner1Id(e.target.value ? parseInt(e.target.value, 10) : null)}
                            >
                                <option value="">-- brak --</option>
                                {Object.values(positions)
                                    .filter(p => p && p.id !== liberoPartner2Id)
                                    .map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.number}. {p.name} {p.surname}
                                        </option>
                                    ))}
                            </select>
                        </div>
                        <div className="partner-item">
                            <label>2 do zmiany</label>
                            <select
                                value={liberoPartner2Id ?? ""}
                                onChange={(e) => setLiberoPartner2Id(e.target.value ? parseInt(e.target.value, 10) : null)}
                            >
                                <option value="">-- brak --</option>
                                {Object.values(positions)
                                    .filter(p => p && p.id !== liberoPartner1Id)
                                    .map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.number}. {p.name} {p.surname}
                                        </option>
                                    ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="libero-row">
                <div className="form-group">
                    <label>Pozycja rozgrywającego:</label>
                    <select
                        value={setterPosition ?? ""}
                        onChange={(e) => setSetterPosition(e.target.value ? parseInt(e.target.value, 10) : null)}
                    >
                        <option value="">-- brak --</option>
                        {[1, 2, 3, 4, 5, 6].map(num => (
                            <option key={num} value={num}>{num}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}

export default LiberoConfig;