import { animated, config, useSpring, useTransition } from "@react-spring/web";
import { Canvas } from "@react-three/fiber";
import { memo, Suspense, useCallback, useState } from "react";
import * as THREE from "three";
import { useSound } from "use-sound";
import { ORNAMENT_SCREEN_DELAY } from "@/routes";
import { useControls } from "@/store/useControls";
import selectOrnamentSFX from "/decide.wav";
import selectColorSFX from "/hover.wav";
import { BallModel, CaneModel, type OrnamentType, StarModel } from "./Models";

export const OrnamentPicker = () => {
	const selectedOrnament = useControls((state) => state.selectedOrnament);
	const scene = useControls((state) => state.SCENE);
	const set = useControls((state) => state.set);
	const [playClick] = useSound(selectOrnamentSFX, { volume: 0.5 });

	const handleOrnamentClick = useCallback(
		(ornamentType: OrnamentType) => {
			playClick();
			set({ selectedOrnament: ornamentType });
		},
		[playClick, set],
	);

	const ornaments: OrnamentType[] = ["Ball", "Star", "Cane"];

	const transition = useTransition(scene === "DECORATE_ORNAMENTS", {
		from: { opacity: 0, y: 30 },
		enter: { opacity: 1, y: 0, delay: ORNAMENT_SCREEN_DELAY },
		leave: { opacity: 0, y: 30, config: { clamp: true } },
		config: config.wobbly,
	});

	return transition(
		(style, item) =>
			item && (
				<animated.div
					className="fixed bottom-16 max-md:bottom-[4cqh] left-1/2 -translate-x-1/2 z-50 flex items-center justify-center gap-4 flex-col-reverse"
					style={style}
				>
					<div className="py-2 px-4 gap-4 flex bg-white rounded-2xl shadow-lg">
						{ornaments.map((ornament) => {
							return (
								<OrnamentButton
									key={ornament}
									type={ornament}
									selected={selectedOrnament === ornament}
									onClick={() => handleOrnamentClick(ornament)}
								/>
							);
						})}
					</div>
					<ColorPicker />
				</animated.div>
			),
	);
};

const OrnamentButton = memo(
	({
		type,
		selected,
		onClick,
	}: {
		type: "Ball" | "Star" | "Cane";
		selected: boolean;
		onClick: () => void;
	}) => {
		const color1 = useControls((state) => state.color);
		const color2 = useControls((state) => state.color2);

		return (
			<button
				type="button"
				onClick={onClick}
				className={`relative group flex flex-col items-center justify-center rounded-2xl transition-all duration-300 hover:scale-110 cursor-pointer`}
			>
				<div className="w-16 h-16">
					<Suspense fallback={null}>
						<Canvas
							className="rounded-full"
							style={{
								opacity: selected ? 1 : 0.7,
							}}
							gl={{
								stencil: false,
								depth: true,
								preserveDrawingBuffer: false,
								outputColorSpace: THREE.SRGBColorSpace,
							}}
						>
							<ambientLight color="#ccc" intensity={2.5} />
							{type === "Star" ? (
								<directionalLight
									color="#ccc"
									position={[3, 2.5, 3]}
									intensity={5}
								/>
							) : (
								<directionalLight
									color="#ccc"
									position={[0.5, 0.5, 3]}
									intensity={2}
								/>
							)}

							{type === "Ball" && (
								<BallModel
									rotation={[0.4, 0, 0]}
									position={[0, -1, 2.5]}
									color={color1}
									color2={color2}
								/>
							)}
							{type === "Star" && (
								<StarModel position={[0, -1.5, 2]} color={color1} />
							)}
							{type === "Cane" && (
								<CaneModel
									position={[0.3, -1.3, 2.8]}
									color={color1}
									color2={color2}
								/>
							)}
						</Canvas>
					</Suspense>
				</div>
			</button>
		);
	},
);

OrnamentButton.displayName = "OrnamentButton";

const colors = [
	"red",
	"blue",
	"orange",
	"green",
	"salmon",
	"white",
	"black",
	"silver",
	"purple",
];

const ColorButton = ({
	color,
	isSelected,
	onClick,
}: {
	color: string;
	isSelected: boolean;
	onClick: () => void;
}) => {
	const [isHovered, setIsHovered] = useState(false);
	const [isPressed, setIsPressed] = useState(false);

	const spring = useSpring({
		scale: isPressed ? 0.8 : isHovered ? 1.05 : 1,
		config: { tension: 300, friction: 20 },
	});

	return (
		<animated.button
			type="button"
			onClick={onClick}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => {
				setIsHovered(false);
				setIsPressed(false);
			}}
			onMouseDown={() => setIsPressed(true)}
			onMouseUp={() => setIsPressed(false)}
			className={`rounded-full cursor-pointer shadow-md ${isSelected ? "ring-2 ring-gray-600" : "ring-2 ring-gray-300"}`}
			style={{ background: color, scale: spring.scale, width: 48, height: 48 }}
		/>
	);
};

const SelectedColorButton = ({
	color,
	onClick,
}: {
	color: string;
	onClick: () => void;
}) => {
	const [isHovered, setIsHovered] = useState(false);
	const [isPressed, setIsPressed] = useState(false);

	const spring = useSpring({
		scale: isPressed ? 0.8 : isHovered ? 1.05 : 1,
		config: { tension: 300, friction: 20 },
	});

	return (
		<animated.button
			type="button"
			onClick={onClick}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => {
				setIsHovered(false);
				setIsPressed(false);
			}}
			onMouseDown={() => setIsPressed(true)}
			onMouseUp={() => setIsPressed(false)}
			className="rounded-full cursor-pointer shadow-md ring-2 ring-white"
			style={{ background: color, scale: spring.scale, width: 36, height: 36 }}
		/>
	);
};

const ColorPicker = () => {
	const [playClick] = useSound(selectColorSFX, { volume: 0.3 });
	const set = useControls((state) => state.set);
	const ballColor1 = useControls((state) => state.color);
	const ballColor2 = useControls((state) => state.color2);
	const selectedOrnament = useControls((state) => state.selectedOrnament);
	const [openPicker, setOpenPicker] = useState<1 | 2 | null>(null);

	const usesSecondColor =
		selectedOrnament === "Ball" || selectedOrnament === "Cane";

	const selectColor1 = useCallback(
		(color: string) => {
			playClick();
			set({ color });
		},
		[set, playClick],
	);

	const selectColor2 = useCallback(
		(color: string) => {
			playClick();
			set({ color2: color });
		},
		[set, playClick],
	);

	const isOpen = openPicker !== null;
	const popupTransition = useTransition(isOpen, {
		from: { opacity: 0, scale: 0.8, y: 10 },
		enter: { opacity: 1, scale: 1, y: 0 },
		leave: { opacity: 0, scale: 0.8, y: 10 },
		config: { tension: 300, friction: 24 },
	});

	const currentColor = openPicker === 1 ? ballColor1 : ballColor2;
	const onSelectColor = openPicker === 1 ? selectColor1 : selectColor2;

	return (
		<div className="relative flex gap-2 items-center justify-center">
			<SelectedColorButton
				color={ballColor1}
				onClick={() => setOpenPicker(openPicker === 1 ? null : 1)}
			/>
			{usesSecondColor && (
				<SelectedColorButton
					color={ballColor2}
					onClick={() => setOpenPicker(openPicker === 2 ? null : 2)}
				/>
			)}
			{popupTransition(
				(style, item) =>
					item && (
						<animated.div
							className="absolute bottom-full mb-3 md:right-0 bg-white rounded-2xl p-6 shadow-xl origin-bottom-right"
							style={style}
							onClick={(e) => e.stopPropagation()}
						>
							<div
								className="grid gap-4"
								style={{ gridTemplateColumns: "repeat(3, auto)" }}
							>
								{colors.map((color) => (
									<ColorButton
										key={color}
										color={color}
										isSelected={currentColor === color}
										onClick={() => {
											onSelectColor(color);
											setOpenPicker(null);
										}}
									/>
								))}
							</div>
						</animated.div>
					),
			)}
		</div>
	);
};

ColorPicker.displayName = "ColorPicker";
