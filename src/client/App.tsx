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
