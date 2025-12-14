import { useGSAP } from "@gsap/react";
import { animated, config, useTransition } from "@react-spring/web";
import { useEffect, useState } from "react";
import type { ControlState } from "@/store/useControls";
import { useControls } from "@/store/useControls";

export const TextBubble: React.FC<{
	text: string;
	scene: ControlState["SCENE"];
	/** Auto-hide after this many milliseconds (optional) */
	autoHideAfter?: number;
}> = ({ text, scene, autoHideAfter }) => {
	const curScene = useControls((state) => state.SCENE);
	const [autoHidden, setAutoHidden] = useState(false);

	useEffect(() => {
		setAutoHidden(false);
	}, [curScene, text]);

	useEffect(() => {
		if (!autoHideAfter || curScene !== scene) return;
		const timer = setTimeout(() => setAutoHidden(true), autoHideAfter);
		return () => clearTimeout(timer);
	}, [autoHideAfter, curScene, scene]);

	const isVisible = curScene === scene && !autoHidden;

	const transitions = useTransition(isVisible, {
		from: { scale: 0 },
		enter: { scale: 1, delay: 1200 },
		leave: { scale: 0, config: { clamp: true } },
		config: { ...config.wobbly },
	});

	useGSAP(() => {}, {
		dependencies: [text, scene],
	});

	return transitions(
		(style, item) =>
			item && (
				<animated.div
					className="fixed bottom-0 left-0 w-full z-10 pointer-events-none select-none mb-[2cqh]"
					style={{
						transformOrigin: "bottom center",
						...style,
					}}
				>
					<div className="flex items-center justify-center">
						<div
							style={{
								borderRadius: "2cqw",
								background: "rgba(0,0,0,.15)",
								color: "white",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}
							className="text-[min(7cqw,72px)] p-[4cqw]"
						>
							{text}
						</div>
					</div>
					<svg
						width="62"
						role="presentation"
						height="53"
						viewBox="0 0 62 53"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						style={{ margin: "0 auto", width: "auto", height: "4dvw" }}
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
