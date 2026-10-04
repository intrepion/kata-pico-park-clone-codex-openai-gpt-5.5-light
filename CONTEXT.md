# Pocket Park

Pocket Park is an original cooperative browser puzzle-platformer inspired by Pico Park. Its domain language focuses on small local co-op puzzles where players must coordinate under visible constraints.

## Language

**Pocket Park**:
The working product name for this original Pico Park-inspired game.
_Avoid_: Pico Park clone, Pico Park

**Local Party**:
The group of two to four players sharing one browser and one keyboard.
_Avoid_: Lobby, online room, team

**Pip**:
A playable square character controlled by one member of the Local Party.
_Avoid_: Avatar, hero, cat

**Solo Swap**:
A fallback control mode where one person alternates control between multiple Pips to test or play cooperative puzzles alone.
_Avoid_: Single-player mode, AI partner

**Idle Pip**:
A Pip that remains physically present and reactive while no player is actively pressing its controls.
_Avoid_: Frozen character, parked player

**Cooperation Rule**:
A puzzle constraint that requires more than one Pip to solve.
_Avoid_: Mechanic, gimmick

**Body Stack**:
A vertical arrangement of Pips used to reach spaces that a single Pip cannot reach.
_Avoid_: Tower, ladder, pile

**Stable Stack**:
A Body Stack whose lower Pips are grounded or moving slowly enough to support predictable climbing.
_Avoid_: Locked stack, rigid tower

**Shared Key**:
A key carried by the Local Party as a group resource rather than as an individual inventory item.
_Avoid_: Inventory key, personal key

**Pressure Plate**:
A floor switch held active only while a Pip or block rests on it.
_Avoid_: Button, switch

**Timed Door**:
A passage that opens for a short window after a Cooperation Rule is satisfied.
_Avoid_: Gate, timed gate

**Group Exit**:
A level finish condition requiring every Pip to reach the exit area.
_Avoid_: Finish line, solo exit, goal

**Instant Restart**:
A forgiving reset that immediately returns the current level to its starting state without lives or permanent penalty.
_Avoid_: Death, game over, punishment

**Coyote Jump**:
A jump accepted just after a Pip has left solid ground, preserving tight platforming while reducing keyboard frustration.
_Avoid_: Late jump, jump grace

**Stage Set**:
The six handcrafted levels that introduce Cooperation Rules one at a time and end with a mixed-rule finale.
_Avoid_: Campaign, world, map pack

**Teaching Stage**:
A Stage Set level that introduces exactly one primary Cooperation Rule.
_Avoid_: Tutorial, lesson

**Mixed Finale**:
The final Stage Set level that combines several previously introduced Cooperation Rules.
_Avoid_: Boss level, final exam

**Fixed Frame**:
A level camera that shows the playable space without following individual Pips.
_Avoid_: Follow camera, dynamic camera

**One-Screen Level**:
A level designed so the Local Party can understand the full cooperative situation at once.
_Avoid_: Split-screen level, sprawling level

**Push Block**:
A simple movable block used as a readable prop for holding Pressure Plates.
_Avoid_: Crate, box, Sokoban block

**Elapsed Timer**:
A visible clock that measures completion time without causing failure.
_Avoid_: Countdown, time limit

**Controls Reference**:
An on-screen display of the fixed keyboard bindings.
_Avoid_: Remap screen, settings panel

**Arcade Stage**:
The tiny theatrical visual frame for Pocket Park levels, emphasizing readable play spaces with playful arcade personality.
_Avoid_: Diorama, paper world, minimalist blocks

**Pip Mark**:
A non-color symbol paired with each Pip's color and face so players can distinguish Pips at a glance.
_Avoid_: Costume, skin, color-only identity

**After-Hours Playground Arcade**:
The cohesive visual theme for the Stage Set, blending playground equipment, arcade signage, and quiet closed-at-night staging.
_Avoid_: Theme worlds, biome set, level skins

**Feedback Cue**:
A readable animation, icon, or sound that confirms a puzzle-state change.
_Avoid_: Text prompt, tutorial message

**Sound Effect Set**:
The small generated audio vocabulary for keys, Pressure Plates, Timed Doors, Group Exit completion, and restarts.
_Avoid_: Soundtrack, music system

**Accessibility Floor**:
The minimum player-inclusion standard for the MVP: non-color identifiers, mute, reduced motion, and readable contrast.
_Avoid_: Accessibility pass, polish
