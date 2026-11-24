# Debate Judge

Argue with a friend out loud. Tap whoever is talking, the app transcribes the argument live, and Claude scores it like a fight: three judges, a decision, fouls, fact checks and a roast.

Works on iPhone (Safari), Android and desktop.

## How it works

- **Live transcription:** the browser's built-in speech recognition (Web Speech API), so there's no audio upload and no extra API. It auto-restarts when iOS ends a session, guards against Safari re-sending results it already sent, and when you tap the other corner mid-sentence, it gives the words so far to the person who was talking.
- **Judging:** `api/judge.js` is a serverless function. It builds the prompt on the server, so the page can't be used to run arbitrary prompts, and calls the Claude API. Three judges score each person from 0 to 10:
  - *The Logician:* reasoning
  - *The Fact-Checker:* evidence and accuracy
  - *The Crowd:* persuasion and humor
- **Deterministic verdict:** Claude only gives the scores. The page counts the judges and decides unanimous, split or majority decision, draw or TKO, so the verdict always matches the scorecards.
- **Announcer:** reads the scorecards out loud using the device's built-in text-to-speech.
- **No database:** the current fight is saved in `localStorage` on your phone.

## Deploy (about 5 minutes)

1. Get an API key at [console.anthropic.com](https://console.anthropic.com).
2. Push this folder to a new GitHub repo.
3. On [vercel.com](https://vercel.com), go to **Add New → Project** and import the repo. You don't need a framework preset or build command.
4. In **Environment Variables**, add `ANTHROPIC_API_KEY`. Optionally add `APP_PASSCODE` so people with the link can't spend your credits.
5. Click **Deploy**, then open the URL in **Safari** on your iPhone. The first time you tap a corner, allow the microphone and speech recognition.

If the mic won't start on iPhone, check that Dictation is turned on in your keyboard settings. In Safari, tap **aA** in the address bar, open **Website Settings** and allow the microphone.

## Run locally

```bash
cp .env.example .env   # add your key
node dev-server.js     # http://localhost:3000
```

Or use `vercel dev` with the Vercel CLI.

## Config

| Variable | Required | What it does |
|---|---|---|
| `ANTHROPIC_API_KEY` | yes | Your Claude API key, kept on the server only |
| `APP_PASSCODE` | no | Requires a passcode before judging |
| `MODEL` | no | Defaults to `claude-sonnet-5-5`; `claude-haiku-5-5` is faster and cheaper |
