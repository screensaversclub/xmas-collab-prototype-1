import { createFileRoute } from "@tanstack/react-router";
// import { scan } from "react-scan";
import { DrawXmasTree } from "@/components/DrawXmasTree";
import { OrnamentPicker } from "@/components/OrnamentPicker";

import { IntroScreen } from "@/components/Intro";
import { TextBubble } from "@/components/TextBubble";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP); // register the hook to avoid React version discrepancies

export const Route = createFileRoute("/")({ component: App });

if (import.meta.env.DEV) {
	// scan({
	// 	enabled: true,
	// });
}

function App() {
	return (
		<div className="bg-[var(--color-salmon)]">
			<IntroScreen />
			<OrnamentPicker />
			<DrawXmasTree />

			<TextBubble text="Start drawing in the box!" scene="DRAW_TREE" />
		</div>
	);
}
