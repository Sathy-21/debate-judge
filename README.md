# Debate Judge

Argue with a friend out loud. Tap whoever is talking, the app transcribes the argument live, and Claude scores it like a fight: three judges, a decision, fouls, fact checks and a roast.

Works on iPhone (Safari), Android and desktop.

## How it works

- **Live transcription:** the browser's built-in speech recognition (Web Speech API), so there's no audio upload and no extra API. It auto-restarts when iOS ends a session, guards against Safari re-sending results it already sent, and when you tap the other corner mid-sentence, it gives the words so far to the person who was talking.
- **Judging:** `api/judge.js` is a serverless function. It builds every prompt on the server, so the page can't be used to run arbitrary prompts. Judging runs in three stages:
  1. **Independent judges, in parallel.** Three separate Claude Opus calls run at the same time. Each one sees only the transcript, not the other judges' scores, so split decisions are real disagreements. Each judge scores both people from 0 to 10 on one thing and also returns its specialty:
     - *The Logician:* reasoning, plus fouls
     - *The Fact-Checker:* evidence and accuracy, plus fact checks
     - *The Crowd:* persuasion and humor, plus the best line
  2. **Deterministic verdict.** Code, not the model, turns the three cards into a unanimous, split or majority decision, draw or TKO, so the verdict always matches the scorecards.
  3. **Announcer.** A final Claude Sonnet call gets the official result and writes the headline, a coaching tip for each person, and the roast, so the story can't contradict the score.
- **Free-fight limit:** each phone gets 2 judged fights, so a shared link can't drain your API credits. The server counts fights in Upstash Redis: per device using a random ID, plus a backup cap of 10 per network per day so private browsing can't reset it. A fight is reserved atomically before any Claude call, so blocked fights cost nothing, and it's handed back if judging fails. Opening the site once with `#owner=YOUR_OWNER_CODE` makes that phone unlimited.
- **Resilience:** each judge retries once if it fails, a fight still gets scored if two of the three judges come back, and the announcer falls back to a plain headline if it fails.
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
| `JUDGE_MODEL` | no | Model for the three judges. Defaults to `claude-opus-5-5`; `claude-fable-5-2` is the strongest and `claude-sonnet-5-5` is the fastest |
| `JUDGE_EFFORT` | no | How hard the judges think: `low`, `medium` (default) or `high` |
| `ANNOUNCER_MODEL` | no | Model for the headline, coaching and roast. Defaults to `claude-sonnet-5-5` |
| `OWNER_CODE` | no | Unlimited fights for any phone that has it, set by opening `/#owner=CODE` once |
| `FREE_FIGHTS` | no | Free fights per device. Defaults to `2` |
| `NETWORK_FIGHTS_PER_DAY` | no | Backup cap per IP address per day. Defaults to `10` |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | for limits | Added automatically when you connect Upstash for Redis in Vercel → Storage. `UPSTASH_REDIS_REST_URL` / `_TOKEN` also work. Without them, there are no limits. |
