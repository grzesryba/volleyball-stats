import React from 'react';
import './styles/new_match_config_window.css'

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
        <div style={{marginTop: "25px"}}>
            <h3>Libero</h3>

            <div className="liberoContainer">
                <div>
                    <label>Wybierz libero:</label>
                    <select
                        value={liberoId ?? ""}
                        onChange={(e) => {
                            const v = e.target.value;
                            setLiberoId(v ? parseInt(v, 10) : null);
                            // jeżeli wybraliśmy libero który był wcześniej partnerem libero (rzadkie), to nic specjalnego
                        }}
                    >
                        <option value="">-- brak --</option>
                        {/*
                                        WYKLUCZAMY zawodników, którzy są już na boisku,
                                        żeby nie mogło być jednocześnie libero i grającego.
                                    */}
                        {players
                            .filter((p) => !playersOnCourtIds.includes(p.id))
                            .map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.number}. {p.name} {p.surname}
                                </option>
                            ))}
                    </select>
                </div>

                <div>
                    <label>Z kim się zmienia:</label>

                    <label>1 do zmiany</label>
                    <select
                        value={liberoPartner1Id ?? ""}
                        onChange={(e) => {
                            const v = e.target.value;
                            setLiberoPartner1Id(v ? parseInt(v, 10) : null);
                        }}
                    >
                        <option value="">-- brak --</option>
                        {Object.values(positions)
                            .filter((p) => p && p.id !== liberoPartner2Id) // tylko rzeczywiste przypisania
                            .map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.number}. {p.name} {p.surname}
                                </option>
                            ))}
                    </select>

                    <label>2 do zmiany</label>
                    <select
                        value={liberoPartner2Id ?? ""}
                        onChange={(e) => {
                            const v = e.target.value;
                            setLiberoPartner2Id(v ? parseInt(v, 10) : null);
                        }}
                    >
                        <option value="">-- brak --</option>
                        {Object.values(positions)
                            .filter((p) => p && p.id !== liberoPartner1Id) // tylko rzeczywiste przypisania
                            .map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.number}. {p.name} {p.surname}
                                </option>
                            ))}
                    </select>
                </div>
                <div>
                    <label>Pozycja rozgrywającego:</label>
                    <select
                        value={setterPosition ?? ""}
                        onChange={(e) => {
                            const v = e.target.value;
                            setSetterPosition(v ? parseInt(v, 10) : null);
                        }}
                    >
                        <option value={null}>-- brak --</option>
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                            <option key={num} value={num}>
                                {num}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    )
}

export default LiberoConfig