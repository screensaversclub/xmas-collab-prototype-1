import { useCallback, useEffect } from "react";
import useSound from "use-sound";
import { useControls } from "@/store/useControls";
import { deserializeTreeStateFromJSON } from "@/utils/treeSerializer";
import undoSFX from "/undo.wav";

export const IntroScreen = () => {
	const [playClick] = useSound(undoSFX);
	const set = useControls((state) => state.set);

	useEffect(() => {
		fetch("/sample-tree.json")
			.then((res) => res.json())
			.then((json) => {
				const { points, ornaments } = deserializeTreeStateFromJSON(
					JSON.stringify(json),
				);
				set({ points, ornaments });
			})
			.catch(console.error);
	}, [set]);

	const gotoDrawTree = useCallback(() => {
		playClick();
		set({ SCENE: "DRAW_TREE", points: [], ornaments: [] });
	}, [set, playClick]);

	return (
		<div className="w-full h-dvh absolute top-0 left-0 flex flex-col justify-center items-center gap-[3dvw] pointer-events-none">
			<h1 className="text-white text-[8dvw]">Snow Globe Builder</h1>

			<div className="w-[80dvw] h-[80dvw] bg-white/0 rounded-full"></div>

			<div className="w-[90%] max-w-[400px] bg-white/50 p-[4dvw] text-[6dvw] rounded-[4dvw]">
				<p>
					Build your own snow globe and send to someone special for the holiday
					season!
				</p>
			</div>
			<div>
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
