+++
title = "Making RUST-RL, a roguelike in Rust, over a 7-week sprint"
date = 2023-07-04
+++

*roguelikedev does the complete tutorial* is a yearly sprint where people follow (or make) a tutorial which goes from setting up an environment to having something playable. Usually entries finish off having a procgen level, some equippable items and scrolls, and mobs. It lasts 8 weeks.

I've taken part a few times but didn't share my progress. These are some week-by-week notes from my entry in 2023. Generally I only wrote down the places I did things a little differently.

I wrote my game in Rust, used [bracket-lib](https://github.com/amethyst/bracket-lib) and data-heavy ECS design, and didn't end up giving it a name. The repo is [here](https://git.ily.rs/lew/rust-rl). The releases can be found on the GitHub mirror.

## Week 1: brogue-like colour offsets and fast_fov

A boring, placeholder map, goblins that attack the player, and field of view.

I stared at a horrible-looking game for a while as I tried to figure out how to make it look nice using only ASCII. I started with a green-blue hue applied globally, and ended up with a combination of that and brogue-like colour offsets.

1. Every entity has a static colour.
2. On top, there's a green-blue hue applied to everything. It's only small but gives some amount of unified appearance to everything. Reminds me a bit of sci-fi terminals where everything is tinted orange or green.
3. On top of that, there's an RGB-offset applied. The first time I tried this I had it generate during render-time and blinded myself as everything rapidly changed colours 60 times a second. I moved the offset to being generated on map generation; when generated, an RGB offset is generated for every tile, and that offset is applied on top of the colour of anything on the given tile.

It ends up looking something like this. Things change colours slightly as they move around, which I like.

{{ img(src="1.png", alt="a screenshot of rust-rl showing brogue-like colour offsets", caption="Brogue-like colours.") }}

I worked on telepathy too, which ended up having me port [elig's fastfov pseudocode](https://www.roguebasin.com/index.php/Eligloscode) from roguebasin into Rust.

For regular viewsheds I used bracket-lib's symmetric shadowcasting. It's symmetrical, so it's good for viewsheds shared across many entities, but it's also symmetrical, so it's expensive to run. Telepathy doesn't symmetry because it's rare, typically low-range, and very few tiles will ever block it, which is where most issues with assymetry come from in the first place: actors with a shared viewshed being differing distances away from an occluding corner.

Here's my implementation. I made it lean with a ray every 4 degrees. With a small viewshed, the lack of precision makes no difference; I still don't miss any tiles, and it's just 4x faster than shooting a ray every 1 degree.

```rust
pub fn fast_fov(
    p_x: i32,
    p_y: i32,
    r: i32,
    map: &WriteExpect<Map>
) -> Vec<Point> {
    let mut visible_tiles: Vec<Point> = Vec::new();
    let mut i = 0;
    while i <= 360 {
        let x: f32 = f32::cos((i as f32) * (0.01745 as f32));
        let y: f32 = f32::sin((i as f32) * (0.01745 as f32));
        let mut ox: f32 = (p_x as f32) + (0.5 as f32);
        let mut oy: f32 = (p_y as f32) + (0.5 as f32);
        for _i in 0..r {
            let (ox_i32, oy_i32) = (ox as i32, oy as i32);
            visible_tiles.push(Point::new(ox_i32, oy_i32));
            if
                ox_i32 >= 0 &&
                ox_i32 < map.width &&
                oy_i32 >= 0 &&
                oy_i32 < map.height &&
                tile_blocks_telepathy(
                    map.tiles[map.xy_idx(ox_i32, oy_i32)]
                )
            {
                break;
            }
            ox += x;
            oy += y;
        }
        i += 4;
    }
    visible_tiles
}
```

There's some really dirty casting and assorted garbage in there, but it works. Eventually I'll want to be able to pass a function into `fast_fov` rather than just hardcoding the telepathy check, and to change the frequency of the rays.

Nothing blocks telepathy right now, so it just returns false. Here's an idea of how `tile_blocks_telepathy` could look eventually.

```rust
pub fn tile_blocks_telepathy(tt: TileType) -> bool {
    match tt {
        TileType::Lead => true,
        _ => false,
    }
}
```

## Week 2: procgen dungeon maps with chained builders

Got started with procedural generation and turned walls from `#` to box-drawing characters with a simple bitmask. My maps are made with a chained builder pattern.

Instead of a function generating a map from some parameters, a series of functions exist which accept some build data, apply something to it, and then return the modified build data. Eventually a function is called to finalise the build and turn the build data into an actual map.

Here's an example.

```rust
let mut builder = MapBuilder::new(depth, width, height);
builder.start_with(BspDungeonBuilder::new());
builder.with(RoomSorter::new(RoomSort::CENTRAL));
builder.with(RoomDrawer::new());
builder.with(BresenhamCorridors::new());
builder.with(RoomCornerRounder::new());
builder.with(RoomBasedStartingPosition::new());
builder.with(DistantExit::new());
builder.with(RoomBasedSpawner::new());
```

Every step is optional, so chains can be as simple or complicated as you want. Some of the steps do enable functionality though: a player wont be able to spawn on a map without a starting position.

(Making defaults would probably be sensible, like defaulting to a `RandomStartingPosition` if nothing else is given.)

To break down the above, this is what everything is doing:

```rust
let mut builder = MapBuilder::new(depth, width, height);
builder.start_with(BspDungeonBuilder::new());
```

A blank map gets made with the given dimensions, and starts off with a single step of a binary-space partioning (BSP) algorithm. This splits the map into empty rects. Info about where the rects are is stored in the build data as a list of rooms.

```rust
builder.with(RoomSorter::new(RoomSort::CENTRAL));
```

This step sorts the rooms. It starts from the centre of the map (`RoomSort::CENTRAL`) and sorts the rooms from nearest-to-furthest, which ends up being roughly a spiral. This doesn't do anything by itself, but it's useful later.

```rust
builder.with(RoomDrawer::new());
builder.with(BresenhamCorridors::new());
```

Following our sorted order from centre-most to outer-most, the `RoomDrawer` draws every room to the map, and then Bresenham lines get drawn from centre-to-centre to connect them. Because we sorted it how we did, the map "starts" in the centre and expands outwards.

```rust
builder.with(RoomCornerRounder::new());
```

Iterate through all the rooms, and fill in the corners a little to make it look more natural. Not as natural as a cave, but good for something like a warren. This would be a good place for parameters to decide how many of the rooms are affected, and by how much, they get rounded by.

```rust
builder.with(RoomBasedStartingPosition::new());
builder.with(DistantExit::new());
builder.with(RoomBasedSpawner::new());
```

The player will start in a room, the exit will be placed as far away as possible, and monsters will *only* spawn within rooms. They can still wander out of them, but the corridors will start off clear.

Here's what we ended up with on a test run.

{{ img(src="2.png", alt="a screenshot of rust-rl showing a generated map using chained builders", caption="A map generated from chained builders.") }}

## Week 3: data-driven entities and squads of enemies

Everything is driven by JSON now. Here's an entity.

```json
{
    "id": "treant_small",
    "name": "treant sapling",
    "renderable": { "glyph": "♠️", "fg": "#10570d", "bg": "#000000", "order": 1 },
    "flags": ["LARGE_GROUP", "GREEN_BLOOD", "FIRE_WEAK"],
    "level": 2,
    "bac": 12,
    "speed": 3,
    "attacks": [{ "name": "lashes", "hit_bonus": 4, "damage": "1d8" }],
    "loot": { "table": "scrolls", "chance": 0.05 }
}
```

Everything needs an ID and a name; everything else is optional. From the top:
- `name` is the player-facing name of the entity, shown in the chatlog, etc.
- `renderable` makes it visible: it's a green spade, and it's `"order": 1`, so it's always drawn on top of anything else.
- `flags` here mean it always tries to spawn in a large group of other mobs. It can spawn alone, but it'll prefer a squad: rare groves of vast numbers of treants. It has green blood instead of the standard red, and it takes extra damage from fire-type attacks.
- it starts off at level 2
- `bac` is Base Armour Class. I use an Advanced Dungeons and Dragons (AD&D) system for combat. A lower `bac` means harder to hit. A treant is big and slow, so it's slightly easier to hit than average.
- `speed` is 3. My base speed is 12, so a treant is extremely slow. On average, it moves every 4 real turns.
- `attacks` is an array of attacks the creature has. The treant doesn't have multiattacks, so it just has the one lash.
- and it has a 0.05 (5%) chance to drop something from the `scrolls` loot table.

Mixing and matching these components and flags is how every single creature is made, so making new creatures is extremely simple. An ogre is pretty similar to this treant, but it has `SMALL_GROUP` instead of large, stronger combat stats across the board, and it loses the green blod and fire weakness.

I thought about a `copy_from` field so I could copy from elsewhere and only specify the things that are different, but I don't like inheritance here. The point is simplicity, not typing out a creature quickly.

```json
"id": "mobs",
"table": [
    { "id": "sheep_little",         "weight": 1,    "difficulty": 0},
    { "id": "chicken",              "weight": 1,    "difficulty": 1},
    { "id": "rat",                  "weight": 1,    "difficulty": 1},
    { "id": "goblin",               "weight": 3,    "difficulty": 1},
    { "id": "kobold",               "weight": 1,    "difficulty": 1},
    { "id": "fox",                  "weight": 1,    "difficulty": 1},
    { "id": "jackal",               "weight": 4,    "difficulty": 1},
    { "id": "deer_little",          "weight": 1,    "difficulty": 1},
    { "id": "treant_small",         "weight": 1,    "difficulty": 1},
    { "id": "zombie_kobold",        "weight": 1,    "difficulty": 1}, 
    { "id": "zombie_gnome",         "weight": 1,    "difficulty": 2}, 
```

There's how my mobs table looks. There's a table like this for everything that can spawn. Mobs are pretty flat because I like how Nethack more or less lets anything spawn anywhere, but items are more atomic for the opposite reason: I like having item spawns be specific to their location or dropping mob.

Another feature I like, using this same system, is squads of enemies spawning alongside matching features.

```json
"id": "squad_kobold",
"table": [
    { "id": "kobold",              "weight": 3,    "difficulty": 1},
    { "id": "kobold_large",        "weight": 2,    "difficulty": 2}
]
```

Squads are tied to terrain features. Rather than the per-turn rolling for individual (or groups of) entities to spawn, squads are spawned in alongside specific map features at generation time. For example, a barracks within a dungeon: a barracks rolls for a category of inhabitant, and for a size. A kobold squad of size 10 would make 10 rolls on the `squad_kobold` table above, and would average out at 6 regular kobolds led by 4 large kobolds, who'd all spawn in alongside their beds and chests in a barracks room.

## Week 4: entity speeds

I tried to come up with my own system. There are so many existing methods for speed which are better than anything I could come up with on limited time, but I wanted to see how my own would turn out.

I opted for a modified Nethack-style implementation of only randomising speeds that *aren't* a whole-number multiple of the standard clock speed. This effectively eliminates energy-counting for slower entities by making it random on which turns they get to act, while keeping the average turns they get to take over their lifetime (unless you kill them) exactly the same. Counting still exists, in theory, for entities which have a whole multiple of the standard clock speed less than the player's—for example, the player having exactly 2x the clock speed, while an entity has exactly 1x—but I think this is more interesting than a negative; if a player manages to reach such a high speed, and then faces an enemy significantly slower, *and* knows exactly what their speed is, I think the reward of being able to count energy and dance in-and-out of range is well-earned.

```rust
for every entity with a speed {
    energy_potential = speed * any modifiers
    // Add to the entity's energy in whole increments of CLOCK_SPEED.
    while energy_potential >= CLOCK_SPEED {
        energy_potential -= CLOCK_SPEED
        energy += CLOCK_SPEED
    }
    // Roll to determine if we add the remainder.
    while energy_potential is leftover {
        roll = random number from 1 to CLOCK_SPEED
        if roll <= energy_potential {
            energy += CLOCK_SPEED
        }
    }
    // Grant a turn if energy is more than the cost of a turn.
    if energy >= TURN_COST {
        energy -= TURN_COST
        entity is granted a turn
        if entity is the player {
            set to PLAYER_TURN runstate
        }
    }
}
```

In my game, `CLOCK_SPEED` is 12, and `TURN_COST` is 36. There's a distinction here between game ticks and turns. A turn is when the clock gains enough energy to take an action: it's increments the turn counter, ticks down effects with a duration, hunger, etc. Multiple game ticks happen within each turn. In my case, that number is three game ticks per turn, because it keeps things fast. If I wanted more incremental stuff to happen between my game turns, or have entities with a speed significantly faster than the clock (Cogmind comes to mind), this could be increased by increasing `TURN_COST`. If it was 120 instead, there'd be 10 game ticks within a single turn of the clock instead. Most mobs have a speed that is the same as the clock.

This is how turn order would play out for three entities:
- "slow mob" has a speed of 3.
- "normal mob" has a speed of 12.
- "fast mob" has a speed of 16.

```rust
TICK 0
slow mob has 0 energy.
normal mob has 0 energy.
fast mob has 0 energy.

TICK 1
slow mob rolls a 1d12 and gets 4, so it gains nothing.
normal mob gains 12 energy.
fast mob gains 12 energy. It rolls a 3, so gains another 12.

TICK 2
slow mob rolls a 6, so it gains nothing.
normal gains 12 energy. It has 24 total.
fast mob gains 12, and rolls a 2, so gains another 12. 48 total.
fast mob has more than 36 energy, the turn cost, so takes a turn.
fast mob still has 12 energy left.

TICK 3
slow mob rolls a 1, so gains 12 energy.
normal mob gains 12. It has 36 total.
normal mob takes a turn.
normal mob has 0 energy left.
fast mob gains 12, rolls a 1, and gains another 12. 36 total.
fast mob takes another turn.
fast mob has 0 energy left.
```

Just as well, the fast mob could roll poorly and gain no extra turns compared to the normal mob in such a short number of game ticks. But over the course of the whole game, it should end up being exactly 33% faster than the normal mob.

## Week 5: week off

I was busy on week 5. I didn't start anything significant.

- logs on the same game tick share a line, `The goblin hits you. You died.`
- groupsize flags (`LARGE_GROUP`, `SMALL_GROUP`) used to just work on initial generation, but they were made to work with every form of entity spawning this week
- that's about it

I did realise this week that the entity system combined with an extremely free-form loot system allows for some cool stuff to happen. For example, there's nothing saying a lamb or a fawn can't be a loot drop. This is what happened here—I changed the loot table for animals to drop other animals, then went into the generic rat-house-in-starter-town and killed some rats. One dropped a fawn, and one dropped a lamb: both fully functioning entities, that then wandered off and tried to escape danger.

{{ img(src="5.png", alt="a screenshot of rust-rl showing a lamb and a fawn spawned in", caption="A lamb and a fawn.") }}

## Week 6: visuals, backtracking, unids, and encumbrance

The entire week is more or less able to be summed up in one image.

{{ img(src="4.png", alt="a screenshot of rust-rl and its full user interface", caption="The full user interface.") }}

There's a side-panel showing everything in the backpack and everything in sight, keyed by glyph, and with names coloured by identification status.

Categories of items each have their own scheme for what "unidentified" looks like: potions are some combination of `adjective colour potion` (*effervescent green potion*), wands are `adjective wand` (*spiked wand*), and scrolls are `GIB BER RISH scroll` (*SH KHAFH scroll*). Identifying something happens on a type of item basis. If you identify one health potion, you'll immediately identify other health potions, and wont have to figure out what they are again. I also added an option of defining one-off obfuscations for special cases, so I can cherry pick out special items to have different schemes.

Encumbrance is in too. There are varying levels of overweightness, with the specific boundaries determined by strength, each slowing entities down by roughly 25% per level over unencumbered. It's forgiving, and I'd like to keep it that way. I like how encumbrance tends to function in D&D: everybody can carry plenty of consumables and typical weight items, but heavy armour is extremely heavy, so only strong characters can effectively manage to wield it. It's a soft strength requirement for the heaviest gear; a weak character could wear heavier armour too, but they'd have to stash all their other items to manage to carry the armour they're wearing, or take a speed penalty.

## Week 7: character creation

This final week of the sprint was heavy, and not particularly well-programmed. Refactoring could come later. This week was about getting in all the things I thought were cool in time to show them off and compare with everybody else.

{{ img(src="6.png", alt="an image of character creation within rust-rl", caption="Character creation.") }}

I started with character creation. Four ancestries and four classes: human, elf, dwarf, and catfolk, and fighter, rogue, wizard, and villager. Each ancestry grants some intrinsic abilities, like minor telepathy for elves or increased unarmed damage for catfolk, which can never really be lost, unless one were to change ancestry somehow. Class is more temporary: it determines starting stats and inventory, and stat total in general, but any of those things can be tweaked during gameplay. A villager can end up as strong as a fighter, they just start off weak.

Ancestries got added to entity reactions alongside the existing faction system. There's a new table deciding who likes who and who hates who. Humans wont tend to attack other humans, dwarves wont attack other dwarves or gnomes, etc.

Overall, enemy AI is in a pretty decent place for a short 7 weeks of work. Creatures consider immediate adjacency, followed by their field of vision, and whatever task they were currently working on—like chasing something or fleeing from something—to decide what to react to. Chasing or fleeing tends to take priority over general area vision, so somebody may run into danger, only to start fleeing away from it when they become immediately adjacent to that danger, as that takes priority over their current objective. Along with all of these steps, there's faction and ancestry allegiances.

There's a lot of area to expand this, as there always will be, like alignments or whatever other increasingly-specific factors could exist, like how hungry somebody is determining how likely they are to attack something.

{{ img(src="7.png", alt="an image showing beatitude mechanics within rust-rl", caption="Beatitude mechanics.") }}

Beatitude got finished off. There's blessed-uncursed-cursed modifiers on items now, in addition to the identification system. Every item spawned has a beatitude, and beatitudes itself function as a sort of identification state.

In the image above, you can see that `scroll of identify` has already been figured out. The name is no longer obfuscated gibberish, and there are two uncursed scrolls of identify in the backpack; these two have been specifically found out to be uncursed. There's also a greyed out `scroll of identify` which refuses to stack with the others: it wont stack because while we know the item type, we aren't currently aware if its blessed, uncursed, or cursed.

{{ img(src="2.gif", alt="a gif showing a fireball within rust-rl", caption="A fireball.") }}

There's an effects system too. For 6 weeks previously, everything randomly acted all around the codebase. Now, everything acts within a unified events system. In its most simple terms possible, there's a large list of every effect that needs to take place on the next game tick in order, and each tick the queue is iterated through and enacted one-by-one.

Each effect gets checked against some conditions to decide if it should be skipped or not. For instance, an attack effect by an entity who died at an earlier point in the queue would get cancelled, unless it was a ranged attack that was already in the air, like an arrow, which would land regardless.

It's all extremely modular, and fits well with the data-driven entities. Effects are intentionally generic, and combinations of them is what makes things interesting. The same damage and targeting effects used for entities swinging a weapon are used for traps going off or items being used. The gif up above shows off a fireball scroll, which is a damage effect of fire-type that targets an area. I also made mass-healing, mass-confusion, and some other AOE scrolls now that it was easy to do so.

{{ img(src="3.gif", alt="a gif showing telepathy within rust-rl", caption="Telepathy.") }}

Finally, returning to telepathy, all the way from week 1.

Usually, elvish telepathy is about three tiles in size. It's enough to see just past a wall if you stand directly beside it; it's good for stealth, and lets you linger around for a while to see if anybody is on the other side of the door you're about to open, but it wont let you see across the map. However, when a telepathic individual loses one of their other senses, their telepathy becomes enhanced. The gif shows off a telepathic elf who is under the effect of blindness, and has a massively increased telepathy viewshed.

I think telepathy is a great place to call it. It's one of the first things I did in the first day or two because it's one of my favourite features in Nethack. I wasn't sure if I'd get around to it in a way that satisfied me, but having it function as a combination of all the other different systems put in place over the 2 months I worked on this game, I ended up happy with the outcome.

## Week 8

This week was for showing off. I finished off the remnants of morgue files. In the WASM build, they go to the console, otherwise they get saved to disk. Here's one from a run where I died more or less instantly.

{{ img(src="8.png", alt="a morgue file of a run ended after 19 turns in rust-rl", caption="A morgue file from a 19-turn run.") }}

## Reflections

I don't have much reflection besides the obvious. Mainly, I'd do a lot differently if I did it again, and I'm unhappy with a lot of the code I produced.

I think this is a good thing. To come away from a sprint and see places where things could be improved means the whole thing was actually worth doing, because something was actually learned along the way.

I'll do it all again in a few years.

{{ img(src="9.jpg", alt="a hat with 'rest in peace' on it", caption="A birthday gift from a friend featuring morgue file art.") }}

Here's a hat a friend of mine got for me to celebrate reaching the finish line. The art comes from the gravestone that appears in the morgue files.
