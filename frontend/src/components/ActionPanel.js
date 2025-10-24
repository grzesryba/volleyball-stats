function ActionPanel({selectedPlayerId, functions, isMyTeamServing}) {
    return (
        <div className="actions-grid">
            {/* Nagłówki kolumn */}
            <div className="action-header">{isMyTeamServing ? "Zagrywka" : "Przyjęcie"}</div>
            <div className="action-header">Atak</div>
            <div className="action-header">Obrona</div>
            <div className="action-header">Blok</div>
            <div className="action-header">Dogranie</div>

            {/* Wiersz 1 */}
            <button className="action-btn positive" onClick={() => functions.handleServe()}>
                {isMyTeamServing ? (<>#<br/>PUNKTOWA</>) : (<>#<br/>PERFEKCYJNE</>)}
            </button>
            <button className="action-btn positive">
                <>#<br/>PUNKTOWY</>
            </button>
            <button className="action-btn positive">
                <>#<br/>PERFEKCYJNA</>
            </button>
            <button className="action-btn positive">
                <>#<br/>PUNKTOWY</>
            </button>
            <button className="action-btn positive">
                <>#<br/>PERFEKCYJNE</>
            </button>

            {/* Wiersz 2 */}
            <button className={`action-btn ${isMyTeamServing ? "neutral" : "positive"}`}>
                {isMyTeamServing ? (<>+<br/>ZŁE PRZYJĘCIE PRZECIWNIKA</>) : (<>+<br/>DOBRE</>)}
            </button>
            <button className="action-btn positive">
                <>+<br/>OBRONIONY ALE NIE WYPROWADZĄ AKCJI</>
            </button>
            <button className="action-btn positive">
                <>+<br/>DOBRA</>
            </button>
            <button className="action-btn positive">
                <>+<br/>WYBLOKOWANY</>
            </button>
            <button className="action-btn positive">
                <>+<br/>DOBRE</>
            </button>

            {/* Wiersz 3 */}
            <button className="action-btn neutral">
                {isMyTeamServing ? (<>!<br/>PRZECIWNIK MIAŁ SŁABE PRZYJĘCIE</>) : (<>!<br/>SŁABE</>)}
            </button>
            <button className="action-btn neutral">
                <>!<br/>BLOK WYASEKUROWANY</>
            </button>
            <span className="action-btn empty-place">
                OPCJA NIEDOSTĘPNA
            </span>
            {/*<div className="action-spacer"></div>*/}
            <button className="action-btn neutral">
                <>!<br/>BLOK WYASEKUROWANY</>
            </button>
            <span className="action-btn empty-place">
                OPCJA NIEDOSTĘPNA
            </span>

            {/* Wiersz 4 */}
            <button className={`action-btn ${isMyTeamServing ? "negative" : "neutral"}`}>
                {isMyTeamServing ? (<>-<br/>DOBRE/PERFEKCYJNE PRZYJĘCIE PRZECIWNIKA</>) : (<>-<br/>ZŁE</>)}
            </button>
            <button className="action-btn neutral">
                <>-<br/>OBRONIONY Z AKCJĄ PRZECIWNIKA</>
            </button>
            <button className="action-btn neutral">
                <>-<br/>ZŁA</>
            </button>
            <span className="action-btn empty-place">
                OPCJA NIEDOSTĘPNA
            </span>
            <button className="action-btn neutral">
                <>-<br/>ZŁE</>
            </button>
            {/*<div className="action-spacer"></div>*/}

            {/* Wiersz 5 */}
            <button className={`action-btn ${isMyTeamServing ? "positive" : "negative"}`}>
                {isMyTeamServing ? (<>/<br/>PRZECIWNIK PRZYJĄŁ NA 2 STRONĘ</>) : (<>/<br/>NA DRUGĄ STRONĘ</>)}
            </button>
            <button className="action-btn negative">
                <>/<br/>ZABLOKOWANY</>
            </button>
            <button className="action-btn negative">
                <>/<br/>NA DRUGĄ STRONĘ</>
            </button>
            <button className="action-btn negative">
                <>/<br/>DOTKNIĘCIE SIATKI</>
            </button>
            <button className="action-btn negative">
                <>/<br/>NA DRUGĄ STRONĘ</>
            </button>

            {/* Wiersz 6 */}
            <button className="action-btn negative">
                {isMyTeamServing ? (<>=<br/>BŁĄD</>) : (<>=<br/>BŁĄD</>)}
            </button>
            <button className="action-btn negative">
                <>=<br/>BŁĄD</>
            </button>
            <button className="action-btn negative">
                <>=<br/>BŁĄD</>
            </button>
            <button className="action-btn negative">
                <>=<br/>BLOK OBITY</>
            </button>
            <button className="action-btn negative">
                <>=<br/>BŁĄD</>
            </button>
        </div>
    )
}

export default ActionPanel