import { ReplicatedStorage } from "@rbxts/services";

const remotesFolder = new Instance("Folder");
remotesFolder.Name = "Remotes";
remotesFolder.Parent = ReplicatedStorage;

const ping = new Instance("RemoteEvent");
ping.Name = "PingEvent";
ping.Parent = remotesFolder;
