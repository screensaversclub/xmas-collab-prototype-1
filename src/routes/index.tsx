import { createFileRoute } from "@tanstack/react-router";
import { useCallback } from "react";
// import { scan } from "react-scan";
import useSound from "use-sound";
import { DrawXmasTree } from "@/components/DrawXmasTree";
import { OrnamentPicker } from "@/components/OrnamentPicker";
import { useControls } from "@/store/useControls";

import undoSFX from "/undo.wav";
import { IntroScreen } from "@/components/Intro";

export const Route = createFileRoute("/")({ component: App });

if (import.meta.env.DEV) {
	// scan({
	// 	enabled: true,
	// });
}

function App() {
	const isDrawingComplete = useControls((state) => state.isDrawingComplete);
	const set = useControls((state) => state.set);
	const [playClick] = useSound(undoSFX);

	const reset = useCallback(() => {
		playClick();
		set({ isDrawingComplete: false, points: [], ornaments: [] });
	}, [playClick, set]);

	const gotoDrawTree = useCallback(() => {
		playClick();
		set({ SCENE: "DRAW_TREE" });
	}, [set, playClick]);

	return (
		<div className="bg-[var(--color-salmon)]">
			<div className="fixed top-0 left-0 z-20 flex-col justify-start items-start">
				<button
					type="button"
					onClick={reset}
					className="cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-500 transition-colors"
				>
					Start over
				</button>

				<button
					type="button"
					onClick={gotoDrawTree}
					className="cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-500 transition-colors"
				>
					Start over
				</button>
			</div>
			<IntroScreen />
			<OrnamentPicker />
			<DrawXmasTree />
		</div>
	);
}
