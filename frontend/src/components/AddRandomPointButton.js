import React, {useState} from "react";

function AddRandomPointButton() {
    const [message, setMessage] = useState("");

    const handleClick = async () => {
        // losowy opis punktu
        const descriptions = ["Atak", "Serwis", "Blok", "Błąd przeciwnika"];
        const randomDesc = descriptions[Math.floor(Math.random() * descriptions.length)];

        // wywołanie backendu
        const response = await fetch("http://127.0.0.1:8000/add_point", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({description: randomDesc})
        });

        const data = await response.json();
        setMessage(data.message);
    };

    return (
        <div>
            <button onClick={handleClick}>Dodaj losowy punkt</button>
            {message && <p>{message}</p>}
        </div>
    );
}

export default AddRandomPointButton;
