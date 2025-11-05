# match_simulator.py
import requests
import json
import time
import random

BASE_URL = "http://127.0.0.1:8000"
STAT_URL = "http://127.0.0.1:3000/stats"



class MatchSimulator:
    def __init__(self, team_a_id: int, team_b_id: int = None):
        self.team_a_id = team_a_id
        self.team_b_id = team_b_id
        self.match_id = None
        self.current_set_id = None
        self.current_position_id = None
        self.current_position = None
        self.point_counter = 0
        self.score_a = 0
        self.score_b = 0
        self.set_score_a = 0
        self.set_score_b = 0
        self.current_set = 1
        self.is_team_a_serving = None
        self.players = []
        self.serve_positions = None
        self.ingame_positions = None
        self.receive_positions = None

    def make_request(self, endpoint: str, method: str = "POST", data: dict = None):
        """Wykonaj zapytanie do API"""
        url = f"{BASE_URL}{endpoint}"
        try:
            if method == "POST":
                response = requests.post(url, json=data)
            elif method == "GET":
                response = requests.get(url)
            else:
                return None

            if response.status_code == 200:
                return response.json()
            else:
                print(f"❌ Błąd {response.status_code} dla {endpoint}: {response.text}")
                return None
        except Exception as e:
            print(f"❌ Błąd połączenia: {e}")
            return None

    def load_team_players(self):
        """Załaduj zawodników drużyny"""
        result = self.make_request(f"/players_team/{self.team_a_id}", method="GET")
        if result:
            self.players = result
            print(f"✅ Załadowano {len(self.players)} zawodników")
            return True
        return False

    def start_match(self):
        """Rozpocznij nowy mecz"""
        print("🏐 ROZPOCZYNANIE NOWEGO MECZU...")

        match_data = {
            "team_A_id": self.team_a_id,
            "team_B_id": self.team_b_id,
            "sets_best_of": 3,
            "winner_team": None
        }

        result = self.make_request("/matches/start", data=match_data)
        if result and "match_id" in result:
            self.match_id = result["match_id"]
            print(f"✅ Utworzono mecz ID: {self.match_id}")
            return True
        return False

    def start_set(self, set_number: int):
        """Rozpocznij nowy set"""
        set_data = {
            "match_id": self.match_id,
            "set_no": set_number,
            "set_winner": None
        }

        result = self.make_request(f"/match/{self.match_id}/set/start", data=set_data)
        if result and "set_id" in result:
            self.current_set_id = result["set_id"]
            print(f"✅ Rozpoczęto set {set_number} (ID: {self.current_set_id})")
            return True
        return False

    def create_starting_position(self):
        """Utwórz pozycję startową z rzeczywistych graczy"""
        if len(self.players) < 7:
            print(f"❌ Nie wystarczająca liczba zawodników ({len(self.players)})")
            return False

        # Wybierz 6 zawodników na boisko + libero
        court_players = self.players[:6]
        libero = self.players[6] if len(self.players) > 6 else self.players[0]

        # Znajdź partnerów libero (zawodnicy na pozycjach 5 i 6)
        libero_partner1 = court_players[4]  # p5
        libero_partner2 = court_players[5]  # p6

        self.current_position = {
            "p1": court_players[0]["id"],
            "p2": court_players[1]["id"],
            "p3": court_players[2]["id"],
            "p4": court_players[3]["id"],
            "p5": libero_partner1["id"],
            "p6": libero_partner2["id"],
            "l": libero["id"],
            "l_change1": libero_partner1["id"],
            "l_change2": libero_partner2["id"],
            "setter_position": 1
        }

        result = self.make_request("/positioning", data=self.current_position)
        if result and "position_id" in result:
            self.current_position_id = result["position_id"]
            print(f"✅ Utworzono pozycję startową ID: {self.current_position_id}")
            return True
        return False

    def update_game_positions(self):
        """Pobierz pozycje w grze (serving, ingame, receive)"""
        data = {
            "positions": self.current_position,
            "isMyTeamServing": self.is_team_a_serving
        }

        result = self.make_request("/ingame/positions", data=data)
        if result:
            self.serve_positions = result.get("serving_position")
            self.ingame_positions = result.get("ingame_position")
            self.receive_positions = result.get("receive_position")
            return True
        return False

    def determine_first_serve(self):
        """Wylosuj który zespół zaczyna z zagrywką"""
        self.is_team_a_serving = random.choice([True, False])
        print(f"🎯 Pierwsza zagrywka: {'Team A' if self.is_team_a_serving else 'Team B'}")
        self.update_game_positions()

    def make_rotation(self):
        """Wykonaj rotację"""
        result = self.make_request("/rotation", data=self.current_position)
        if result:
            self.current_position = result["position"]
            self.serve_positions = result["serving_position"]
            self.ingame_positions = result["ingame_position"]

            # Dodaj nową pozycję do bazy
            pos_result = self.make_request("/positioning", data=self.current_position)
            if pos_result:
                self.current_position_id = pos_result["position_id"]
            return True
        return False

    def create_point(self) -> int:
        """Utwórz nowy punkt w bazie"""
        point_data = {
            "set_id": self.current_set_id,
            "point_no": self.point_counter,
            "score_before_A": self.score_a,
            "score_before_B": self.score_b,
            "winner": None,
            "position_id": self.current_position_id
        }

        result = self.make_request("/add_point", data=point_data)
        if result and "point_id" in result:
            print(f"📝 Punkt #{self.point_counter} ({self.score_a}-{self.score_b})", end=" → ")
            return result["point_id"]
        return None

    def add_point_situation(self, point_id: int, result: str, game_element: str, player_id: int):
        """Dodaj sytuację punktową"""
        situation_data = {
            "result": result,
            "game_element": game_element,
            "point_id": point_id,
            "player_id": player_id
        }

        result_api = self.make_request("/point_situation", data=situation_data)
        if result_api:
            winner = result_api.get("winner")
            return winner
        return None

    def set_point_winner(self, point_id: int, winner: str):
        """Ustaw zwycięzcę punktu"""
        data = {"winner": winner}
        self.make_request(f"/point/{point_id}/winner?winner={winner}", method="POST")

    def set_set_winner(self, winner: str):
        """Ustaw zwycięzcę seta"""
        self.make_request(f"/set/{self.current_set_id}/winner?winner={winner}", method="POST")

    def get_random_player_on_court(self):
        """Pobierz losowego zawodnika z boiska (uwzględnia libero)"""
        # Podczas zagrywki używamy serve_positions (libero jest już uwzględnione)
        if self.is_team_a_serving and self.serve_positions:
            return random.choice(self.serve_positions)
        # Podczas przyjęcia używamy ingame_positions (libero jest już uwzględnione)
        elif self.ingame_positions:
            return random.choice(self.ingame_positions)
        # Fallback
        return self.serve_positions[0] if self.serve_positions else self.current_position["p1"]

    def get_receiver_for_position(self, zone: int):
        """Pobierz zawodnika przyjmującego w danej strefie (uwzględnia libero)"""
        if not self.receive_positions:
            return self.get_random_player_on_court()

        # receive_positions to lista [(zone, player_id, position_name), ...]
        players_in_zone = [player_id for z, player_id, _ in self.receive_positions if z == zone]

        if players_in_zone:
            return random.choice(players_in_zone)
        return self.get_random_player_on_court()

    def simulate_serve_point(self, point_id: int, winning_team: str):
        """Symuluj punkt z zagrywki (as lub błąd przeciwnika)"""
        last_winner = None

        if self.is_team_a_serving:
            # Team A serwuje
            server = self.serve_positions[0] if self.serve_positions else self.current_position["p1"]

            if winning_team == "A":
                # As serwisowy
                last_winner = self.add_point_situation(point_id, "#", "Zagrywka", server)
            else:
                # Dobre przyjęcie przeciwnika, przegraliśmy punkt
                last_winner = self.add_point_situation(point_id, "-", "Zagrywka", server)
        else:
            # Team B serwuje, my przyjmujemy
            receiver = self.get_random_player_on_court()

            if winning_team == "A":
                # Perfekcyjne przyjęcie, wygraliśmy
                last_winner = self.add_point_situation(point_id, "#", "Przyjęcie", receiver)
            else:
                # Błąd w przyjęciu
                last_winner = self.add_point_situation(point_id, "=", "Przyjęcie", receiver)

        return last_winner

    def simulate_rally_point(self, point_id: int, winning_team: str):
        """Symuluj punkt z wymiany (z wieloma akcjami)"""
        last_winner = None

        # 1. Zagrywka/Przyjęcie
        if self.is_team_a_serving:
            server = self.serve_positions[0] if self.serve_positions else self.current_position["p1"]
            serve_quality = random.choice(["#", "+", "!", "-"])
            last_winner = self.add_point_situation(point_id, serve_quality, "Zagrywka", server)
            if last_winner:
                return last_winner
        else:
            receiver = self.get_random_player_on_court()
            receive_quality = random.choice(["#", "+", "!", "-"])
            last_winner = self.add_point_situation(point_id, receive_quality, "Przyjęcie", receiver)
            if last_winner:
                return last_winner

        # 2. Losowe akcje w wymianie
        num_actions = random.randint(1, 4)
        action_types = ["Dogranie", "Obrona", "Blok"]

        for _ in range(num_actions):
            player = self.get_random_player_on_court()
            action = random.choice(action_types)
            result = random.choice(["#", "+", "!", "-", "/"])

            last_winner = self.add_point_situation(point_id, result, action, player)
            if last_winner:
                return last_winner

        # 3. Końcowy atak
        attacker = self.get_random_player_on_court()
        if winning_team == "A":
            attack_result = "#"  # Punktowy atak
        else:
            attack_result = random.choice(["=", "/"])  # Błąd lub blok

        last_winner = self.add_point_situation(point_id, attack_result, "Atak", attacker)
        return last_winner

    def play_single_point(self):
        """Rozegraj pojedynczy punkt"""
        point_id = self.create_point()
        if not point_id:
            return False

        # Określ zwycięzcę punktu (z lekkim biasem na drużynę serwującą)
        if self.is_team_a_serving:
            winner = random.choices(["A", "B"], weights=[0.55, 0.45])[0]
        else:
            winner = random.choices(["A", "B"], weights=[0.45, 0.55])[0]

        # Wybierz typ punktu
        point_type = random.choices(
            ["serve", "rally"],
            weights=[0.3, 0.7],
            k=1
        )[0]

        # Symuluj punkt
        if point_type == "serve":
            final_winner = self.simulate_serve_point(point_id, winner)
        else:
            final_winner = self.simulate_rally_point(point_id, winner)

        # Jeśli API nie zwróciło zwycięzcy, ustaw ręcznie
        if not final_winner:
            final_winner = winner
            self.set_point_winner(point_id, final_winner)

        # Aktualizuj wynik
        prev_serving = self.is_team_a_serving

        if final_winner == "A":
            self.score_a += 1
            # Jeśli Team B serwowało i przegrało, rotacja dla Team A
            if not prev_serving:
                self.make_rotation()
            self.is_team_a_serving = True
        else:
            self.score_b += 1
            self.is_team_a_serving = False

        print(f"Team {final_winner} | Wynik: {self.score_a}-{self.score_b}")

        self.point_counter += 1
        self.update_game_positions()

        time.sleep(0.05)  # Małe opóźnienie
        return True

    def should_set_end(self) -> bool:
        """Sprawdź czy set powinien się zakończyć"""
        if (self.score_a >= 25 or self.score_b >= 25) and abs(self.score_a - self.score_b) >= 2:
            return True
        return False

    def play_set(self, set_number: int):
        """Rozegraj kompletny set"""
        print(f"\n{'=' * 60}")
        print(f"🎯 SET {set_number}")
        print(f"{'=' * 60}")

        if not self.start_set(set_number):
            return False

        self.score_a = 0
        self.score_b = 0
        self.point_counter = 0

        # Graj punkt po punkcie
        while not self.should_set_end():
            if not self.play_single_point():
                break

        # Zakończ set
        set_winner = "A" if self.score_a > self.score_b else "B"
        self.set_set_winner(set_winner)

        if set_winner == "A":
            self.set_score_a += 1
        else:
            self.set_score_b += 1

        print(f"\n🎉 KONIEC SETA {set_number}!")
        print(f"   Wynik seta: {self.score_a}-{self.score_b}")
        print(f"   Zwycięzca: Team {set_winner}")
        print(f"   Stan meczu: {self.set_score_a}-{self.set_score_b}")

        return True

    def play_complete_match(self):
        """Rozegraj kompletny mecz"""
        print("\n" + "=" * 60)
        print("🏐 SYMULACJA MECZU SIATKARSKIEGO")
        print("=" * 60)

        if not self.load_team_players():
            print("❌ Nie udało się załadować zawodników!")
            return

        if not self.start_match():
            print("❌ Nie udało się rozpocząć meczu!")
            return

        if not self.create_starting_position():
            print("❌ Nie udało się utworzyć pozycji startowej!")
            return

        self.determine_first_serve()

        # Graj maksymalnie 3 sety
        for set_num in range(1, 2):
            if not self.play_set(set_num):
                break

            # Sprawdź czy mecz jest rozstrzygnięty
            if self.set_score_a == 2 or self.set_score_b == 2:
                break

            time.sleep(0.5)

        # Podsumowanie
        print("\n" + "=" * 60)
        print("🎊 KONIEC MECZU!")
        print(f"🏆 WYNIK: Team A {self.set_score_a} - {self.set_score_b} Team B")
        match_winner = "A" if self.set_score_a > self.set_score_b else "B"
        print(f"🥇 ZWYCIĘZCA: Team {match_winner}")
        print("=" * 60)

        print(f"\n📊 Spis sytuacja po sytuacji dostępny pod: {BASE_URL}/stats/match/{self.match_id}")
        print(f"\n📊 Statystyki dostępne pod: {STAT_URL}/{self.match_id}")
        print(f"🔗 Match ID: {self.match_id}")


def main():
    """Uruchom symulację"""
    # Podaj ID swojej drużyny z bazy danych
    TEAM_A_ID = 5  # ZMIEŃ NA SWOJE ID
    TEAM_B_ID = None  # Opcjonalnie ID przeciwnika

    print("🔧 Inicjalizacja symulatora...")
    simulator = MatchSimulator(TEAM_A_ID, TEAM_B_ID)

    simulator.play_complete_match()


if __name__ == "__main__":
    main()