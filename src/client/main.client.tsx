import React, { StrictMode } from "@rbxts/react";
import { createPortal, createRoot } from "@rbxts/react-roblox";
import { Players } from "@rbxts/services";
import { makeHello } from "shared/module";
import { App } from "./App";

print(makeHello("main.client.ts"));

const playerGui = Players.LocalPlayer.WaitForChild("PlayerGui") as PlayerGui;

const root = createRoot(new Instance("Folder"));

root.render(<StrictMode>{createPortal(<App />, playerGui)}</StrictMode>);
