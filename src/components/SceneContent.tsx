import { useCallback, useEffect, useRef, useState } from "react";
import { animated as animatedThree, useSpring } from "@react-spring/three";
import { useThree, useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import useSound from "use-sound";
import { useControls } from "@/store/useControls";
import placeSFX from "/place.wav";
import { Base } from "./Base";
import { Globe } from "./Globe";
import { TreeMesh } from "./TreeMesh";
import { Ornaments, CursorPreview } from "./Ornaments";
import { Present } from "./Present";

function IntroScaler({ children }: { children: React.ReactNode }) {
	const scene = useControls((a) => a.SCENE);
	const set = useControls((a) => a.set);
	const { viewport } = useThree();
	const groupRef = useRef<THREE.Group>(null);

	useFrame((_, delta) => {
		if (scene === "INTRO" && groupRef.current) {
			groupRef.current.rotation.y -= delta * 0.3;
		}
	});

	const isIntro = scene === "INTRO";

	useEffect(() => {
		if (!isIntro && groupRef.current) {
			groupRef.current.rotation.y = 0;
			set({ carvedText: "" });
		}
	}, [isIntro, set]);

	const targetHeight = viewport.height * 0.3;
	const globeHeight = 25;
	const introScale = targetHeight / globeHeight;
	const introYPos = viewport.height * 0.2;

	const [spring] = useSpring(
		() => ({
			scale: isIntro ? introScale : 1,
			rotationX: isIntro ? 0.3 : 0,
			config: { tension: 120, friction: 14 },
		}),
		[isIntro, introScale, introYPos],
	);

	return (
		<>
			<animatedThree.group
				ref={groupRef}
				scale={spring.scale}
				/* @ts-expect-error - type mismatch on react spring value */
				position={spring.position}
				rotation-x={spring.rotationX}
			>
				{children}
			</animatedThree.group>
			{scene === "INTRO" && (
				<group>
					<Present
						position={[-24, -20, -50]}
						scale={10}
						rotation-y={0.45}
						rotation-x={0.3}
						rotation-z={0}
						ribbonColor={"#E64D4F"}
					/>
					<Present
						position={[20, -15, -50]}
						scale={16}
						rotation-y={2}
						rotation-x={0.3}
						rotation-z={0}
						ribbonColor={"white"}
					/>
					<Present
						position={[-20, -15, -200]}
						scale={30}
						rotation-y={1.6}
						rotation-x={0.3}
						rotation-z={0}
						ribbonColor={"salmon"}
					/>
				</group>
			)}
		</>
	);
}

export function SceneContent() {
	const [playPlace] = useSound(placeSFX, { volume: 1.0 });
	const [isPlacing, setIsPlacing] = useState(false);

	const selectedOrnament = useControls((state) => state.selectedOrnament);
	const scene = useControls((state) => state.SCENE);
	const points = useControls((state) => state.points);
	const set = useControls((state) => state.set);
	const ornaments = useControls((state) => state.ornaments);
	const hoverData = useControls((state) => state.hoverData);
	const ballColor1 = useControls((state) => state.color);
	const ballColor2 = useControls((state) => state.color2);

	useEffect(() => {
		if (!isPlacing) return;
		const handlePointerUp = () => setIsPlacing(false);
		window.addEventListener("pointerup", handlePointerUp);
		return () => window.removeEventListener("pointerup", handlePointerUp);
	}, [isPlacing]);

	const handleAddOrnament = useCallback(
		(e: ThreeEvent<PointerEvent>) => {
			e.stopPropagation();

			const intersection = e.intersections[0];
			if (!intersection) return;

			const point = intersection.point;
			const normal = intersection?.face?.normal.clone();
			if (!normal) return;

			const offset = 0;
			const position: [number, number, number] = [
				point.x + normal.x * offset,
				point.y + normal.y * offset,
				point.z + normal.z * offset,
			];
			set({
				ornaments: [
					...ornaments,
					{
						id: crypto.randomUUID(),
						position: position,
						type: selectedOrnament,
						normal,
						clickPoint: point.clone(),
						color: ballColor1,
						color2: ballColor2,
					},
				],
				hoverData: null,
			});
			playPlace();
		},
		[ornaments, selectedOrnament, ballColor1, ballColor2, set, playPlace],
	);

	const handleHover = useCallback(
		(e: ThreeEvent<PointerEvent>) => {
			e.stopPropagation();
			const intersection = e.intersections[0];
			if (!intersection || !intersection.face) {
				set({ hoverData: null });
				return;
			}
			const point = intersection.point;
			const normal = intersection.face.normal.clone();
			set({
				hoverData: {
					position: [point.x, point.y, point.z],
					normal,
				},
			});
		},
		[set],
	);

	const handlePointerOut = useCallback(() => {
		set({ hoverData: null });
	}, [set]);

	return (
		<IntroScaler>
			<TreeMesh
				points={points}
				onAddOrnament={handleAddOrnament}
				onHover={handleHover}
				onPointerOut={handlePointerOut}
				onPlacingChange={setIsPlacing}
			/>
			<Ornaments ornaments={ornaments} />
			{hoverData && scene === "DECORATE_ORNAMENTS" && (
				<CursorPreview
					position={hoverData.position}
					normal={hoverData.normal}
					type={selectedOrnament}
				/>
			)}
			<Globe />
			{scene === "INTRO" && (
				<group>
					<Present position={[2, -1.9, 0]} scale={1} ribbonColor={"green"} />
					<Present position={[3, -1.9, 3]} scale={1.4} ribbonColor={"salmon"} />
					<Present
						position={[-3, -1.9, 2]}
						scale={0.8}
						ribbonColor={"orange"}
					/>
				</group>
			)}
			<Base />
		</IntroScaler>
	);
}
