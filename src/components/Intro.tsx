import { useCallback, useEffect } from "react";
import useSound from "use-sound";
import { useControls } from "@/store/useControls";
import { deserializeTreeStateFromJSON } from "@/utils/treeSerializer";
import undoSFX from "/undo.wav";
import { animated, useTransition } from "@react-spring/web";

export const IntroScreen = () => {
	const [playClick] = useSound(undoSFX);
	const scene = useControls((state) => state.SCENE);
	const sampleTreeLoaded = useControls((state) => state.sampleTreeLoaded);

	useEffect(() => {
		if (scene !== "INTRO" || sampleTreeLoaded) return;

		const { set } = useControls.getState();

		fetch("/sample-tree.json")
			.then((res) => res.json())
			.then((json) => {
				const state = deserializeTreeStateFromJSON(JSON.stringify(json));
				set({
					points: state.points,
					ornaments: state.ornaments,
					carvedText: state.carvedText ?? "",
					sampleTreeLoaded: true,
				});
			})
			.catch(console.error);
	}, [scene, sampleTreeLoaded]);

	const gotoDrawTree = useCallback(() => {
		playClick();
		useControls.getState().set({
			SCENE: "DRAW_TREE",
			points: [],
			ornaments: [],
			sampleTreeLoaded: false,
		});
	}, [playClick]);

	const contentTransition = useTransition(scene === "INTRO", {
		from: { opacity: 0, scale: 1, y: -20 },
		enter: { opacity: 1, scale: 1, delay: 1000, y: 0 },
		leave: { opacity: 0, scale: 0 },
	});

	if (scene !== "INTRO") {
		return;
	}

	return (
		<div className="@container w-full h-dvh absolute top-0 left-0">
			{contentTransition(
				(style, item) =>
					item && (
						<animated.div
							className="w-full h-[100cqh] flex flex-col justify-center items-center gap-[3cqw] pointer-events-none pb-[4cqw] pt-[30cqh] @2xl:pt-[40cqh] @4xl:pt-[50cqh]"
							style={style}
						>
							<h1 className="text-white text-[min(10cqw,64px)]">
								Snow Globe Builder
							</h1>
							<div className="w-[70cqw] @2xl:w-[70cqw] @4xl:w-[45cqw] bg-white/50 p-[min(4cqw,36px)] text-[min(5cqw,36px)] rounded-[min(4cqw,24px)]">
								<p className="text-pretty">
									Build your own snow globe and send to someone special for the
									holiday season!
								</p>
							</div>
							<button
								type="button"
								className="button pointer-events-auto"
								onClick={gotoDrawTree}
							>
								Start
							</button>
						</animated.div>
					),
			)}
		</div>
	);
};
