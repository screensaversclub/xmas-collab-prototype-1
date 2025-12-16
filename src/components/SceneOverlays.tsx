import { useCallback, useId, useMemo } from "react";
import { animated, useTransition } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import useSound from "use-sound";
import { useControls } from "@/store/useControls";
import placeSFX from "/place.wav";
import { rotateCamera, resetCameraRotation } from "./SceneCanvas";

export function SceneOverlays() {
	const [playPlace] = useSound(placeSFX, { volume: 1.0 });

	const scene = useControls((state) => state.SCENE);
	const points = useControls((state) => state.points);
	const set = useControls((state) => state.set);
	const ornaments = useControls((state) => state.ornaments);
	const carvedText = useControls((state) => state.carvedText);

	const resetAll = useCallback(() => {
		resetCameraRotation(false);
		set({ points: [], SCENE: "INTRO", ornaments: [] });
	}, [set]);

	const bind = useDrag(({ down, first, xy, target }) => {
		const _target = target as HTMLDivElement;

		if (!down) {
			return;
		}
		if (first) {
			set({
				points: [
					{
						idx: 0,
						x: xy[0] - _target.offsetLeft,
						y: xy[1] - _target.offsetTop,
					},
				],
			});
		} else {
			set({
				points: [
					...points,
					{
						idx: points.length,
						x: xy[0] - _target.offsetLeft,
						y: xy[1] - _target.offsetTop,
					},
				],
			});
		}
	});

	const handleRotateCamera = useCallback(
		(direction: "left" | "right") => {
			playPlace();
			rotateCamera(direction);
		},
		[playPlace],
	);

	const hasDrawn = useMemo(() => points.length > 0, [points]);
	const hasOrnaments = ornaments.length > 0;

	const getNextScene = useCallback(() => {
		if (scene === "DRAW_TREE") return "DECORATE_ORNAMENTS";
		if (scene === "DECORATE_ORNAMENTS") return "INSERT_PLATE_TEXT";
		return null;
	}, [scene]);

	const showNextButton =
		(hasDrawn && scene === "DRAW_TREE") ||
		(scene === "DECORATE_ORNAMENTS" && hasOrnaments);

	const handleNextScreen = useCallback(() => {
		const nextScene = getNextScene();
		if (nextScene) {
			set({ SCENE: nextScene });
		}
	}, [set, getNextScene]);

	const handlePreviousScreen = useCallback(() => {
		if (scene === "DECORATE_ORNAMENTS") {
			set({ SCENE: "DRAW_TREE", points: [], ornaments: [] });
		} else {
			resetAll();
		}
	}, [resetAll, set, scene]);

	const nextButtonTransition = useTransition(showNextButton, {
		from: { opacity: 0, scale: 0 },
		enter: { opacity: 1, scale: 1, delay: 350 },
		leave: { opacity: 0, scale: 0 },
	});

	const gradientTransition = useTransition(scene === "DRAW_TREE", {
		from: { opacity: 0 },
		enter: { opacity: 1, delay: 1200 },
		leave: { opacity: 0 },
	});

	const drawCanvasTransition = useTransition(scene === "DRAW_TREE", {
		from: { scale: 0, opacity: 0 },
		enter: { scale: 1, opacity: 1, delay: 1000 },
		leave: { opacity: 0, config: { duration: 0 } },
	});

	const backButtonTransition = useTransition(
		scene === "DRAW_TREE" || scene === "DECORATE_ORNAMENTS",
		{
			from: { opacity: 0, y: -20 },
			enter: { opacity: 1, y: 0, delay: 1400 },
			leave: { y: -20, opacity: 0 },
		},
	);

	const writePlateTextTransition = useTransition(
		scene === "INSERT_PLATE_TEXT",
		{
			from: { opacity: 0, y: -20 },
			enter: { opacity: 1, y: 0, delay: 1400 },
			leave: { y: -20, opacity: 0 },
		},
	);

	const rotateButtonsTransition = useTransition(
		scene === "DECORATE_ORNAMENTS" || scene === "INSERT_PLATE_TEXT",
		{
			from: { opacity: 0, scale: 0 },
			enter: { opacity: 1, scale: 1, delay: 1200 },
			leave: { opacity: 0, scale: 0 },
		},
	);

	const drawCanvasId = useId();

	return (
		<div
			className="w-full min-h-dvh overflow-hidden absolute top-0 left-0"
			style={{
				pointerEvents: "none",
				touchAction: "none",
			}}
		>
			{/* Green background circle */}
			<div
				className="w-[200dvmax] h-[200dvmax] bg-[#19844c]"
				style={{
					transform: `translate(-50%, -50%) scale(${scene === "DRAW_TREE" || scene === "DECORATE_ORNAMENTS" ? 1 : 0})`,
					borderRadius: "100%",
					position: "absolute",
					left: "50%",
					top: "50%",
					transition: "all ease-in .8s",
				}}
			/>

			{/* Purple background circle */}
			<div
				className="w-[200dvmax] h-[200dvmax] bg-[#4C42DB]"
				style={{
					transform: `translate(-50%, -50%) scale(${scene === "DECORATE_ORNAMENTS" || scene === "INSERT_PLATE_TEXT" ? 1 : 0})`,
					borderRadius: "100%",
					position: "absolute",
					left: "50%",
					top: "50%",
					transition: "all ease-in .8s",
				}}
			/>

			{/* Gradient overlay */}
			{gradientTransition(
				(style, item) =>
					item && (
						<animated.div
							style={{
								position: "absolute",
								top: 0,
								left: "50%",
								width: "50%",
								height: "100%",
								background:
									"linear-gradient(90deg, rgba(25, 132, 76, 0) 0%, rgba(25, 132, 76, .6) 12%)",
								zIndex: 10,
								...style,
							}}
						/>
					),
			)}

			{/* Back button */}
			{backButtonTransition(
				(style, item) =>
					item && (
						<animated.button
							className="absolute pointer-events-auto top-[2dvw] left-[2dvw] z-10 cursor-pointer mt-[2dvh] gap-2 flex font-semibold"
							onClick={handlePreviousScreen}
							type="button"
							style={style}
						>
							<img src="/back.svg" alt="Back" />
							<p className="text-[27px] text-[#FFDB73] font-inria">Back</p>
						</animated.button>
					),
			)}

			{/* Next button */}
			{nextButtonTransition(
				(style, item) =>
					item && (
						<animated.button
							className="absolute pointer-events-auto top-[2dvw] right-[2dvw] z-10 cursor-pointer mt-[2dvh] gap-2 flex"
							onClick={handleNextScreen}
							type="button"
							style={style}
						>
							<p className="text-[27px] text-[#FFDB73] font-inria font-semibold">
								Next
							</p>
							<img src="/back.svg" alt="Next" className="scale-x-[-1]" />
						</animated.button>
					),
			)}

			{/* Draw canvas */}
			{drawCanvasTransition(
				(style, item) =>
					item && (
						<animated.div
							id={drawCanvasId}
							{...bind()}
							style={{
								position: "absolute",
								left: "50%",
								background: "transparent",
								borderRadius: "3dvw",
								borderColor: "oklab(70.2% -0.114 0.055)",
								borderWidth: "min(2dvw,8px)",
								width: "min(48dvw, 250px)",
								padding: "min(1dvw,5px)",
								top: "12dvh",
								height: "42dvh",
								zIndex: "50",
								overflow: "hidden",
								boxSizing: "border-box",
								pointerEvents: scene === "DRAW_TREE" ? "auto" : "none",
								...style,
							}}
						>
							<div
								className="w-[calc(100%-min(2dvw,10px))] h-[calc(100%-min(2dvw,10px))] pointer-events-none rounded-[1dvw] md:rounded-[2dvw]"
								style={{
									borderColor: "oklab(70.2% -0.114 0.055)",
									borderWidth: "min(2dvw,3px)",
									position: "absolute",
									boxSizing: "border-box",
								}}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									role="presentation"
									overflow={"visible"}
									style={{
										pointerEvents: "none",
										position: "absolute",
										width: "100%",
										height: "100%",
									}}
								>
									<path
										fill="transparent"
										stroke={"oklab(90.2% -0.114 0.055)"}
										strokeDasharray={"6,9"}
										strokeWidth={3}
										d={`${points
											.map((p, i, arr) => {
												if (i === 0) {
													return `M ${p.x} ${p.y}`;
												} else if (i === arr.length - 1) {
													return "";
												} else {
													return `L ${p.x} ${p.y}`;
												}
											})
											.join(" ")}`}
									/>
								</svg>
							</div>
						</animated.div>
					),
			)}

			{/* Rotate buttons */}
			{rotateButtonsTransition(
				(style, item) =>
					item && (
						<div>
							<animated.button
								type="button"
								onClick={() => handleRotateCamera("left")}
								style={{
									zIndex: 10,
									position: "fixed",
									left: "3dvw",
									bottom: "40%",
									pointerEvents: "auto",
									background: "none",
									border: "none",
									cursor: "pointer",
									maxWidth: "100px",
									...style,
								}}
							>
								<img
									src="/arrow.svg"
									alt="Rotate left"
									style={{ transform: "scaleX(-1)", width: "12dvw" }}
								/>
							</animated.button>
							<animated.button
								type="button"
								onClick={() => handleRotateCamera("right")}
								style={{
									zIndex: 10,
									position: "fixed",
									right: "3dvw",
									bottom: "40%",
									pointerEvents: "auto",
									background: "none",
									border: "none",
									cursor: "pointer",
									maxWidth: "100px",
									...style,
								}}
							>
								<img
									src="/arrow.svg"
									alt="Rotate right"
									style={{ transform: "scaleX(1)", width: "12dvw" }}
								/>
							</animated.button>
						</div>
					),
			)}

			{/* Plate text input */}
			{writePlateTextTransition(
				(style, item) =>
					item && (
						<div>
							<animated.div
								style={{
									position: "fixed",
									left: "50%",
									bottom: "6dvh",
									pointerEvents: "auto",
									background: "none",
									border: "none",
									cursor: "pointer",
									transform: "translate(-50%, 0)",
									...style,
								}}
							>
								<div className="w-[90dvw] max-w-[300px]">
									<input
										type="text"
										onChange={(e) => {
											const text = e.target.value.slice(0, 15);
											set({ carvedText: text });
										}}
										value={carvedText}
										placeholder="Your message here"
										className="text-center w-full text-[6dvw] rounded-[2dvw] p-[2dvw] bg-white border-0"
									/>
								</div>
							</animated.div>
						</div>
					),
			)}
		</div>
	);
}
