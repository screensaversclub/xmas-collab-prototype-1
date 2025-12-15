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
		<div className="@container w-full h-dvh absolute top-0 left-0">
			{contentTransition(
				(style, item) =>
					item && (
						<>
							<animated.div
								className="next-button-animated-2 fixed top-[2dvw] right-[2dvw] cursor-pointer pointer-events-auto"
								style={style}
								onClick={gotoDrawTree}
							/>
							<animated.div
								className="fixed bottom-[2dvh] right-[2dvw] text-white text-[12px] pointer-events-none"
								style={{ opacity: style.opacity }}
							>
								❤ developed by lemonsour
							</animated.div>
						</>
					),
			)}
			<TextBubble
				text={
					<>
						Build your own <span style={{ color: "#FFFB0D" }}>Snow Globe</span>{" "}
						and send it to someone special!
					</>
				}
				scene="INTRO"
			/>
		</div>
	);
};
