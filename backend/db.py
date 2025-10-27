import sqlite3

DB_FILE = "../database/volleyball.db"


def get_connection():
    conn = sqlite3.connect(DB_FILE, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def create_tables():
    conn = get_connection()
    cursor = conn.cursor()

    # ===============================
    # TABELA: Teams
    # ===============================
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Teams (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL
        );
    """)

    # ===============================
    # TABELA: Positions
    # ===============================
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Positions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL
        );
    """)

    # ===============================
    # TABELA: Matches
    # ===============================
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Matches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            team_A_id INTEGER NOT NULL,
            team_B_id INTEGER DEFAULT NULL,
            match_date TEXT,
            sets_best_of INTEGER DEFAULT 5,
            winner_team INTEGER,
            FOREIGN KEY(team_A_id) REFERENCES Teams(id),
            FOREIGN KEY(team_B_id) REFERENCES Teams(id),
            FOREIGN KEY(winner_team) REFERENCES Teams(id)
        );
    """)

    # ===============================
    # TABELA: Players
    # ===============================
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Players (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            team_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            surname TEXT NOT NULL,
            position_id INTEGER,
            number INTEGER,
            FOREIGN KEY(team_id) REFERENCES Teams(id),
            FOREIGN KEY(position_id) REFERENCES Positions(id)
        );
    """)

    # ===============================
    # TABELA: Sets
    # ===============================
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Sets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            match_id INTEGER NOT NULL,
            set_no INTEGER NOT NULL,
            set_winner INTEGER,
            FOREIGN KEY(match_id) REFERENCES Matches(id),
            FOREIGN KEY(set_winner) REFERENCES Teams(id)
        );
    """)

    # ===============================
    # TABELA: Points
    # ===============================
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Points (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            set_id INTEGER NOT NULL,
            point_no INTEGER NOT NULL,
            score_before_A INTEGER,
            score_before_B INTEGER,
            winner CHAR,
            position_id INTEGER,
            FOREIGN KEY(set_id) REFERENCES Sets(id),
            FOREIGN KEY(position_id) REFERENCES Positioning(id)
        );
    """)

    # ===============================
    # TABELA: Player_Set_Stats
    # ===============================
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Player_Set_Stats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player_id INTEGER NOT NULL,
            set_id INTEGER NOT NULL,
            atacks INTEGER DEFAULT 0,
            positive_atacks INTEGER DEFAULT 0,
            FOREIGN KEY(player_id) REFERENCES Players(id),
            FOREIGN KEY(set_id) REFERENCES Sets(id)
        );
    """)

    # ===============================
    # TABELA: Results
    # ===============================
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            symbol CHAR NOT NULL
        );
    """)

    # ===============================
    # TABELA: Game Element
    # ===============================
    cursor.execute("""
            CREATE TABLE IF NOT EXISTS Game_Elements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL
            );
        """)

    # ===============================
    # TABELA: Point_Situation
    # ===============================
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Point_Situation (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            result_id INTEGER NOT NULL,
            game_element_id INTEGER NOT NULL,
            point_id INTEGER NOT NULL,
            player_id INTEGER,
            FOREIGN KEY(result_id) REFERENCES Results(id),
            FOREIGN KEY(game_element_id) REFERENCES Game_Elements(id),
            FOREIGN KEY(point_id) REFERENCES Points(id),
            FOREIGN KEY(player_id) REFERENCES Players(id)
        );
    """)

    # ===============================
    # TABELA: Positioning
    # ===============================
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Positioning (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            p1 INTEGER,
            p2 INTEGER,
            p3 INTEGER,
            p4 INTEGER,
            p5 INTEGER,
            p6 INTEGER,
            l INTEGER,
            l_change1 INTEGER,
            l_change2 INTEGER,
            setter_position INTEGER CHECK (setter_position BETWEEN 1 AND 6),
            FOREIGN KEY(p1) REFERENCES Players(id),
            FOREIGN KEY(p2) REFERENCES Players(id),
            FOREIGN KEY(p3) REFERENCES Players(id),
            FOREIGN KEY(p4) REFERENCES Players(id),
            FOREIGN KEY(p5) REFERENCES Players(id),
            FOREIGN KEY(p6) REFERENCES Players(id),
            FOREIGN KEY(l) REFERENCES Players(id),
            FOREIGN KEY(l_change1) REFERENCES Players(id),
            FOREIGN KEY(l_change2) REFERENCES Players(id)
        );
    """)

    conn.commit()
    conn.close()


def seed_data():
    conn = get_connection()
    c = conn.cursor()

    positions = ["Libero", "Przyjmujący", "Atakujący", "Rozgrywający", "Środkowy"]

    for pos in positions:
        c.execute("SELECT COUNT(*) FROM Positions WHERE name = ?", (pos,))
        exists = c.fetchone()[0]

        if not exists:
            c.execute("INSERT INTO Positions (name) VALUES (?)", (pos,))

    gameElements = ["Zagrywka", "Przyjęcie", "Atak", "Obrona", "Blok", "Dogranie", "Nietypowy błąd", "Błąd przeciwnika"]
    for elem in gameElements:
        c.execute("SELECT COUNT(*) FROM Game_Elements WHERE name = ?", (elem,))
        exists = c.fetchone()[0]

        if not exists:
            c.execute("INSERT INTO Game_Elements (name) VALUES (?)", (elem,))

    # wszystkie oznaczenia normalnie jak w siatkówce, ? na nietypowy błąd (np błąd ustawienia) x na błąd przeciwnika
    symbols = ["#", "+", "!", "-", "/", "=", "?", "x"]
    for s in symbols:
        c.execute("SELECT COUNT(*) FROM Results WHERE symbol = ?", (s,))
        exists = c.fetchone()[0]

        if not exists:
            c.execute("INSERT INTO Results (symbol) VALUES (?)", (s,))

    conn.commit()
    conn.close()


create_tables()
seed_data()
