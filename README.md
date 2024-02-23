# Bundestag-Live
🔔 Discord-Bot für Live-Benachrichtigungen aus dem Bundestag. 🎥🏛️

---

Dieser Bot überwacht den YouTube-Kanal auf Live-Übertragungen des Bundestags. Wenn eine Live-Übertragung erkannt wird, sendet der Bot eine Benachrichtigung in den angegebenen Discord-Channel mit Details zum Livestream.

Der Live-Status wird alle 5 Minuten überprüft.

## Installation

Um den Bot nutzen zu können benötigst du:
- Einen Discord Bot Token. Melde dich hierzu im [Discord Developer Portal](https://discord.com/developers/applications) an und erstelle einen Bot.
- Einen [YouTube API Key](https://developers.google.com/youtube/v3/getting-started?hl=de).
- Eine YouTube Channel ID. Für den YouTube-Kanal des [Bundestages](https://www.youtube.com/channel/UCbh5D3EdIHP4YQA5X-eK1ug) wäre dies die `UCbh5D3EdIHP4YQA5X-eK1ug`
- Eine Discord Channel ID. In diesen Discord-Kanal wird die Benachrichtigung gesendet. Rechtsklicke auf den Discord-Kanal und wähle die Schaltfläche „Kanal-ID kopieren” aus. [Hier](https://i.toaaa.de/i/bbe8w.png) ein Bild. Falls diese Schaltfläche nicht erscheint, versuche den Entwicklermodus auf Discord zu aktivieren. Navigiere hierzu in die Discord-Einstellungen > App-Einstellungen > Erweitert > Entwickermodus.

1. Klone das Repository:

   ```bash
   git clone https://github.com/dein-benutzername/bundestag-live-bot.git
   ```

2. Installiere die Abhängigkeiten:

   ```bash
   npm install
   ```

3. Kopiere die `.env.example`-Datei und benenne sie in `.env` um. Fülle die Variablen in der `.env`-Datei aus.

4. Starte den Bot:

   ```bash
   npm run build
   npm run start
   ```
