function ActionPanel({handleButtons, isMyTeamServing, isServingPhase}) {

    console.log("Render ActionPanel", isServingPhase);
    return (
        <div className="actions-grid">
            {/* Nagłówki kolumn */}
            <div className="action-header">{isMyTeamServing ? "Zagrywka" : "Przyjęcie"}</div>
            <div className="action-header">Atak</div>
            <div className="action-header">Obrona</div>
            <div className="action-header">Blok</div>
            <div className="action-header">Dogranie</div>

            {/* Wiersz 1 */}
            <button className="action-btn positive" onClick={() => handleButtons(
                "#", isMyTeamServing ? "Zagrywka" : "Przyjęcie")}
                    disabled={!isServingPhase}>
                {isMyTeamServing ? (<>#<br/>PUNKTOWA</>) : (<>#<br/>PERFEKCYJNE</>)}
            </button>
            <button className="action-btn positive" onClick={() => handleButtons("#", "Atak")}
                    disabled={isServingPhase}>
                <>#<br/>PUNKTOWY</>
            </button>
            <button className="action-btn positive" onClick={() => handleButtons("#", "Obrona")}
                    disabled={isServingPhase}>
                <>#<br/>PERFEKCYJNA</>
            </button>
            <button className="action-btn positive" onClick={() => handleButtons("#", "Blok")}
                    disabled={isServingPhase}>
                <>#<br/>PUNKTOWY</>
            </button>
            <button className="action-btn positive" onClick={() => handleButtons("#", "Dogranie")}
                    disabled={isServingPhase}>
                <>#<br/>PERFEKCYJNE</>
            </button>

            {/* Wiersz 2 */}
            <button className={`action-btn ${isMyTeamServing ? "neutral" : "positive"}`}
                    onClick={() => handleButtons("+", isMyTeamServing ? "Zagrywka" : "Przyjęcie")}
                    disabled={!isServingPhase}>
                {isMyTeamServing ? (<>+<br/>ZŁE PRZYJĘCIE PRZECIWNIKA</>) : (<>+<br/>DOBRE</>)}
            </button>
            <button className="action-btn positive" onClick={() => handleButtons("+", "Atak")}
                    disabled={isServingPhase}>
                <>+<br/>OBRONIONY ALE NIE WYPROWADZĄ AKCJI</>
            </button>
            <button className="action-btn positive" onClick={() => handleButtons("+", "Obrona")}
                    disabled={isServingPhase}>
                <>+<br/>DOBRA</>
            </button>
            <button className="action-btn positive" onClick={() => handleButtons("+", "Blok")}
                    disabled={isServingPhase}>
                <>+<br/>WYBLOKOWANY</>
            </button>
            <button className="action-btn positive" onClick={() => handleButtons("+", "Dogranie")}
                    disabled={isServingPhase}>
                <>+<br/>DOBRE</>
            </button>

            {/* Wiersz 3 */}
            <button className="action-btn neutral"
                    onClick={() => handleButtons("!", isMyTeamServing ? "Zagrywka" : "Przyjęcie")}
                    disabled={!isServingPhase}>
                {isMyTeamServing ? (<>!<br/>PRZECIWNIK MIAŁ SŁABE PRZYJĘCIE</>) : (<>!<br/>SŁABE</>)}
            </button>
            <button className="action-btn neutral" onClick={() => handleButtons("!", "Atak")}
                    disabled={isServingPhase}>
                <>!<br/>BLOK WYASEKUROWANY</>
            </button>
            <span className={`action-btn empty-place ${isServingPhase ? "disabled" : ""}`}>
                OPCJA NIEDOSTĘPNA
            </span>
            {/*<div className="action-spacer"></div>*/}
            <button className="action-btn neutral" onClick={() => handleButtons("!", "Blok")}
                    disabled={isServingPhase}>
                <>!<br/>BLOK WYASEKUROWANY</>
            </button>
            <span className={`action-btn empty-place ${isServingPhase ? "disabled" : ""}`}>
                OPCJA NIEDOSTĘPNA
            </span>

            {/* Wiersz 4 */}
            <button className={`action-btn ${isMyTeamServing ? "negative" : "neutral"}`}
                    onClick={() => handleButtons("-", isMyTeamServing ? "Zagrywka" : "Przyjęcie")}
                    disabled={!isServingPhase}>
                {isMyTeamServing ? (<>-<br/>DOBRE/PERFEKCYJNE PRZYJĘCIE PRZECIWNIKA</>) : (<>-<br/>ZŁE</>)}
            </button>
            <button className="action-btn neutral" onClick={() => handleButtons("-", "Atak")}
                    disabled={isServingPhase}>
                <>-<br/>OBRONIONY Z AKCJĄ PRZECIWNIKA</>
            </button>
            <button className="action-btn neutral" onClick={() => handleButtons("-", "Obrona")}
                    disabled={isServingPhase}>
                <>-<br/>ZŁA</>
            </button>
            <span className={`action-btn empty-place ${isServingPhase ? "disabled" : ""}`}>
                OPCJA NIEDOSTĘPNA
            </span>
            <button className="action-btn neutral" onClick={() => handleButtons("-", "Dogranie")}
                    disabled={isServingPhase}>
                <>-<br/>ZŁE</>
            </button>
            {/*<div className="action-spacer"></div>*/}

            {/* Wiersz 5 */}
            <button className={`action-btn ${isMyTeamServing ? "positive" : "negative"}`}
                    onClick={() => handleButtons("/", isMyTeamServing ? "Zagrywka" : "Przyjęcie")}
                    disabled={!isServingPhase}>
                {isMyTeamServing ? (<>/<br/>PRZECIWNIK PRZYJĄŁ NA 2 STRONĘ</>) : (<>/<br/>NA DRUGĄ STRONĘ</>)}
            </button>
            <button className="action-btn negative" onClick={() => handleButtons("/", "Atak")}
                    disabled={isServingPhase}>
                <>/<br/>ZABLOKOWANY</>
            </button>
            <button className="action-btn negative" onClick={() => handleButtons("/", "Obrona")}
                    disabled={isServingPhase}>
                <>/<br/>NA DRUGĄ STRONĘ</>
            </button>
            <button className="action-btn negative" onClick={() => handleButtons("/", "Blok")}
                    disabled={isServingPhase}>
                <>/<br/>DOTKNIĘCIE SIATKI</>
            </button>
            <button className="action-btn negative" onClick={() => handleButtons("/", "Dogranie")}
                    disabled={isServingPhase}>
                <>/<br/>NA DRUGĄ STRONĘ</>
            </button>

            {/* Wiersz 6 */}
            <button className="action-btn negative"
                    onClick={() => handleButtons("=", isMyTeamServing ? "Zagrywka" : "Przyjęcie")}
                    disabled={!isServingPhase}>
                {isMyTeamServing ? (<>=<br/>BŁĄD</>) : (<>=<br/>BŁĄD</>)}
            </button>
            <button className="action-btn negative" onClick={() => handleButtons("=", "Atak")}
                    disabled={isServingPhase}>
                <>=<br/>BŁĄD</>
            </button>
            <button className="action-btn negative" onClick={() => handleButtons("=", "Obrona")}
                    disabled={isServingPhase}>
                <>=<br/>BŁĄD</>
            </button>
            <button className="action-btn negative" onClick={() => handleButtons("=", "Blok")}
                    disabled={isServingPhase}>
                <>=<br/>BLOK OBITY</>
            </button>
            <button className="action-btn negative" onClick={() => handleButtons("=", "Dogranie")}
                    disabled={isServingPhase}>
                <>=<br/>BŁĄD</>
            </button>
        </div>
    )
}

export default ActionPanel