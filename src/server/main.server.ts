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
