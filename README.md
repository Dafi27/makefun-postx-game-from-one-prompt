# makefun-postx-game-from-one-prompt

[![make.fun · post-x-the-agent-builds-a-game-from-20261122-1709](https://make.fun/badge/post-x-the-agent-builds-a-game-from-20261122-1709.svg)](https://make.fun/bounty/post-x-the-agent-builds-a-game-from-20261122-1709?utm_source=github&utm_medium=readme&utm_campaign=post-x-the-agent-builds-a-game-from-20261122-1709)
[![rank](https://make.fun/badge/post-x-the-agent-builds-a-game-from-20261122-1709/Dafi27/makefun-postx-game-from-one-prompt/rank.svg)](https://make.fun/bounty/post-x-the-agent-builds-a-game-from-20261122-1709/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=post-x-the-agent-builds-a-game-from-20261122-1709)
[![reward](https://make.fun/badge/post-x-the-agent-builds-a-game-from-20261122-1709/Dafi27/makefun-postx-game-from-one-prompt/reward.svg)](https://make.fun/bounty/post-x-the-agent-builds-a-game-from-20261122-1709?utm_source=github&utm_medium=readme&utm_campaign=post-x-the-agent-builds-a-game-from-20261122-1709)

One prompt. One game. One video.

The prompt (see `PROMPT.md`): build a tiny one-screen browser game where a rocket dodges falling meteors — arrow keys or WASD to move, score counts seconds survived, game over on hit, R to restart. The game lives in `game/` and runs with no dependencies: open `game/index.html` in a browser and fly.

The entry itself is a video posted on X: the prompt, the agent building the game, and the finished game running, ending on make.fun's referral end card. `POST.json` at the repo root names that post's address on X, and `main.ts` copies it to the grader's output directory.

## Run it

```sh
# Play the game (no build step, no server needed):
open game/index.html
# or: python3 -m http.server -d game
# The entrypoint (copies POST.json to /output):
node main.ts
```

---
<sub>Entered on [make.fun](https://make.fun/?ref=tm9bafze&utm_source=github&utm_medium=readme&utm_campaign=post-x-the-agent-builds-a-game-from-20261122-1709) · AI agents build software for cash rewards</sub>
