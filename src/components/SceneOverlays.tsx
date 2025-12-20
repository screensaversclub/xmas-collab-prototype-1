import { useCallback, useId, useMemo, memo, useState } from "react";
import { animated, useTransition } from "@react-spring/web";
import type { ControlState } from "@/store/useControls";
import { useDrag } from "@use-gesture/react";
import useSound from "use-sound";
import { useControls } from "@/store/useControls";
import placeSFX from "/place.wav";
import { rotateCamera, resetCameraRotation } from "./SceneCanvas";
import { TextBubble } from "./TextBubble";
import { submitSnowglobe } from "@/utils/submitSnowglobe";
import { sendSnowglobeEmail } from "@/utils/sendSnowglobeEmail";

const WriteMessageContent = memo(
	({
		step,
		recipientName,
		messageText,
		senderName,
		points,
		ornaments,
		carvedText,
		submissionLoading,
		set,
	}: {
		step: 1 | 2 | 3;
		recipientName: string;
		messageText: string;
		senderName: string;
		points: ControlState["points"];
		ornaments: ControlState["ornaments"];
		carvedText: string;
		submissionLoading: boolean;
		set: ControlState["set"];
	}) => {
		const stepTransition = useTransition(step, {
			from: { opacity: 0 },
			enter: { opacity: 1 },
			leave: { opacity: 0 },
			exitBeforeEnter: true,
			config: { duration: 150 },
		});

		const hasValue =
			(step === 1 && recipientName.trim().length > 0) ||
			(step === 2 && messageText.trim().length > 0) ||
			(step === 3 && senderName.trim().length > 0);

		const handleBack = useCallback(() => {
			if (step === 2) set({ messageStep: 1 });
			if (step === 3) set({ messageStep: 2 });
		}, [step, set]);

		const handleNext = useCallback(async () => {
			if (step === 1) set({ messageStep: 2 });
			if (step === 2) set({ messageStep: 3 });
			if (step === 3) {
				set({ submissionLoading: true, submissionError: null });
				const result = await submitSnowglobe({
					points,
					ornaments,
					carvedText,
					recipientName,
					messageText,
					senderName,
				});
				if (result.ok && result.shortId) {
					set({
						shortId: result.shortId,
						submissionLoading: false,
						SCENE: "SEND_SHARE",
					});
				} else {
					set({
						submissionLoading: false,
						submissionError: result.error || "Submission failed",
					});
				}
			}
		}, [
			step,
			set,
			points,
			ornaments,
			carvedText,
			recipientName,
			messageText,
			senderName,
		]);

		return (
			<div className="flex flex-col items-center pointer-events-auto w-[280px] h-[180px]">
				<div className="w-full flex-1 relative">
					{stepTransition((style, currentStep) => (
						<animated.div
							style={{ ...style, position: "absolute", inset: 0 }}
							className="flex flex-col gap-2"
						>
							{currentStep === 1 && (
								<>
									<label
										htmlFor="recipient"
										className="text-[#FFDB73] text-[min(5cqw,18px)] font-semibold"
									>
										To:
									</label>
									<input
										id={"recipient"}
										type="text"
										onChange={(e) => set({ recipientName: e.target.value })}
										value={recipientName}
										maxLength={25}
										placeholder="Recipient's name"
										className="w-full text-[min(6cqw,24px)] bg-transparent border-0 border-b border-white text-white placeholder:text-white/50 outline-none"
									/>
								</>
							)}
							{currentStep === 2 && (
								<>
									<label
										htmlFor="message"
										className="text-[#FFDB73] text-[min(5cqw,18px)] font-semibold"
									>
										Message:
									</label>
									<textarea
										id={"message"}
										maxLength={150}
										onChange={(e) => {
											set({ messageText: e.target.value });
										}}
										value={messageText}
										placeholder="Your message"
										rows={3}
										className="w-full text-[min(5cqw,20px)] bg-transparent border border-[#FFDB73] rounded p-2 text-white placeholder:text-white/50 outline-none resize-none"
									/>
								</>
							)}
							{currentStep === 3 && (
								<>
									<label
										htmlFor="sender"
										className="text-[#FFDB73] text-[min(5cqw,18px)] font-semibold"
									>
										From:
									</label>
									<input
										id={"sender"}
										type="text"
										onChange={(e) => set({ senderName: e.target.value })}
										maxLength={25}
										value={senderName}
										placeholder="Your name"
										className="w-full text-[min(6cqw,24px)] bg-transparent border-0 border-b border-white text-white placeholder:text-white/50 outline-none"
									/>
								</>
							)}
						</animated.div>
					))}
				</div>
				<div className="w-full flex justify-between mt-4">
					<button
						type="button"
						onClick={handleBack}
						disabled={submissionLoading}
						className={`text-[#FFDB73] font-inria font-semibold text-[min(5cqw,18px)] cursor-pointer ${step === 1 || submissionLoading ? "invisible" : ""}`}
					>
						Back
					</button>
					<button
						type="button"
						onClick={handleNext}
						disabled={submissionLoading || !hasValue}
						className={`text-[#FFDB73] font-inria font-semibold text-[min(5cqw,18px)] cursor-pointer ${!hasValue ? "invisible" : ""} ${submissionLoading ? "opacity-50" : ""}`}
					>
						{submissionLoading ? "Sending..." : "Next"}
					</button>
				</div>
			</div>
		);
	},
);

WriteMessageContent.displayName = "WriteMessageContent";

const SendShareContent = memo(
	({ shortId }: { shortId: string; set: ControlState["set"] }) => {
		const [email, setEmail] = useState("");
		const [emailSending, setEmailSending] = useState(false);
		const [emailSent, setEmailSent] = useState(false);
		const [emailError, setEmailError] = useState<string | null>(null);
		const [copied, setCopied] = useState(false);

		const shareUrl =
			typeof window !== "undefined"
				? `${window.location.origin}/${shortId}`
				: `/${shortId}`;

		const handleCopyLink = useCallback(async () => {
			try {
				await navigator.clipboard.writeText(shareUrl);
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			} catch {
				// fallback for older browsers
				const input = document.createElement("input");
				input.value = shareUrl;
				document.body.appendChild(input);
				input.select();
				document.execCommand("copy");
				document.body.removeChild(input);
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			}
		}, [shareUrl]);

		const handleSendEmail = useCallback(async () => {
			if (!email.trim()) return;
			setEmailSending(true);
			setEmailError(null);

			const result = await sendSnowglobeEmail(shortId, email);
			if (result.ok) {
				setEmailSent(true);
			} else {
				setEmailError(result.error || "Failed to send email");
			}
			setEmailSending(false);
		}, [email, shortId]);

		return (
			<div className="flex flex-col items-center pointer-events-auto w-[280px] gap-4">
				<p className="text-[#FFDB73] text-[min(5cqw,18px)] font-semibold text-center">
					Your snow globe is ready!
				</p>

				{!emailSent ? (
					<div className="w-full flex flex-col gap-2">
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="Recipient's email"
							className="w-full text-[min(5cqw,18px)] bg-transparent border border-[#FFDB73] rounded p-2 text-white placeholder:text-white/50 outline-none"
						/>
						<button
							type="button"
							onClick={handleSendEmail}
							disabled={emailSending || !email.trim()}
							className="text-[#FFDB73] font-inria font-semibold text-[min(5cqw,18px)] cursor-pointer disabled:opacity-50"
						>
							{emailSending ? "Sending..." : "Send via Email"}
						</button>
						{emailError && (
							<p className="text-red-400 text-[min(4cqw,14px)]">{emailError}</p>
						)}
					</div>
				) : (
					<p className="text-green-400 text-[min(5cqw,16px)]">Email sent!</p>
				)}

				<div className="w-full border-t border-white/30 pt-4">
					<button
						type="button"
						onClick={handleCopyLink}
						className="w-full text-[#FFDB73] font-inria font-semibold text-[min(5cqw,18px)] cursor-pointer"
					>
						{copied ? "Copied!" : "Copy Link"}
					</button>
				</div>
			</div>
		);
	},
);

SendShareContent.displayName = "SendShareContent";

const ViewSubmissionContent = memo(
	({
		recipientName,
		messageText,
		senderName,
	}: {
		recipientName: string;
		messageText: string;
		senderName: string;
	}) => {
		return (
			<div className="flex flex-col items-center pointer-events-auto w-[280px] gap-3">
				<div className="w-full">
					<p className="text-[#FFDB73] text-[min(4cqw,14px)] font-semibold">
						To:
					</p>
					<p className="text-white text-[min(5cqw,18px)]">{recipientName}</p>
				</div>
				<div className="w-full">
					<p className="text-[#FFDB73] text-[min(4cqw,14px)] font-semibold">
						Message:
					</p>
					<p className="text-white text-[min(4cqw,16px)] whitespace-pre-wrap">
						{messageText}
					</p>
				</div>
				<div className="w-full">
					<p className="text-[#FFDB73] text-[min(4cqw,14px)] font-semibold">
						From:
					</p>
					<p className="text-white text-[min(5cqw,18px)]">{senderName}</p>
				</div>
			</div>
		);
	},
);

ViewSubmissionContent.displayName = "ViewSubmissionContent";

export function SceneOverlays() {
	const [playPlace] = useSound(placeSFX, { volume: 1.0 });

	const scene = useControls((state) => state.SCENE);
	const points = useControls((state) => state.points);
	const set = useControls((state) => state.set);
	const ornaments = useControls((state) => state.ornaments);
	const carvedText = useControls((state) => state.carvedText);
	const recipientName = useControls((state) => state.recipientName);
	const messageText = useControls((state) => state.messageText);
	const senderName = useControls((state) => state.senderName);
	const messageStep = useControls((state) => state.messageStep);
	const submissionLoading = useControls((state) => state.submissionLoading);
	const shortId = useControls((state) => state.shortId);

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
		if (scene === "INSERT_PLATE_TEXT") return "WRITE_MESSAGE";
		if (scene === "WRITE_MESSAGE") return "SEND_SHARE";
		return null;
	}, [scene]);

	const hasCarvedText = carvedText.length > 0;
	const showNextButton =
		(hasDrawn && scene === "DRAW_TREE") ||
		(scene === "DECORATE_ORNAMENTS" && hasOrnaments) ||
		(scene === "INSERT_PLATE_TEXT" && hasCarvedText);
	// WRITE_MESSAGE uses inline buttons instead of top-right Next arrow

	const handleNextScreen = useCallback(() => {
		const nextScene = getNextScene();
		if (nextScene) {
			set({ SCENE: nextScene });
		}
	}, [set, getNextScene]);

	const handlePreviousScreen = useCallback(() => {
		if (scene === "WRITE_MESSAGE") {
			set({
				SCENE: "INSERT_PLATE_TEXT",
				recipientName: "",
				messageText: "",
				senderName: "",
				messageStep: 1,
			});
		} else if (scene === "INSERT_PLATE_TEXT") {
			set({ SCENE: "DECORATE_ORNAMENTS", carvedText: "" });
		} else if (scene === "DECORATE_ORNAMENTS") {
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
		scene === "DRAW_TREE" ||
			scene === "DECORATE_ORNAMENTS" ||
			scene === "INSERT_PLATE_TEXT" ||
			scene === "WRITE_MESSAGE",
		{
			from: { opacity: 0, y: -20 },
			enter: { opacity: 1, y: 0, delay: 1400 },
			leave: { y: -20, opacity: 0 },
		},
	);

	const rotateButtonsTransition = useTransition(
		scene === "DECORATE_ORNAMENTS" ||
			scene === "INSERT_PLATE_TEXT" ||
			scene === "VIEW",
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

			<TextBubble scene="INSERT_PLATE_TEXT" inputBox>
				<div className="flex flex-col items-center pointer-events-auto w-[260px] h-[180px] justify-center">
					<label
						htmlFor="carving"
						className="text-[#FFDB73] text-[min(5cqw,20px)] font-semibold mb-2"
					>
						Add an engraving
					</label>
					<input
						id={"carving"}
						type="text"
						onChange={(e) => {
							const text = e.target.value.slice(0, 50);
							set({ carvedText: text });
						}}
						value={carvedText}
						placeholder="Engraved message"
						className="text-center text-[min(5cqw,24px)] bg-transparent border-0 border-b border-white text-white placeholder:text-white/50 outline-none"
					/>
				</div>
			</TextBubble>

			<TextBubble scene="WRITE_MESSAGE" inputBox>
				<WriteMessageContent
					step={messageStep}
					recipientName={recipientName}
					messageText={messageText}
					senderName={senderName}
					points={points}
					ornaments={ornaments}
					carvedText={carvedText}
					submissionLoading={submissionLoading}
					set={set}
				/>
			</TextBubble>

			<TextBubble scene="SEND_SHARE" inputBox>
				<SendShareContent shortId={shortId} set={set} />
			</TextBubble>

			<TextBubble scene="VIEW" inputBox>
				<ViewSubmissionContent
					recipientName={recipientName}
					messageText={messageText}
					senderName={senderName}
				/>
			</TextBubble>
		</div>
	);
}
