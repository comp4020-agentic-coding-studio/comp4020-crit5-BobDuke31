# Process overview

## What I built

I built Steady Hand, a small browser game where the player drags a bead along a path without touching the edge. The final version has three levels with increasing difficulty, a timer, clear win and loss states, and a more complete arcade style visual design.

## The moments that mattered

### 1. Turning the first prototype into a real game

The first version passed the automated checks, but when I played it myself the interaction was unclear and the page felt more like a technical demo than a finished game. The easy option was to keep patching the single path prototype. Instead, I changed it into a proper drag interaction and expanded the same mechanic into three levels with a timer. This kept the game simple while giving it progression. I played through the levels myself and ran the project checks before keeping this direction.

Evidence: [`9ef31b4`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit5-BobDuke31/commit/9ef31b4)

### 2. Fixing collision instead of hiding the problem

Manual testing showed that the bead could sometimes be marked as outside the track while it still looked visually inside, especially around corners. Simply increasing the tolerance would have hidden the symptom without making the rule match the visible track. I instead corrected the collision logic and tested the problem cases again in the browser. I also reran `pnpm check` to make sure the change did not break the game rules or build.

Evidence: [`f76eb92`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit5-BobDuke31/commit/f76eb92)

### 3. Improving the presentation while keeping the game self-teaching

Once the game worked, the page still felt too empty. Adding more explanatory text would have been an easy way to make the interaction clearer, but that would work against the Crit 5 no instructions requirement. I redesigned the page as a fuller arcade style interface while keeping the bead, track and goal visually understandable on their own. Continued manual play then exposed more interaction bugs, so I kept correcting and retesting the game instead of treating the visual redesign as finished.

Evidence: [`d6acd7e...71cef04`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit5-BobDuke31/compare/d6acd7e...71cef04)