# Roblox for React and TS Developers

## Roblox for React and TypeScript Developers

Hello, fellow React devs. This guide shows how to reach millions of Roblox players using your existing React and TypeScript skills, directly from your usual editor (VS Code, Cursor, etc.). Whether you’re building a game for your kids, friends, a community, or just for fun, this walkthrough will get you from zero to a playable experience.

Developing with `roblox-ts` and `@rbxts/react` feels surprisingly close to normal React development. You still write JSX, build components, manage state, and structure your UI in familiar ways. The main difference is the runtime: there is no browser, DOM, or console. Roblox UI elements like `<frame>` fill the role of `<div>`. You can even build ergonomic abstractions (`Box`, `Flex`, `VStack`, `HStack`, `Card`, etc.) so it feels like front-end work you already know. Once you understand how client and server scripts work, and how `RemoteEvent` and `RemoteFunction` compare to WebSockets or `fetch()`, everything starts to feel natural.

---

### Prerequisites

- Tooling: Node.js and a package manager (`pnpm`, `npm`, or `Yarn`)
- Editor: VS Code, Cursor, or another TypeScript-friendly IDE
- Skills: Comfortable with React and TypeScript
- Mindset: You’re fine learning a new platform while reusing your existing skills

---

### Step 1 – Explore Roblox as a Player

Before writing any code, spend a bit of time in Roblox itself.

- Create an account at `https://roblox.com`.
- Play a few popular games to see what works well and what feels fun.
- Install Roblox Studio from `https://create.roblox.com` (Create tab).
- Open some template projects, press Play, and experiment so you understand the UI and tools.

This context helps a lot when you start building your own experiences.

---

### Step 2 – Add TypeScript with roblox-ts

`roblox-ts` compiles TypeScript to Luau (Roblox’s scripting language), so you can stay in a TypeScript-first workflow.

Read more: `https://roblox-ts.com`

Create a new project scaffold:

```bash
npm init roblox-ts
```

When prompted, choose:

- Project directory: your target folder
- Project type: `game`
- Configure Git: `Yes`
- Configure ESLint: `Yes`
- Configure Prettier: `Yes`
- Configure VS Code Project Settings: `Yes`
- Package manager: choose `pnpm` (or your preferred one)

If you use `pnpm`, add a `.npmrc` file in the project root:

```text
node-linker=hoisted
```

After scaffolding, you will see files like `main.client.ts` and `main.server.ts` (which compile to `.lua` or `.luau`):

- `*.client.ts`: Client-side entry points (UI, local events). Runs on the player’s device.
- `*.server.ts`: Server-side entry points. Code in the `server` directory is private and not visible to players.
- `shared` directory: Types, constants, and utilities used by both client and server.
- Multiple entry points: You can define more as your game grows.

Remember: Roblox has no browser console. Use `print()` for logging to Studio’s Output window.

---

### Step 3 – Install Rokit and Rojo

Some of the Roblox tooling is not distributed via npm. We’ll use Rokit to manage it and Rojo to sync files into Roblox Studio.

- Rokit (toolchain manager): `https://github.com/rojo-rbx/rokit`
- Rojo (filesystem ↔ Studio sync): `https://rojo.space`

Install Rojo via Rokit (follow Rokit’s install guide first):

```bash
rokit add rojo-rbx/rojo
rokit install
```

Install `concurrently` so we can run the watcher and Rojo at the same time:

```bash
pnpm add -D concurrently
```

Update your `package.json` scripts:

```json
{
	"scripts": {
		"dev": "concurrently \"pnpm watch\" \"pnpm serve\"",
		"serve": "rojo serve"
		// ...
	}
}
```

- `pnpm watch`: Provided by `roblox-ts`, compiles TypeScript to Luau on file changes.
- `rojo serve`: Syncs your local filesystem into the open place in Roblox Studio.

Install the Rojo plugin inside Roblox Studio:

```bash
rojo plugin install
```

---

### Step 4 – Run the Development Environment

In your project folder, start the dev tools:

```bash
pnpm dev
```

On the first run it might error because not everything is ready yet. Run it again after things are installed.

Then:

- Open Roblox Studio and your game/place.
- Open the Rojo plugin and press Connect to attach it to your `rojo serve` session.

Now file changes in your editor will sync live into Studio.

---

### Step 5 – Playtest the Starter Game

Press Play in Roblox Studio.

Open the Output window (`Window → Output`) and you should see something like:

```text
Hello from main.server.ts!  -  Server - main:4
Hello from main.client.ts!  -  Client - main:4
```

If you see these messages, your basic TypeScript + Roblox setup is working. Stop the simulation when you’re done.

---

### Step 6 – Add React-style UI and Server Logic

We’ll use `@rbxts/react-roblox` to render React components into Roblox UI.

Package: `https://www.npmjs.com/package/@rbxts/react-roblox`

Install it and its dependencies:

```bash
pnpm add @rbxts/react @rbxts/react-roblox @rbxts/services
```

#### 6.1 – Create a RemoteEvent on the Server

Create `server/remotes.server.ts` to define a `RemoteEvent` the UI can use to send data to the server:

```tsx
import { ReplicatedStorage } from "@rbxts/services";

const remotesFolder = new Instance("Folder");
remotesFolder.Name = "Remotes";
remotesFolder.Parent = ReplicatedStorage;

const ping = new Instance("RemoteEvent");
ping.Name = "PingEvent";
ping.Parent = remotesFolder;
```

#### 6.2 – Share the RemoteEvent with Client and Server

Create `shared/remotes.ts` to expose the `PingEvent` in one central place:

```tsx
import { ReplicatedStorage } from "@rbxts/services";

const folder = ReplicatedStorage.WaitForChild("Remotes") as Folder;

export const PingEvent = folder.WaitForChild("PingEvent") as RemoteEvent;
```

#### 6.3 – Listen for Pings on the Server

Update `server/main.server.ts` so the server can respond when the UI sends a ping:

```tsx
import { makeHello } from "shared/module";
import { PingEvent } from "shared/remotes";

print(makeHello("main.server.ts"));

PingEvent.OnServerEvent.Connect((player) => {
	print(`Ping received from client: ${player.Name}`);
});
```

#### 6.4 – Mount the React App on the Client

Update `client/main.client.tsx` to set up the React root and mount the `App` component:

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

#### 6.5 – Build a Simple UI with a Button

Create `client/App.tsx`. This component renders a button that fires the `PingEvent` when clicked:

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

Playtest again and watch the Output window. When you click the button, you should see messages like:

```text
Pinging server...  -  Client - App:7
Ping received from client: MayGoRblx  -  Server - main:7
```

At this point, you have a working end-to-end interaction from React UI to Roblox server logic.

---

### Step 7 – Your Dev Loop

Most of your time will follow a simple loop:

1. Start `pnpm dev` in your project folder.
2. Open Roblox Studio and your game/place.
3. Connect Rojo to your project.
4. Press Play to test.
5. Edit code in your IDE → auto-compile → auto-sync → Play again.

This is your tight feedback cycle, similar to a web dev hot-reload workflow.

---

### Step 8 – Make It More Game-like (Throwing Cubes)

Let’s turn the simple ping into something more fun. We’ll spawn and throw a cube from the server whenever the button is clicked.

Update `server/main.server.ts`:

```tsx
import { Workspace } from "@rbxts/services";
import { makeHello } from "shared/module";
import { PingEvent } from "shared/remotes";

print(makeHello("main.server.ts"));

PingEvent.OnServerEvent.Connect((player) => {
	print(`Ping received from client: ${player.Name}`);
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

Playtest the game. Each time you click the button, a glowing, randomly colored cube should spawn near your character and get thrown forward with some spin.

---

### Step 9 – Publish Your Game and Play with Friends

Once you’re happy with your prototype, publish it so others can join.

- Use File → Save to Roblox in Studio.
- New games are private by default, but you can still play them online yourself.
- Open Game Settings and change permissions so others can play.
- Roblox may require a “Content & Maturity questionnaire” before the game is publicly playable.

Now your TypeScript + React-style Roblox game is live.

---

### Where to Go Next

There is a growing ecosystem around `roblox-ts` and Roblox UI development:

- UI iteration: `ui-labs` (Storybook-like environment for Roblox UI) – `https://ui-labs.luau.page/docs/getstarted`
- State management: `Reflex` (keep state on the server and sync to clients) – `https://littensy.github.io/reflex/docs/`
- Remotes abstraction: `Remo` (simple RemoteEvent helper library) – `https://github.com/littensy/remo`
- Hooks: `pretty-react-hooks` (React-style hooks tailored for Roblox) – `https://github.com/littensy/pretty-react-hooks`
- Package list: curated `roblox-ts` packages – `https://github.com/Coyenn/awesome-roblox-ts`
- Official docs: Roblox’s creation docs – `https://create.roblox.com/docs`
- Example project: this minimal project – `https://github.com/MayGo/minimal-roblox-ts`
- To make world building easier - `https://click-to-build.trimatech.dev/`

---

### Tips and Gotchas

- Keep sensitive server logic in `server/` only. Anything in `shared/` can be sent to clients.
- Use `print()` and `warn()` for logs and Studio’s Output window; use `error()` when you need to hard-stop execution (similar to `throw new Error()` in TypeScript).
- Start tiny. Get one interaction working end-to-end (like the ping button) and iterate from there.
