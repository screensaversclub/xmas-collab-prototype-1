import { Canvas } from "@react-three/fiber";
import { AnimatePresence, motion } from "motion/react";
import { memo, Suspense, useCallback } from "react";
import { useSound } from "use-sound";
import { useControls } from "@/store/useControls";
import selectOrnamentSFX from "/decide.wav";
import selectColorSFX from "/hover.wav";
import { BallModel, CaneModel, type OrnamentType, StarModel } from "./Models";

export const OrnamentPicker = () => {
	const selectedOrnament = useControls((state) => state.selectedOrnament);
	const isDrawingComplete = useControls((state) => state.isDrawingComplete);
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

	return (
		<AnimatePresence>
			{isDrawingComplete && (
				<motion.div
					className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center justify-center gap-y-4"
					initial={{ opacity: 0.5, y: 30 }}
					animate={{
						opacity: 1,
						y: 0,
					}}
				>
					<ColorPicker />
					<div className="py-2 animate-enter-individual-title bg-white shadow-xl rounded-2xl px-4 gap-4 flex">
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
				</motion.div>
			)}
		</AnimatePresence>
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
				className={`relative group flex flex-col items-center justify-center rounded-md transition-all duration-300 hover:scale-110 cursor-pointer`}
			>
				<div className="w-16 h-16">
					<Suspense fallback={null}>
						<Canvas
							className="rounded-md"
							style={{ background: selected ? "#f5f5f5" : "white" }}
						>
							<ambientLight color="#ccc" intensity={2} />
							<directionalLight color="#ccc" position={[0.5, 0.5, 3]} />
							{type === "Ball" && (
								<BallModel
									rotation={[0.4, 0, 0]}
									position={[0, -0.5, 3.8]}
									color={color1}
									color2={color2}
								/>
							)}
							{type === "Star" && (
								<StarModel position={[0, -1, 3.2]} color={color1} />
							)}
							{type === "Cane" && (
								<CaneModel position={[0, -0.65, 3.8]} color={color1} />
							)}
						</Canvas>
					</Suspense>
				</div>
			</button>
		);
	},
);

OrnamentButton.displayName = "OrnamentButton";

const ColorPicker = () => {
	const [playClick] = useSound(selectColorSFX, { volume: 0.3 });
	const set = useControls((state) => state.set);
	const selectedOrnament = useControls((state) => state.selectedOrnament);
	const ballColor1 = useControls((state) => state.color);
	const ballColor2 = useControls((state) => state.color2);
	const colors = ["red", "blue", "orange", "green", "salmon", "white"];

	const isBall = selectedOrnament === "Ball";

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

	return (
		<div
			className={`flex gap-2 items-center justify-center py-2 bg-white px-4 rounded-2xl shadow-xl ${isBall ? "flex-col" : ""}`}
		>
			{isBall ? (
				<>
					<div className="flex gap-2 items-center">
						{colors.map((color) => {
							const isSelected = ballColor1 === color;
							return (
								<motion.button
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.8 }}
									type="button"
									key={color}
									onClick={() => selectColor1(color)}
									className={`rounded-full size-4 cursor-pointer shadow-md transition-all duration-200 ease-in ${isSelected ? "ring-2 ring-gray-400" : "ring-2 ring-white"}`}
									style={{ background: color }}
								/>
							);
						})}
					</div>
					<div className="flex gap-2 items-center">
						{colors.map((color) => {
							const isSelected = ballColor2 === color;
							return (
								<motion.button
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.8 }}
									type="button"
									key={color}
									onClick={() => selectColor2(color)}
									className={`rounded-full size-4 cursor-pointer shadow-md transition-all duration-200 ease-in ${isSelected ? "ring-2 ring-gray-400" : "ring-2 ring-white"}`}
									style={{ background: color }}
								/>
							);
						})}
					</div>
				</>
			) : (
				colors.map((color) => {
					const isSelected = color === ballColor1;
					return (
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.8 }}
							type="button"
							key={color}
							onClick={() => selectColor1(color)}
							className={`rounded-full size-4 cursor-pointer shadow-md transition-all duration-200 ease-in ${isSelected ? "ring-2 ring-gray-400" : "ring-2 ring-white"}`}
							style={{ background: color }}
						/>
					);
				})
			)}
		</div>
	);
};

ColorPicker.displayName = "ColorPicker";
