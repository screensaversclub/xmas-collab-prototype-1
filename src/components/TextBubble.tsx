import { animated, config, useTransition } from "@react-spring/web";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import type { ControlState } from "@/store/useControls";
import { useControls } from "@/store/useControls";

export const TextBubble = ({
	text,
	scene,
	autoHideAfter,
}: {
	text: ReactNode;
	scene: ControlState["SCENE"];
	/** Auto-hide after this many milliseconds (optional) */
	autoHideAfter?: number;
}) => {
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
					className="fixed bottom-[1cqh] md:bottom-[5cqh] left-1/2 z-10 font-inria font-medium text-[#FFDB73] flex items-center justify-center max-w-[390px] min-h-[235px] w-full"
					style={{
						transform: "translateX(-50%)",
						transformOrigin: "bottom center",
						backgroundImage: "url(/intro-border.svg)",
						backgroundRepeat: "no-repeat",
						backgroundPosition: "top center",
						backgroundSize: "100% 100%",
						...style,
					}}
				>
					<div className="flex items-center justify-center px-8">
						<div className="text-[3cqh] text-center">{text}</div>
					</div>
				</animated.div>
			),
	);
};
