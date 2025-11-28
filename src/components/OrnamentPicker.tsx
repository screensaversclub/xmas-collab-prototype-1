import { Stage } from "@react-three/drei";
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
		const ornamentBaseColor = useControls((state) => state.ornamentBaseColor);

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
							<Stage shadows={false}>
								{type === "Ball" && (
									<BallModel rotation={[0.2, 0, 0]} color={ornamentBaseColor} />
								)}
								{type === "Star" && (
									<StarModel
										rotation={[-0.2, 0, 0]}
										color={ornamentBaseColor}
									/>
								)}
								{type === "Cane" && (
									<CaneModel rotation={[0.2, 0, 0]} color={ornamentBaseColor} />
								)}
							</Stage>
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
	const ornamentBaseColor = useControls((state) => state.ornamentBaseColor);
	const colors = ["red", "blue", "orange", "green", "salmon", "white"];

	const selectColor = useCallback(
		(color: string) => {
			playClick();
			set({ ornamentBaseColor: color });
		},
		[set, playClick],
	);

	return (
		<div className="flex gap-2 items-center justify-center py-2 bg-white px-4 rounded-full shadow-xl">
			{colors.map((color) => {
				const isSelected = ornamentBaseColor === color;
				return (
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{
							scale: 0.8,
						}}
						type="button"
						key={color}
						onClick={() => selectColor(color)}
						className={`rounded-full size-4 cursor-pointer shadow-md transition-all duration-200 ease-in ${isSelected ? "ring-2 ring-gray-400" : "ring-2 ring-white"}`}
						style={{ background: color }}
					/>
				);
			})}
		</div>
	);
};

ColorPicker.displayName = "ColorPicker";
