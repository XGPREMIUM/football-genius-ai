from db import get_connection


PLAYERS = [
    ("Lionel Messi", "Lionel Andrés Messi Cuccittini", "1987-06-24", "Argentina", "Delantero/Extremo", "Izquierda", 170, "Inter Miami", "€40M", 850, 380, 180, 8, 1, 4, "Considerado el mejor jugador de todos los tiempos por muchos. Leyenda del FC Barcelona y la selección argentina.", "Regate, visión, finalización, pase, creatividad", "Falso extremo izquierdo que llega al centro"),
    ("Cristiano Ronaldo", "Cristiano Ronaldo dos Santos Aveiro", "1985-02-05", "Portugal", "Delantero/Extremo", "Derecha", 187, "Al Nassr", "€30M", 900, 250, 210, 0, 0, 5, "Máximo goleador histórico del fútbol mundial. Leyenda del Real Madrid.", "Remate, salto, velocidad, determinación, juego aéreo", "Extremo convertido a delantero centro letal"),
    ("Diego Maradona", "Diego Armando Maradona Franco", "1960-10-30", "Argentina", "Mediapunta", "Izquierda", 165, None, "-", 345, 120, 91, 0, 1, 0, "Genio absoluto del fútbol. Llevó a Argentina al Mundial 86 con actuaciones inolvidables.", "Regate, visión, pase, creatividad, liderazgo", "Engache clásico, jugador de fútbol total"),
    ("Pelé", "Edson Arantes do Nascimento", "1940-10-23", "Brasil", "Delantero", "Derecha", 173, None, "-", 767, 0, 92, 0, 3, 0, "Rey del fútbol. Único jugador en ganar 3 Mundiales (1958, 1962, 1970).", "Finalización, regate, visión, velocidad, juego aéreo", "Delantero centro total, mediapunta"),
    ("Johan Cruyff", "Hendrik Johannes Cruijff", "1947-04-25", "Países Bajos", "Mediapunta/Delantero", "Derecha", 178, None, "-", 433, 0, 48, 0, 0, 0, "Revolucionó el fútbol como jugador y entrenador. Padre del fútbol total.", "Técnica, visión, inteligencia táctica, liderazgo", "Falso 9, organizador ofensivo"),
    ("Zinedine Zidane", "Zinedine Yazid Zidane", "1972-06-23", "Francia", "Mediapunta", "Derecha", 185, None, "-", 156, 0, 108, 1, 1, 1, "Genio francés, ganó Mundial 98, Euro 2000. Mago del balón.", "Control, visión, elegancia, disparo, liderazgo", "Mediapunta clásico, organizador"),
    ("Ronaldo Nazário", "Ronaldo Luís Nazário de Lima", "1976-09-18", "Brasil", "Delantero", "Izquierda", 183, None, "-", 414, 0, 98, 0, 2, 0, "Fenómeno. El delantero más letal de su generación pese a las lesiones.", "Velocidad, regate, finalización, potencia, definición", "Delantero centro total, referencia ofensiva"),
    ("Alfredo Di Stéfano", "Alfredo Stéfano Di Stéfano Laulhé", "1926-07-04", "Argentina", "Delantero/Mediapunta", "Derecha", 178, None, "-", 512, 0, 6, 0, 0, 5, "Saeta rubia. Leyenda del Real Madrid y del fútbol mundial.", "Versatilidad, resistencia, visión, gol, liderazgo", "Jugador total, delantero centro"),
    ("Franz Beckenbauer", "Franz Anton Beckenbauer", "1945-09-11", "Alemania", "Defensa central/Libero", "Derecha", 181, None, "-", 109, 0, 103, 0, 1, 0, "Kaiser. Inventó la posición de líbero moderno. Ganó Mundial 74 como jugador y 90 como entrenador.", "Elegancia, liderazgo, visión, anticipación, salida de balón", "Líbero, defensa total"),
    ("Michel Platini", "Michel François Platini", "1955-06-21", "Francia", "Mediapunta", "Derecha", 179, None, "-", 312, 0, 72, 3, 0, 1, "Mago francés, 3 Balones de Oro consecutivos. Leyenda de la Juventus y Francia.", "Pase, visión, gol, precisión, liderazgo", "Mediapunta ofensivo, organizador"),
    ("Lamine Yamal", "Lamine Yamal Nasraoui Ebana", "2007-07-13", "España", "Extremo", "Izquierda", 180, "FC Barcelona", "€180M", 15, 20, 15, 0, 0, 0, "Joyaa de La Masia. El jugador más joven en debutar y marcar con Barça y España. Campeón de la Eurocopa 2024.", "Regate, desborde, visión, madurez, creatividad", "Extremo derecho que recorta hacia el interior"),
    ("Jude Bellingham", "Jude Victor William Bellingham", "2003-06-29", "Inglaterra", "Centrocampista", "Derecha", 186, "Real Madrid", "€200M", 50, 30, 36, 0, 0, 0, "Estrella total del Real Madrid. MVP de LaLiga 2023-24.", "Llegada, físico, técnica, inteligencia, liderazgo", "Box-to-box, mediapunta"),
    ("Kylian Mbappé", "Kylian Mbappé Lottin", "1998-12-20", "Francia", "Delantero/Extremo", "Derecha", 178, "Real Madrid", "€180M", 350, 120, 82, 0, 1, 0, "Superestrella francesa. Campeón del Mundo 2018 con apenas 19 años.", "Velocidad, regate, definición, desmarque, potencia", "Extremo izquierdo, delantero centro"),
    ("Erling Haaland", "Erling Braut Haaland", "2000-07-21", "Noruega", "Delantero centro", "Izquierda", 194, "Manchester City", "€200M", 280, 50, 35, 0, 0, 0, "Máquina de goles. Récord de goles en Premier League en una temporada (36).", "Remate, físico, velocidad, posicionamiento, potencia", "Delantero centro de referencia"),
    ("Vinícius Júnior", "Vinícius José Paixão de Oliveira Júnior", "2000-07-12", "Brasil", "Extremo", "Derecha", 176, "Real Madrid", "€200M", 100, 70, 30, 0, 0, 2, "Brasileño espectacular. Héroe de la Champions 2022 y 2024.", "Regate, velocidad, dribbling, desborde, creatividad", "Extremo izquierdo puro"),
    ("Rodri", "Rodrigo Hernández Cascante", "1996-06-22", "España", "Centrocampista defensivo", "Derecha", 190, "Manchester City", "€120M", 40, 30, 55, 1, 0, 1, "Mejor centrocampista del mundo. Balón de Oro 2024. MVP de la Eurocopa 2024.", "Pase, visión, control de juego, inteligencia táctica, recuperación", "Pivote, organizador defensivo"),
    ("Paolo Maldini", "Paolo Cesare Maldini", "1968-06-26", "Italia", "Defensa central/Lateral", "Izquierda", 186, None, "-", 33, 0, 126, 0, 0, 5, "Leyenda del AC Milan y la selección italiana. Defensa total.", "Anticipación, elegancia, liderazgo, marcaje, salida de balón", "Defensa total, lateral y central"),
    ("Ronaldinho", "Ronaldo de Assis Moreira", "1980-03-21", "Brasil", "Mediapunta/Extremo", "Derecha", 182, None, "-", 230, 0, 97, 1, 1, 1, "El fútbol feliz. Mago brasileño, Balón de Oro 2005. Ganó el Mundial 2002.", "Regate, creatividad, sonrisa, pase, fantasía", "Mediapunta creativo, extremo"),
    ("Sergio Ramos", "Sergio Ramos García", "1986-03-30", "España", "Defensa central", "Derecha", 184, None, "-", 100, 0, 180, 0, 1, 4, "Leyenda del Real Madrid y España. Capitán de la mejor época del fútbol español.", "Liderazgo, juego aéreo, contundencia, carácter, gol", "Defensa central agresivo"),
    ("Andrés Iniesta", "Andrés Iniesta Luján", "1984-05-11", "España", "Centrocampista", "Derecha", 171, None, "-", 90, 170, 131, 0, 1, 4, "Genio del mediocampo. Autor del gol del Mundial 2010. Corazón del tiki-taka.", "Control, visión, pase, inteligencia, temple", "Interior, organizador ofensivo"),
    ("Xavi Hernández", "Xavier Hernández Creus", "1980-01-25", "España", "Centrocampista", "Derecha", 170, None, "-", 85, 180, 133, 0, 1, 4, "Cerebro del Barça y España. Dueño del pase y la posesión.", "Pase, visión, control de ritmo, inteligencia, precisión", "Pivote, organizador total"),
    ("Luka Modrić", "Luka Modrić", "1985-09-09", "Croacia", "Centrocampista", "Derecha", 172, "Real Madrid", "€10M", 60, 100, 175, 1, 0, 6, "Balón de Oro 2018. Corazón de Croacia y del Real Madrid moderno.", "Visión, pase, control, inteligencia, resistencia", "Box-to-box, organizador"),
    ("Neymar Jr", "Neymar da Silva Santos Júnior", "1992-02-05", "Brasil", "Extremo/Delantero", "Derecha", 175, "Santos", "€30M", 350, 200, 128, 0, 0, 1, "Brasileño genial. Referente de su generación. Máximo goleador histórico de Brasil.", "Regate, creatividad, velocidad, pase, fantasía", "Extremo izquierdo, segunda punta"),
    ("Robert Lewandowski", "Robert Lewandowski", "1988-08-21", "Polonia", "Delantero centro", "Derecha", 185, "FC Barcelona", "€20M", 650, 120, 148, 0, 0, 1, "Máquina de goles polaca. Dos Balones de Oro seguidos (2020, 2021).", "Remate, posicionamiento, físico, juego aéreo, definición", "Delantero centro total"),
    ("Kevin De Bruyne", "Kevin De Bruyne", "1991-06-28", "Bélgica", "Centrocampista ofensivo", "Derecha", 181, "Manchester City", "€50M", 150, 260, 104, 0, 0, 1, "Mejor creador de juego de su generación. Dueño de la asistencia perfecta.", "Pase, visión, disparo, inteligencia, precisión", "Interior derecho, mediapunta"),
    ("Thierry Henry", "Thierry Henry", "1977-08-17", "Francia", "Delantero/Extremo", "Derecha", 188, None, "-", 411, 0, 123, 0, 1, 1, "Leyenda del Arsenal. El mejor jugador de la historia de la Premier en su época.", "Velocidad, finalización, técnica, inteligencia, elegancia", "Extremo izquierdo, delantero centro"),
    ("Zico", "Arthur Antunes Coimbra", "1953-03-03", "Brasil", "Mediapunta", "Derecha", 172, None, "-", 474, 0, 71, 0, 0, 0, "Galo de oro. Genio brasileño, considerado uno de los mejores de la historia.", "Chilena, visión, pase, disparo, creatividad", "Mediapunta ofensivo, enganche"),
    ("Garrincha", "Manoel Francisco dos Santos", "1933-10-28", "Brasil", "Extremo", "Izquierda", 169, None, "-", 231, 0, 50, 0, 2, 0, "Alegría del fútbol. El mejor regateador de la historia. Dos Mundiales (1958, 1962).", "Regate, velocidad, improvisación, desborde, alegría", "Extremo derecho puro"),
    ("George Best", "George Best", "1946-05-22", "Irlanda del Norte", "Extremo", "Izquierda", 175, None, "-", 205, 0, 37, 0, 0, 1, "Quinto Beatle. Genio norirlandés, Balón de Oro 1968. Leyenda del Manchester United.", "Regate, equilibrio, velocidad, creatividad, gol", "Extremo izquierdo, mediapunta"),
    ("Bobby Charlton", "Sir Robert Charlton", "1937-10-11", "Inglaterra", "Centrocampista", "Derecha", 173, None, "-", 249, 0, 106, 1, 1, 1, "Leyenda del Manchester United e Inglaterra. Balón de Oro 1966.", "Disparo, pase, liderazgo, resistencia, técnica", "Centrocampista ofensivo, interior"),
]

TEAMS = [
    ("Real Madrid", "Real Madrid Club de Fútbol", "España", "Estadio Santiago Bernabéu", 85000, 1902, "LaLiga", "Carlo Ancelotti", 35, 34, "El club más laureado del mundo. 15 Champions League. Leyenda del fútbol global."),
    ("FC Barcelona", "Futbol Club Barcelona", "España", "Spotify Camp Nou", 99354, 1899, "LaLiga", "Hansi Flick", 27, 16, "Més que un club. Cuna del tiki-taka y de la Masia. 5 Champions League."),
    ("Manchester City", "Manchester City Football Club", "Inglaterra", "Etihad Stadium", 53400, 1880, "Premier League", "Pep Guardiola", 10, 1, "El equipo dominante de la última década. Primer triplete inglés en 2023."),
    ("Manchester United", "Manchester United Football Club", "Inglaterra", "Old Trafford", 74310, 1878, "Premier League", "Erik ten Hag", 20, 3, "El club más popular del mundo. Leyendas: Busby Babes, Fergie y la clase del 92."),
    ("Liverpool FC", "Liverpool Football Club", "Inglaterra", "Anfield", 61276, 1892, "Premier League", "Arne Slot", 19, 6, "You'll Never Walk Alone. 6 Champions League. Mítica historia europea."),
    ("FC Bayern München", "Fußball-Club Bayern München", "Alemania", "Allianz Arena", 75000, 1900, "Bundesliga", "Vincent Kompany", 33, 6, "Rey de Alemania. 6 Champions League. Dominio absoluto en Bundesliga."),
    ("AC Milan", "Associazione Calcio Milan", "Italia", "San Siro", 75923, 1899, "Serie A", "Sérgio Conceição", 19, 7, "Segundo club más laureado en Champions (7). Leyendas: Maldini, Baresi, Van Basten."),
    ("Inter Milano", "Football Club Internazionale Milano", "Italia", "San Siro", 75923, 1908, "Serie A", "Simone Inzaghi", 20, 3, "Grande Inter. Triplete 2010 con Mourinho. Récord en Serie A."),
    ("Juventus FC", "Juventus Football Club", "Italia", "Allianz Stadium", 41507, 1897, "Serie A", "Thiago Motta", 36, 2, "La Vecchia Signora. Más títulos de Italia. Leyendas: Platini, Del Piero, Buffon."),
    ("Paris Saint-Germain", "Paris Saint-Germain Football Club", "Francia", "Parc des Princes", 47929, 1970, "Ligue 1", "Luis Enrique", 12, 0, "Club de la capital francesa. Era de los petrodólares desde 2011."),
    ("Ajax Amsterdam", "Ajax Amsterdam", "Países Bajos", "Johan Cruyff Arena", 55000, 1900, "Eredivisie", "Francesco Farioli", 36, 4, "Cuna del fútbol total. 4 Champions. Cantera legendaria."),
    ("SL Benfica", "Sport Lisboa e Benfica", "Portugal", "Estádio da Luz", 64642, 1904, "Primeira Liga", "Bruno Lage", 38, 2, "Águila de Lisboa. Más títulos de Portugal. 2 Champions."),
    ("FC Porto", "Futebol Clube do Porto", "Portugal", "Estádio do Dragão", 50033, 1893, "Primeira Liga", "Vítor Bruno", 30, 2, "Dragones. 2 Champions. Fábrica de talentos y entrenadores."),
    ("Borussia Dortmund", "Borussia Dortmund", "Alemania", "Signal Iduna Park", 81365, 1909, "Bundesliga", "Nuri Sahin", 8, 1, "Muro Amarillo. La mejor atmósfera del fútbol europeo. 1 Champions."),
    ("Arsenal FC", "Arsenal Football Club", "Inglaterra", "Emirates Stadium", 60704, 1886, "Premier League", "Mikel Arteta", 13, 0, "Gunners. Invincibles 2003-04. Wenger cambió el fútbol inglés."),
    ("Chelsea FC", "Chelsea Football Club", "Inglaterra", "Stamford Bridge", 40341, 1905, "Premier League", "Enzo Maresca", 6, 2, "Blues de Londres. 2 Champions. Era Abramovic transformó al club."),
    ("Atlético de Madrid", "Club Atlético de Madrid", "España", "Riyadh Air Metropolitano", 70460, 1903, "LaLiga", "Diego Simeone", 11, 3, "Colchoneros. La era Simeone: Liga 2014, 2021 y finales Champions."),
    ("River Plate", "Club Atlético River Plate", "Argentina", "Estadio Monumental", 84000, 1901, "Primera División Argentina", "Marcelo Gallardo", 36, 4, "Millonarios. El más grande de Argentina. 4 Libertadores."),
    ("Boca Juniors", "Club Atlético Boca Juniors", "Argentina", "La Bombonera", 54000, 1905, "Primera División Argentina", "Fernando Gago", 34, 6, "Xeneize. El rey de Sudamérica. 6 Libertadores. Mitad más uno."),
    ("Flamengo", "Clube de Regatas do Flamengo", "Brasil", "Maracanã", 78838, 1895, "Série A", "Filipe Luís", 37, 3, "Mengão. La mayor hinchada de Brasil. 3 Libertadores. Ídolo: Zico."),
    ("Santos FC", "Santos Futebol Clube", "Brasil", "Vila Belmiro", 16068, 1912, "Série A", "Pedro Caixinha", 8, 3, "Cuna de Pelé y Neymar. 3 Libertadores. Histórico del fútbol brasileño."),
    ("São Paulo FC", "São Paulo Futebol Clube", "Brasil", "Morumbis", 72039, 1930, "Série A", "Luis Zubeldía", 6, 3, "Tricolor Paulista. 3 Libertadores. Único brasileño con 3 Mundiales."),
    ("Celtic FC", "Celtic Football Club", "Escocia", "Celtic Park", 60832, 1887, "Scottish Premiership", "Brendan Rodgers", 53, 1, "Bhoyos de Glasgow. 1 Champions (1967). Leyenda: Lisbon Lions."),
    ("Sevilla FC", "Sevilla Fútbol Club", "España", "Ramón Sánchez-Pizjuán", 43883, 1905, "LaLiga", "García Pimienta", 1, 7, "Rey de la Europa League (7 títulos). Leyenda del fútbol andaluz."),
    ("Olympique Lyon", "Olympique Lyonnais", "Francia", "Groupama Stadium", 59186, 1950, "Ligue 1", "Paulo Fonseca", 7, 0, "Siete ligas consecutivas (2002-2008). Cantera de clase mundial."),
]

COMPETITIONS = [
    ("FIFA World Cup", "Selecciones", "Mundial", 1930, "Argentina", "Brasil", 5, "El torneo más importante del fútbol mundial. Cada 4 años."),
    ("UEFA Champions League", "Clubes", "Europa", 1955, "Real Madrid", "Real Madrid", 15, "La máxima competición de clubes del mundo."),
    ("UEFA Europa League", "Clubes", "Europa", 1971, "Atalanta", "Sevilla", 7, "Segunda competición europea de clubes."),
    ("Copa América", "Selecciones", "Sudamérica", 1916, "Argentina", "Argentina/Uruguay", 16, "El torneo de selecciones más antiguo del mundo."),
    ("UEFA European Championship", "Selecciones", "Europa", 1960, "España", "España", 4, "Eurocopa. El torneo de selecciones europeas."),
    ("Copa Libertadores", "Clubes", "Sudamérica", 1960, "Botafogo", "Independiente", 7, "La Champions de Sudamérica."),
    ("Premier League", "Clubes", "Inglaterra", 1992, "Manchester City", "Manchester United", 20, "La liga más vista del mundo."),
    ("LaLiga", "Clubes", "España", 1929, "Real Madrid", "Real Madrid", 36, "Liga española de fútbol profesional."),
    ("Serie A", "Clubes", "Italia", 1898, "Inter Milano", "Juventus", 36, "Liga italiana de fútbol."),
    ("Bundesliga", "Clubes", "Alemania", 1963, "Bayer Leverkusen", "FC Bayern München", 33, "Liga alemana de fútbol."),
    ("Ligue 1", "Clubes", "Francia", 1932, "Paris Saint-Germain", "Paris Saint-Germain", 12, "Liga francesa de fútbol."),
    ("Africa Cup of Nations", "Selecciones", "África", 1957, "Costa de Marfil", "Egipto", 7, "Copa Africana de Naciones."),
    ("AFC Asian Cup", "Selecciones", "Asia", 1956, "Qatar", "Japón", 4, "Copa Asiática."),
    ("CONCACAF Gold Cup", "Selecciones", "Norteamérica", 1963, "México", "México", 12, "Copa Oro de la CONCACAF."),
    ("FIFA Club World Cup", "Clubes", "Mundial", 2000, "Manchester City", "Real Madrid", 5, "Campeonato mundial de clubes."),
    ("Ballon d'Or", "Individual", "Mundial", 1956, "Lionel Messi", "Lionel Messi", 8, "Premio al mejor jugador del mundo."),
]


def seed_database():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM players")
    if cursor.fetchone()[0] > 0:
        conn.close()
        return

    for p in PLAYERS:
        cursor.execute(
            """INSERT INTO players
               (name, full_name, birth_date, nationality, position, dominant_foot, height,
                current_club, market_value, career_goals, career_assists, caps,
                ballon_dors, world_cups, champions_league, description, strengths, playing_style)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            p,
        )

    for t in TEAMS:
        cursor.execute(
            """INSERT INTO teams
               (name, full_name, country, stadium, stadium_capacity, founded_year, league,
                manager, titles_domestic, titles_international, description)
               VALUES (?,?,?,?,?,?,?,?,?,?,?)""",
            t,
        )

    for c in COMPETITIONS:
        cursor.execute(
            """INSERT INTO competitions
               (name, type, region, founded_year, current_champion, most_titles, most_titles_count, description)
               VALUES (?,?,?,?,?,?,?,?)""",
            c,
        )

    conn.commit()
    conn.close()
    print(f"OK - DB seeded: {len(PLAYERS)} players, {len(TEAMS)} teams, {len(COMPETITIONS)} competitions")


if __name__ == "__main__":
    seed_database()
