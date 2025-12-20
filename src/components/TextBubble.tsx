import { animated, config, useTransition } from "@react-spring/web";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import type { ControlState } from "@/store/useControls";
import { useControls } from "@/store/useControls";

export const TextBubble = ({
	children,
	text,
	scene,
	autoHideAfter,
	inputBox = false,
}: {
	children?: ReactNode;
	text?: ReactNode;
	scene: ControlState["SCENE"];
	/** Auto-hide after this many milliseconds (optional) */
	autoHideAfter?: number;
	/** Use border box style instead of SVG background */
	inputBox?: boolean;
}) => {
	const curScene = useControls((state) => state.SCENE);
	const [autoHidden, setAutoHidden] = useState(false);
	const content = children ?? text;

	useEffect(() => {
		setAutoHidden(false);
	}, [curScene, content]);

	useEffect(() => {
		if (!autoHideAfter || curScene !== scene) return;
		const timer = setTimeout(() => setAutoHidden(true), autoHideAfter);
		return () => clearTimeout(timer);
	}, [autoHideAfter, curScene, scene]);

	const isVisible = curScene === scene && !autoHidden;

	const transitions = useTransition(isVisible, {
		from: { scale: 0, opacity: 0 },
		enter: { scale: 1, opacity: 1, delay: 1200 },
		leave: { scale: 0, opacity: 0 },
		config: (item) =>
			item ? config.wobbly : { tension: 300, friction: 30, clamp: true },
	});

	return transitions(
		(style, item) =>
			item && (
				<animated.div
					className="fixed bottom-[1cqh] md:bottom-[5cqh] left-1/2 z-10 font-inria font-medium text-[#FFDB73] flex items-center justify-center max-w-[390px] min-h-[235px] w-[calc(100%-1rem)]"
					style={{
						transform: "translateX(-50%)",
						transformOrigin: "bottom center",
						...(inputBox
							? { border: "1px solid #E4C36D" }
							: {
									backgroundImage: "url(/intro-border.svg)",
									backgroundRepeat: "no-repeat",
									backgroundPosition: "top center",
									backgroundSize: "100% 100%",
								}),
						...style,
					}}
				>
					{inputBox && (
						<>
							<div
								className="absolute"
								style={{
									top: 6,
									left: 8,
									right: 8,
									height: 1,
									background: "#E4C36D",
								}}
							/>
							<div
								className="absolute"
								style={{
									bottom: 6,
									left: 8,
									right: 8,
									height: 1,
									background: "#E4C36D",
								}}
							/>
						</>
					)}
					<div className="flex items-center justify-center px-8 flex-col">
						<div className="text-[3cqh] text-center">{content}</div>
						{curScene === "INTRO" && (
							<div className="text-[1.4cqh] mt-[2cqh] text-center uppercase tracking-[.08em]">
								<a
									href="https://lemonsour.world"
									target="_blank"
									rel="noopener"
								>
									Made by <span className="underline">Lemon Sour</span>
								</a>
							</div>
						)}
					</div>
				</animated.div>
			),
	);
};
