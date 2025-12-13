import { useGSAP } from "@gsap/react";
import { animated, config, useTransition } from "@react-spring/web";
import type { ControlState } from "@/store/useControls";
import { useControls } from "@/store/useControls";

export const TextBubble: React.FC<{
	text: string;
	scene: ControlState["SCENE"];
}> = ({ text, scene }) => {
	const curScene = useControls((state) => state.SCENE);
	const isVisible = curScene === scene;

	const transitions = useTransition(isVisible, {
		from: { scale: 0 },
		enter: { scale: 1, delay: 1200 },
		leave: { scale: 0 },
		config: config.wobbly,
	});

	useGSAP(() => {}, {
		dependencies: [text, scene],
	});

	return transitions(
		(style, item) =>
			item && (
				<animated.div
					className="fixed bottom-0 left-0 w-full h-[30dvh] p-[4dvw] z-10 pointer-events-none select-none"
					style={{
						transformOrigin: "bottom center",
						...style,
					}}
				>
					<div
						style={{
							borderRadius: "2dvw",
							background: "rgba(0,0,0,.15)",
							width: "100%",
							height: "calc(100% - 9dvh)",
							color: "white",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							fontSize: "7dvw",
						}}
					>
						{text}
					</div>
					<svg
						width="62"
						role="presentation"
						height="53"
						viewBox="0 0 62 53"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						style={{ margin: "0 auto", width: "auto", height: "9dvh" }}
					>
						<path
							d="M62 0C34 0 37 52.5 31 52.5C25 52.5 28 0 0 0H62Z"
							fill="black"
							fillOpacity="0.15"
						/>
					</svg>
				</animated.div>
			),
	);
};
