# setup_test_data.py
import requests
import json

BASE_URL = "http://127.0.0.1:8000"


def create_test_teams():
    """Utwórz testowe drużyny z zawodnikami"""

    # Team A - Drużyna testowa
    team_a_data = {
        "name": "Team Alpha Test",
        "players": [
            {"name": "John", "surname": "Smith", "position_id": 1, "number": 1},
            {"name": "Mike", "surname": "Johnson", "position_id": 2, "number": 2},
            {"name": "David", "surname": "Williams", "position_id": 3, "number": 3},
            {"name": "Chris", "surname": "Brown", "position_id": 4, "number": 4},
            {"name": "James", "surname": "Davis", "position_id": 5, "number": 5},
            {"name": "Robert", "surname": "Miller", "position_id": 6, "number": 6},
            {"name": "Thomas", "surname": "Wilson", "position_id": 7, "number": 7},  # libero
        ]
    }

    # Team B - Drużyna testowa
    team_b_data = {
        "name": "Team Beta Test",
        "players": [
            {"name": "Paul", "surname": "Taylor", "position_id": 1, "number": 8},
            {"name": "Kevin", "surname": "Anderson", "position_id": 2, "number": 9},
            {"name": "Brian", "surname": "Thomas", "position_id": 3, "number": 10},
            {"name": "Steven", "surname": "Jackson", "position_id": 4, "number": 11},
            {"name": "Jason", "surname": "White", "position_id": 5, "number": 12},
            {"name": "Jeff", "surname": "Harris", "position_id": 6, "number": 13},
            {"name": "Frank", "surname": "Martin", "position_id": 7, "number": 14},  # libero
        ]
    }

    print("🏐 Tworzenie testowych drużyn...")

    # Utwórz Team A
    response_a = requests.post(f"{BASE_URL}/teams", json=team_a_data)
    if response_a.status_code == 200:
        team_a_id = response_a.json().get("team_id")
        print(f"✅ Utworzono Team Alpha (ID: {team_a_id})")
    else:
        print(f"❌ Błąd przy tworzeniu Team Alpha: {response_a.text}")
        return None, None

    # Utwórz Team B
    response_b = requests.post(f"{BASE_URL}/teams", json=team_b_data)
    if response_b.status_code == 200:
        team_b_id = response_b.json().get("team_id")
        print(f"✅ Utworzono Team Beta (ID: {team_b_id})")
    else:
        print(f"❌ Błąd przy tworzeniu Team Beta: {response_b.text}")
        return None, None

    return team_a_id, team_b_id


def get_existing_teams():
    """Pobierz istniejące drużyny z bazy"""
    print("\n🔍 Szukam istniejących drużyn...")

    response = requests.get(f"{BASE_URL}/teams")
    if response.status_code == 200:
        teams = response.json()
        if teams:
            print("Znalezione drużyny:")
            for team in teams:
                print(f"  ID: {team['id']}, Nazwa: {team['name']}")
            return teams[0]['id'], teams[1]['id'] if len(teams) > 1 else None
        else:
            print("❌ Brak drużyn w bazie")
            return None, None
    else:
        print("❌ Błąd przy pobieraniu drużyn")
        return None, None


if __name__ == "__main__":
    print("🔧 PRZYGOTOWYWANIE DANYCH TESTOWYCH")
    print("=" * 50)

    # Spróbuj pobrać istniejące drużyny
    team_a_id, team_b_id = get_existing_teams()

    # Jeśli nie ma drużyn, utwórz nowe
    if not team_a_id or not team_b_id:
        print("\n🆕 Tworzenie nowych drużyn testowych...")
        team_a_id, team_b_id = create_test_teams()

    if team_a_id and team_b_id:
        print(f"\n✅ Gotowe! Możesz uruchomić symulację z:")
        print(f"   Team A ID: {team_a_id}")
        print(f"   Team B ID: {team_b_id}")
        print(f"\n🎯 Uruchom: python simulate_complete_match.py")
    else:
        print("❌ Nie udało się przygotować danych testowych")
