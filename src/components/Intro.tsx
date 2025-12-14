import { useCallback, useEffect } from "react";
import useSound from "use-sound";
import { useControls } from "@/store/useControls";
import { deserializeTreeStateFromJSON } from "@/utils/treeSerializer";
import undoSFX from "/undo.wav";

export const IntroScreen = () => {
	const [playClick] = useSound(undoSFX);
	const set = useControls((state) => state.set);
	const scene = useControls((state) => state.SCENE);

	useEffect(() => {
		if (scene !== "INTRO") return;
		fetch("/sample-tree.json")
			.then((res) => res.json())
			.then((json) => {
				const { points, ornaments } = deserializeTreeStateFromJSON(
					JSON.stringify(json),
				);
				set({ points, ornaments });
			})
			.catch(console.error);
	}, [set, scene]);

	const gotoDrawTree = useCallback(() => {
		playClick();
		set({ SCENE: "DRAW_TREE", points: [], ornaments: [] });
	}, [set, playClick]);

	return (
		<div className="@container w-full h-dvh absolute top-0 left-0">
			<div className="w-full h-[100cqh] flex flex-col justify-center items-center gap-[3cqw] pointer-events-none pb-[4cqw] pt-[30cqh] @2xl:pt-[40cqh] @4xl:pt-[50cqh]">
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
			</div>
		</div>
	);
};
