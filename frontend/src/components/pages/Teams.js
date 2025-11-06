import React, {useState, useEffect} from "react";
import TeamModal from "./TeamModal";
import HomeButton from "../nav_buttons/HomeButton";

function Teams() {
    const [teams, setTeams] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTeam, setEditingTeam] = useState(null);

    const fetchTeams = async () => {
        const res = await fetch("/api/teams");
        const data = await res.json();
        setTeams(data);
    };

    useEffect(() => {
        fetchTeams();
    }, []);

    const handleAddTeam = async (teamData) => {
        // Zapis drużyny
        console.log(JSON.stringify(teamData))
        const res = await fetch("/api/teams", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(teamData),
        });
        await res.json();
        await fetchTeams();
    };

    const handleEditTeam = async (teamData) => {
        console.log(teamData.id)
        const res = await fetch(`/api/teams/${teamData.id}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(teamData),
        });
        await res.json();
        await fetchTeams();
    };

    return (
        <div>
            <HomeButton/>
            <h2>Drużyny</h2>
            <button onClick={() => {
                setEditingTeam(null);
                setModalOpen(true);
            }}>
                ➕ Dodaj drużynę
            </button>

            <ul>
                {teams.map((t) => (
                    <li key={t.id}>
                        {t.name}{" "}
                        <button onClick={() => {
                            setEditingTeam(t);
                            setModalOpen(true);
                        }}>
                            ✏️ Edytuj
                        </button>
                    </li>
                ))}
            </ul>

            <TeamModal
                isOpen={modalOpen}
                onClose={() => {setModalOpen(false)
                                        setEditingTeam(null)}}
                onSave={editingTeam ? handleEditTeam : handleAddTeam}
                existingTeam={editingTeam}
            />
        </div>
    );
}

export default Teams;
