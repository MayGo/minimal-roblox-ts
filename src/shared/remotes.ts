import { ReplicatedStorage } from "@rbxts/services";

const folder = ReplicatedStorage.WaitForChild("Remotes") as Folder;

export const PingEvent = folder.WaitForChild("PingEvent") as RemoteEvent;
