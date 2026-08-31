# Crit 5 Reflection

## What was the breakthrough that moved the work forward?

The breakthrough was repeatedly playing the game myself instead of accepting that it worked because the automated tests passed. The first version was technically functional, but it was too simple, visually empty, and the drag interaction was not clear enough. After testing it, I expanded the game into three levels with a timer and improved the visual design.

Manual testing also exposed several problems that were difficult to notice from the code alone. The collision sometimes disagreed with the visible path, and later the game could fail immediately or stop allowing another drag after a failed attempt. Finding these problems through actual play changed the direction of the work more than adding extra features did.

## What did this work change about who I want to be as a software developer?

This work reinforced that automated checks are useful for confirming rules and preventing regressions, but they cannot tell me whether an interactive product actually feels correct to use. Several versions passed the tests while still having obvious problems when I played them.

I want to use agents for implementation, investigation and repeated technical testing, while keeping direct control over the final interaction and visual decisions. When something feels wrong in the browser, I need to keep testing and correcting it even when the code appears correct.