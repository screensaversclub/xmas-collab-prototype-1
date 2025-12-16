import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
// import { scan } from "react-scan";
import { useProgress } from "@react-three/drei";
import { OrnamentPicker } from "@/components/OrnamentPicker";
import { IntroScreen } from "@/components/Intro";
import { TextBubble } from "@/components/TextBubble";
import { SceneCanvas } from "@/components/SceneCanvas";
import { SceneOverlays } from "@/components/SceneOverlays";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useControls } from "@/store/useControls";

gsap.registerPlugin(useGSAP); // register the hook to avoid React version discrepancies

export const Route = createFileRoute("/")({ component: App });

if (import.meta.env.DEV) {
	// scan({
	// 	enabled: true,
	// });
}

// how long the text message stays before the ornament picker animates in
export const ORNAMENT_SCREEN_DELAY = 2500;

function AppUI() {
	const { active: isLoading, progress } = useProgress();
	const scene = useControls((s) => s.SCENE);

	// Update progress bar width
	useEffect(() => {
		const barFill = document.querySelector(
			"#static-loader .bar-fill",
		) as HTMLElement;
		if (barFill) {
			barFill.style.width = `${progress}%`;
		}
	}, [progress]);

	// Fade out and remove static loader when done (1s delay to show 100%)
	useEffect(() => {
		if (!isLoading) {
			const timer = setTimeout(() => {
				const loader = document.getElementById("static-loader");
				if (loader) {
					loader.classList.add("hidden");
					setTimeout(() => loader.remove(), 300);
				}
			}, 1000);
			return () => clearTimeout(timer);
		}
	}, [isLoading]);

	return (
		<>
			<SceneOverlays />
			<IntroScreen />
			{scene === "DECORATE_ORNAMENTS" && <OrnamentPicker />}
			<TextBubble
				text="Draw the side profile of your tree!"
				scene="DRAW_TREE"
			/>
			<TextBubble
				text="Add ornaments to your tree!"
				scene="DECORATE_ORNAMENTS"
				autoHideAfter={ORNAMENT_SCREEN_DELAY}
			/>
		</>
	);
}

function App() {
	return (
		<div className="z-10 w-screen h-dvh">
			<div
				className="fixed inset-0"
				style={{
					background: `repeating-linear-gradient(
						60deg,
						#077A20 0%,
						#077A20 10%,
						#E64D4F 10%,
						#E64D4F 20%
					)`,
					transition: "opacity 0.3s ease-out",
					zIndex: 0,
				}}
			/>
			<div
				className="fixed inset-0 pointer-events-none"
				style={{
					backgroundImage: "url(/noise.png)",
					backgroundRepeat: "repeat",
					opacity: 0.1,
					mixBlendMode: "overlay",
					zIndex: 1,
				}}
			/>
			<SceneCanvas />
			<AppUI />
		</div>
	);
}
