import * as THREE from "three";
import { useProgress } from "@react-three/drei";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { SceneCanvas } from "@/components/SceneCanvas";
import { SceneOverlays } from "@/components/SceneOverlays";
import type { OrnamentType } from "@/components/Models";
import type { Point } from "@/store/useControls";
import { useControls } from "@/store/useControls";
import { animated, useTransition } from "@react-spring/web";

// JSON-serialized form (Vector3 becomes {x,y,z} object)
type SerializedVector3 = { x: number; y: number; z: number };

type SerializedOrnament = {
	id: string;
	type: OrnamentType;
	position: [number, number, number];
	normal: SerializedVector3;
	clickPoint: SerializedVector3;
	color: string;
	color2?: string;
};

type SerializedSubmission = {
	points: Point[];
	ornaments: SerializedOrnament[];
	carvedText: string;
	recipientName: string;
	messageText: string;
	senderName: string;
};

type LoaderData = {
	ok: boolean;
	submission?: SerializedSubmission;
};

export const Route = createFileRoute("/$shortId")({
	loader: async ({ params }): Promise<LoaderData> => {
		const res = await fetch(`/api/submission/${params.shortId}`);
		return res.json();
	},
	component: ViewSubmission,
});

function ViewSubmissionUI() {
	const { active: isLoading, progress } = useProgress();

	useEffect(() => {
		const barFill = document.querySelector(
			"#static-loader .bar-fill",
		) as HTMLElement;
		if (barFill) {
			barFill.style.width = `${progress}%`;
		}
	}, [progress]);

	useEffect(() => {
		if (!isLoading) {
			const timer = setTimeout(() => {
				const loader = document.getElementById("static-loader");
				if (loader) {
					loader.classList.add("hidden");
					setTimeout(() => loader.remove(), 0);
				}
			}, 1000);
			return () => clearTimeout(timer);
		}
	}, [isLoading]);

	return <SceneOverlays />;
}

function ViewSubmission() {
	const data = Route.useLoaderData();
	const set = useControls((s) => s.set);

	const nextButtonTransition = useTransition(true, {
		from: { opacity: 0, scale: 0 },
		enter: { opacity: 1, scale: 1, delay: 350 },
		leave: { opacity: 0, scale: 0 },
	});

	useEffect(() => {
		if (data.ok && data.submission) {
			// Reconstruct THREE.Vector3 from serialized {x,y,z} objects
			const ornaments = data.submission.ornaments.map((o) => ({
				...o,
				normal: new THREE.Vector3(o.normal.x, o.normal.y, o.normal.z),
				clickPoint: new THREE.Vector3(o.clickPoint.x, o.clickPoint.y, o.clickPoint.z),
			}));

			set({
				points: data.submission.points,
				ornaments,
				carvedText: data.submission.carvedText,
				recipientName: data.submission.recipientName,
				messageText: data.submission.messageText,
				senderName: data.submission.senderName,
				SCENE: "VIEW",
			});
		}
	}, [data, set]);

	if (!data.ok) {
		return (
			<div className="z-10 w-screen h-dvh flex items-center justify-center bg-[#1A1945]">
				<p className="text-white text-xl">Snow globe not found</p>
			</div>
		);
	}

	return (
		<div className="z-10 w-screen h-dvh">
			<div className="fixed inset-0 bg-[#1A1945]" />
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
			<ViewSubmissionUI />

			{nextButtonTransition(
				(style, item) =>
					item && (
						<Link to="/">
							<animated.button
								className="absolute pointer-events-auto top-[2dvw] right-[2dvw] z-10 cursor-pointer mt-[2dvh] gap-2 flex"
								type="button"
								style={style}
							>
								<p className="text-[27px] text-[#FFDB73] font-inria font-semibold">
									Next
								</p>
								<img src="/back.svg" alt="Next" className="scale-x-[-1]" />
							</animated.button>
						</Link>
					),
			)}
		</div>
	);
}
