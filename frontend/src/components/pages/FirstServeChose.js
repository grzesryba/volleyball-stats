function FirstServeChose({ isOpen, onChoose }) {
    if (!isOpen) return null;

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <h2>Who starts serving?</h2>
                <div>
                    <button onClick={() => onChoose("A")}>My Team</button>
                    <button onClick={() => onChoose("B")}>Opponents</button>
                </div>
            </div>
        </div>
    );
}

export default FirstServeChose;


const overlayStyle = {
    position: "fixed",
    top: 0, left: 0,
    width: "100%", height: "100%",
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
};

const modalStyle = {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "12px",
    width: "600px",
    maxHeight: "80vh",
    overflowY: "auto"
};

const rowStyle = {
    display: "flex",
    gap: "10px",
    marginBottom: "5px",
    alignItems: "center"
};
