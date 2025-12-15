import { Suspense, useRef, useCallback, useEffect } from "react";
import { CameraControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { DEG2RAD } from "three/src/math/MathUtils.js";
import useSound from "use-sound";
import { useControls } from "@/store/useControls";
import placeSFX from "/place.wav";
import { SceneContent } from "./SceneContent";

// Store camera controls ref globally for access from overlays
let cameraControlsRef: CameraControls | null = null;

export function getCameraControls() {
	return cameraControlsRef;
}

export function rotateCamera(direction: "left" | "right") {
	if (!cameraControlsRef) return;
	cameraControlsRef.rotate(
		direction === "left" ? 1 : -1 * 45 * DEG2RAD,
		0,
		true,
	);
}

export function resetCameraRotation(animate = false) {
	if (!cameraControlsRef) return;
	cameraControlsRef.rotateTo(0, cameraControlsRef.polarAngle, animate);
}

function CameraSetup() {
	const scene = useControls((state) => state.SCENE);
	const ref = useRef<CameraControls>(null);

	useEffect(() => {
		cameraControlsRef = ref.current;
		return () => {
			cameraControlsRef = null;
		};
	}, []);

	// Reset camera when going to INSERT_PLATE_TEXT
	useEffect(() => {
		if (scene === "INSERT_PLATE_TEXT" && ref.current) {
			const { polarAngle } = ref.current;
			ref.current.rotateTo(0, polarAngle, true);
		}
	}, [scene]);

	return (
		<CameraControls
			ref={ref}
			dollySpeed={0}
			truckSpeed={0}
			azimuthRotateSpeed={0}
			polarRotateSpeed={0}
		/>
	);
}

export function SceneCanvas() {
	const scene = useControls((state) => state.SCENE);

	return (
		<div
			className="w-full h-screen absolute top-0 left-0 z-10"
			style={{ pointerEvents: "none" }}
		>
			<Canvas
				gl={{
					stencil: false,
					depth: true,
					preserveDrawingBuffer: false,
					outputColorSpace: THREE.SRGBColorSpace,
				}}
				style={{
					pointerEvents:
						scene === "DRAW_TREE" || scene === "DECORATE_ORNAMENTS"
							? "auto"
							: "none",
					touchAction: "none",
				}}
				camera={{
					position: [0, 12, 50],
					fov: 70,
					near: 0.001,
					far: 3000,
					rotation: [-0.23, 0, 0],
				}}
			>
				<CameraSetup />
				<ambientLight color="#ccc" />
				<directionalLight color="#ccc" position={[-3, 5, -3]} />
				<directionalLight color="#ccc" position={[-3, 5, 3]} />
				<Suspense fallback={null}>
					<SceneContent />
				</Suspense>
			</Canvas>
		</div>
	);
}
