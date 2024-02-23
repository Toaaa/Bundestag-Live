# Bundestag-Live
🔔 Discord-Bot für Live-Benachrichtigungen aus dem Bundestag. 🎥🏛️

> Dieses Projekt wurde durch [Bundesgit](https://github.com/Bundestag) inspiriert.
---

Dieser Bot überwacht den YouTube-Kanal auf Live-Übertragungen des Bundestags. Wenn eine Live-Übertragung erkannt wird, sendet der Bot eine Benachrichtigung in den angegebenen Discord-Channel mit Details zum Livestream.

Der Live-Status wird alle 5 Minuten überprüft.

> Du kannst den Bot hier einladen: [Einladen](https://discord.com/api/oauth2/authorize?client_id=1210581379155370094&permissions=277025508352&scope=applications.commands+bot)

## Installation

Um den Bot nutzen zu können benötigst du:
- Einen Discord Bot Token. Melde dich hierzu im [Discord Developer Portal](https://discord.com/developers/applications) an und erstelle einen Bot.
- Einen [YouTube API Key](https://developers.google.com/youtube/v3/getting-started?hl=de).
- Eine YouTube Channel ID. Für den YouTube-Kanal des [Bundestages](https://www.youtube.com/channel/UCbh5D3EdIHP4YQA5X-eK1ug) wäre dies die `UCbh5D3EdIHP4YQA5X-eK1ug`
- Eine Discord Channel ID. In diesen Discord-Kanal wird die Benachrichtigung gesendet. Rechtsklicke auf den Discord-Kanal und wähle die Schaltfläche „Kanal-ID kopieren” aus. [Hier](https://i.toaaa.de/i/bbe8w.png) ein Bild. Falls diese Schaltfläche nicht erscheint, versuche den Entwicklermodus auf Discord zu aktivieren. Navigiere hierzu in die Discord-Einstellungen > App-Einstellungen > Erweitert > Entwickermodus.

1. Klone das Repository:

   ```bash
   git clone https://github.com/Toaaa/bundestag-live-bot.git
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

## Konfiguration

Um den Bot zu konfigurieren, lade ihn auf einen deiner Server ein, gehe in einen beliebigen Textkanal und schreibe `/kanal` um den Benachrichtigungskanal festzulegen.

## Beispiel

![Beispielbild einer eingebetteten Nachricht die der Bot gesendet hat. In der Nachricht ist ein Hyperlink namens 'Der Bundestag ist Live!' welcher zum YouTube-Livestream der 155. Sitzung des Deutschen Bundestages führt. Darunter ein Text der lautet "Bundestag live: 155. Sitzung des Deutschen Bundestages". In der Fußzeile der eingebetteten Nachricht steht "Bundestag Live Ankündigung • oaDMmqu35As•heute um 16:16 Uhr". Rechts in der eingebetteten Nachricht befindet sich das Thumbnail des Livestreams.](https://i.toaaa.de/i/tch40.png)
