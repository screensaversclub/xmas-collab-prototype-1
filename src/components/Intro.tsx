import { useCallback, useEffect } from "react";
import useSound from "use-sound";
import { useControls } from "@/store/useControls";
import { deserializeTreeStateFromJSON } from "@/utils/treeSerializer";
import undoSFX from "/undo.wav";
import { animated, useTransition } from "@react-spring/web";
import { TextBubble } from "./TextBubble";

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
		<div className="@container w-full h-dvh flex">
			{contentTransition(
				(style, item) =>
					item && (
						<animated.div
							className="fixed top-[4cqw] right-[4cqw] cursor-pointer pointer-events-auto flex gap-2 items-center"
							style={style}
							onClick={gotoDrawTree}
						>
							<p className="text-[27px] text-[#FFDB73] font-inria font-medium">
								Next
							</p>
							<img
								src="/back.svg"
								alt="Next"
								className="scale-x-[-1] w-[42px] h-8"
							/>
						</animated.div>
					),
			)}
			<div className="absolute flex items-center justify-center text-center z-10 flex-col w-full top-[10cqh] md:top-[10cqh]">
				<p className="text-[#FFDB73] text-[36px] uppercase font-medium">
					season's
				</p>
				<p className="text-white md:text-[58px] text-[6cqh] uppercase font-light -mt-[2cqh]">
					greetings
				</p>
			</div>
			<TextBubble text="Decorate your tree with ornaments" scene="INTRO" />
		</div>
	);
};
