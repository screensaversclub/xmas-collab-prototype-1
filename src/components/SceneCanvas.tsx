import { Suspense, useRef, useMemo, useEffect } from "react";
import { CameraControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { DEG2RAD } from "three/src/math/MathUtils.js";
import { useControls } from "@/store/useControls";
import { SceneContent } from "./SceneContent";

function isMobile() {
	if (typeof window === "undefined") return false;
	return (
		/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
		window.innerWidth < 768
	);
}

function getDevicePixelRatio() {
	if (typeof window === "undefined") return 1;
	const desktopMaxDpr = 1;
	const mobileMaxDpr = 1.5;
	const deviceDpr = window.devicePixelRatio || 1;
	return isMobile()
		? Math.min(mobileMaxDpr, deviceDpr)
		: Math.min(desktopMaxDpr, deviceDpr);
}

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
		// @ts-expect-error - no time for types here
		const handleRotateEvent = (e) => {
			if (cameraControlsRef === null || scene !== "INSERT_PLATE_TEXT") {
				return;
			}
			cameraControlsRef.rotateTo(
				(-0.15 + e.detail.rotation) * 2 * Math.PI,
				cameraControlsRef.polarAngle,
				true,
			);
		};

		window.addEventListener("globe-camera-rotate", handleRotateEvent);

		return () => {
			window.removeEventListener("globe-camera-rotate", handleRotateEvent);
		};
	}, [scene]);

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
	const dpr = useMemo(() => getDevicePixelRatio(), []);

	return (
		<div
			className="w-full h-dvh absolute top-0 left-0 z-10"
			style={{ pointerEvents: "none" }}
		>
			<Canvas
				dpr={dpr}
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
					near: 0.01,
					far: 1000,
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
