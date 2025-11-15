# Roblox for React and TS Developers

## Roblox for React and TypeScript Developers

Hello, fellow React devs! This tutorial shows how to reach millions of Roblox players using your React and TypeScript skills right from your favorite editor (probably VS Code or Cursor). Whether you’re building a game for a kid, friends, a community, or just as a creative outlet, this will help you get started.

Developing with roblox-ts and **@rbxts/react** feels very close to normal React development. You still write JSX, build components, manage state, and organize your UI the way you already know. The main difference is learning Roblox’s environment instead of the browser. There is no DOM or console, and UI elements like <frame> fill the same role as a <div>. You can also create components such as Box, Flex, VStack, HStack, or Card to make the UI feel even more familiar. Once you understand how client and server scripts work, and that RemoteEvents work like WebSocket messages while RemoteFunctions are closer to calling fetch(), the rest feels natural. You can keep almost all of your React habits with only small changes.

---

### Prerequisites

- Node.js and a package manager (pnpm, npm, or Yarn)
- VS Code / Cursor / or other IDE
- Knowledge of React and TypeScript
- You know your stuff

### Explore Roblox

- Go to [roblox.com](http://roblox.com).
- Create a Roblox account and play a few popular games to see what works.
- Go to the Create tab and download Roblox Studio from [create.roblox.com](http://create.roblox.com).
- Install and open Roblox Studio. Try some demo projects, and playtest them to learn the UI and tools.

### Add TypeScript with roblox-ts

roblox-ts compiles TypeScript to Luau (Roblox’s language).

Read more: [roblox-ts.com](http://roblox-ts.com)

Create a project scaffold with `npm init roblox-ts` and choose:

- Project directory: your folder
- Project type: `game`
- Configure Git: `Yes`
- Configure ESLint: `Yes`
- Configure Prettier: `Yes`
- Configure VS Code Project Settings: `Yes`
- If asked about multiple package managers: pick `pnpm` (or your preferred one)

Using pnpm? Add a `.npmrc` in the project root: `node-linker=hoisted`

After scaffolding, you’ll see files like `main.client.ts` and `main.server.ts` (roblox-ts compiles them to `.lua`).

- `*.client.ts`: Entry for client‑side logic such as UI and client events. Runs on the player’s device.
- `*.server.ts`: Entry for server‑side logic. Code in the `server` directory is private and not visible to players.
- `shared` directory: Place types, constants, and utilities shared by both client and server.
- You can define multiple entry points if needed.

Note: Roblox has no browser console; use `print()` for logging.

### Install Rokit and Rojo

Some tooling isn’t distributed via npm. Use Rokit to manage some tools.

Install Rokit - Toolchain manager ([https://github.com/rojo-rbx/rokit](https://github.com/rojo-rbx/rokit)). Follow their installation guide.

Install Rojo ( [rojo.space](http://rojo.space)) - Syncs files from your local project into Roblox Studio.

```jsx
rokit add rojo-rbx/rojo
rokit install
```

Add dev script using concurrently:

```jsx
pnpm add -D concurrently
```

In package.json, add:

```json
{
	"scripts": {
		"dev": "concurrently \"pnpm watch\" \"pnpm serve\"",
		"serve": "rojo serve"
		// ...
	}
}
```

`pnpm watch` is provided by roblox-ts to compile on change.

`rojo serve` syncs your filesystem into the open place in Roblox Studio.

Lastly, add the Rojo plugin for Roblox Studio:

```jsx
rojo plugin install
```

**Run development:**

In the project folder run: `pnpm dev` (At initial run it will give error, just run it again)

Start Studio and open your place/game. Open the Rojo plugin and press Connect.

![Screenshot 2025-11-15 at 17.08.20.png](images/Screenshot_2025-11-15_at_17.08.20.png)

### Play test your game

Press Play in Roblox Studio to see if everything works.

You should see logs in the Output window (To open this window go Window→Output):

```jsx
Hello from main.server.ts!  -  Server - main:4
Hello from main.client.ts!  -  Client - main:4
```

After that, you can stop the simulation/game.

### Let’s add some UI and server logic

First we need `@rbxts/react-roblox`: [https://www.npmjs.com/package/@rbxts/react-roblox](https://www.npmjs.com/package/@rbxts/react-roblox)
Install this and it’s dependencies:

```jsx
pnpm add @rbxts/react @rbxts/react-roblox @rbxts/services
```

Create `server/remotes.server.ts` that creates a RemoteEvent instance the UI can use to send data to the server.

```tsx
import { ReplicatedStorage } from "@rbxts/services";

const remotesFolder = new Instance("Folder");
remotesFolder.Name = "Remotes";
remotesFolder.Parent = ReplicatedStorage;

const ping = new Instance("RemoteEvent");
ping.Name = "PingEvent";
ping.Parent = remotesFolder;
```

Create `shared/remotes.ts`. This utility file exports `PingEvent` for the UI and server.

```tsx
import { ReplicatedStorage } from "@rbxts/services";

const folder = ReplicatedStorage.WaitForChild("Remotes") as Folder;

export const PingEvent = folder.WaitForChild("PingEvent") as RemoteEvent;
```

Change `main.server.ts` to listen for `PingEvent` from the UI.

```tsx
import { makeHello } from "shared/module";
import { PingEvent } from "shared/remotes";

print(makeHello("main.server.ts"));

PingEvent.OnServerEvent.Connect((player) => {
  print(`Ping received from server: ${[player.Name](http://player.Name)}`);
});
```

Change `main.client.tsx` to set up the main `App` component.

```tsx
import React, { StrictMode } from "@rbxts/react";
import { createPortal, createRoot } from "@rbxts/react-roblox";
import { Players } from "@rbxts/services";
import { makeHello } from "shared/module";
import { App } from "./App";

print(makeHello("main.client.ts"));

const playerGui = Players.LocalPlayer.WaitForChild("PlayerGui") as PlayerGui;

const root = createRoot(new Instance("Folder"));

root.render(<StrictMode>{createPortal(<App />, playerGui)}</StrictMode>);
```

Add `client/App.tsx`. This adds a button that sends an event to the server.

```tsx
import React from "@rbxts/react";
import { PingEvent } from "shared/remotes";

export const App = () => {
	const onClick = () => {
		print("Pinging server...");
		PingEvent.FireServer();
	};

	return (
		<screengui ResetOnSpawn={false} IgnoreGuiInset ZIndexBehavior="Sibling">
			<textbutton
				Text="Ping Server"
				Size={UDim2.fromOffset(160, 50)}
				Position={UDim2.fromScale(0.2, 0.2)}
				AnchorPoint={new Vector2(0.5, 0.5)}
				Event={{
					MouseButton1Click: onClick,
				}}
			/>
		</screengui>
	);
};
```

Then play test your game. When clicking the button you should see in Output:

```jsx
Pinging server...  -  Client - App:7
Ping received from server: MayGoRblx  -  Server - main:7
```

### Your Dev Loop

1. Start pnpm dev
2. Open Roblox Studio
3. Connect Rojo
4. Press Play
5. Edit code in IDE → auto-compile → auto-sync → Play again

![Screenshot 2025-11-15 at 17.14.25.png](images/Screenshot_2025-11-15_at_17.14.25.png)

### Make it better

To make it more like a game, let’s spawn and throw a cube on button click. Change `main.server.ts`:

```tsx
import { Workspace } from "@rbxts/services";
import { makeHello } from "shared/module";
import { PingEvent } from "shared/remotes";

print(makeHello("main.server.ts"));

PingEvent.OnServerEvent.Connect((player) => {
	print(`Ping received from server: ${player.Name}`);
	throwCube(player);
});

function throwCube(player: Player) {
	const character = player.Character;
	if (!character) return;

	const rootPart = character.FindFirstChild("HumanoidRootPart") as BasePart | undefined;
	if (!rootPart) return;

	const cube = new Instance("Part");
	cube.Size = new Vector3(4, 4, 4);
	cube.Name = "ThrownCube";
	cube.Color = new Color3(math.random(), math.random(), math.random());
	cube.Material = Enum.Material.Neon;
	cube.Anchored = false;
	cube.CanCollide = true;

	const spawnCFrame = rootPart.CFrame.mul(new CFrame(0, 0, -3));
	cube.CFrame = spawnCFrame;
	cube.Parent = Workspace;

	const throwSpeed = 120;

	// throw from player's position, but slightly above
	const direction = rootPart.CFrame.LookVector.add(new Vector3(0, 0.6, 0));
	cube.AssemblyLinearVelocity = direction.mul(throwSpeed);

	// add spin via angular velocity
	let axis = new Vector3(math.random(), math.random(), math.random());
	if (axis.Magnitude < 0.001) axis = new Vector3(0, 0, 1);
	const spinAxis = axis.Unit;
	const spinMagnitude = math.random(12, 24); // rad/sec
	cube.AssemblyAngularVelocity = spinAxis.mul(spinMagnitude);
}
```

Play test the game. You should have a random‑color cube thrown at your location.

### Publish game to play with friends

- File → Save to Roblox
- By default it will be private, but you still can play it online
- From Game Settings, set it Permission to public. Nowadays need to fill “Content & Maturity questionnaire” to make playable by others.
- Basic publishing workflow

### Where to now?

- To simplify UI work, consider ui‑labs (similar to Storybook) to iterate on UI components outside the game loop: [https://ui-labs.luau.page/docs/getstarted](https://ui-labs.luau.page/docs/getstarted)
- To simplify state management, you can use Reflex: [https://littensy.github.io/reflex/docs/](https://littensy.github.io/reflex/docs/). You can even keep state on the server and sync it to the UI.
- To simplify events, you can use a simple RemoteEvent library, Remo: [https://github.com/littensy/remo](https://github.com/littensy/remo)
- Of course you need hooks: [https://github.com/littensy/pretty-react-hooks](https://github.com/littensy/pretty-react-hooks)
- List of packages available: [https://github.com/Coyenn/awesome-roblox-ts](https://github.com/Coyenn/awesome-roblox-ts)
- And read Roblox docs: [https://create.roblox.com/docs](https://create.roblox.com/docs)
- This small project is also in: [https://github.com/MayGo/minimal-roblox-ts](https://github.com/MayGo/minimal-roblox-ts)

---

### Tips and gotchas

- Keep sensitive server logic in `server/` only. Anything in `shared/` is sendable to clients.
- Use `print()` and `warn()` for logs and Studio’s Output window to inspect them. Use `error()` to stop execution, similar to `throw new Error()` in TS.
- Start small: get one interaction working end‑to‑end, then iterate.
