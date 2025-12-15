import { useEffect, useMemo, useRef, useState } from "react";
import { Html, useGLTF, useTexture } from "@react-three/drei";
import { CanvasTexture } from "three";
import { useEnvMap } from "./Models";
import { useControls } from "@/store/useControls";

export function Base() {
	const { nodes } = useGLTF("/jar.glb");
	const envMap = useEnvMap();
	const colTex = useTexture("/color_base.jpg");

	const carvedText = useControls((a) => a.carvedText);

	const bumpCanvasRef = useRef<HTMLCanvasElement>(
		document.createElement("canvas"),
	);

	const [bumpCanvasReady, setBumpCanvasReady] = useState(false);

	const colorCanvasRef = useRef<HTMLCanvasElement>(
		document.createElement("canvas"),
	);

	const [colorCanvasReady, setColorCanvasReady] = useState(false);

	const bumpTexImg = useRef<HTMLImageElement>(null);

	const bumpTextureFromCanvas = useMemo(() => {
		if (!bumpCanvasReady) {
			return null;
		}
		const t = new CanvasTexture(bumpCanvasRef.current);
		t.flipY = true;
		t.needsUpdate = true;
		return t;
	}, [bumpCanvasReady]);

	const colorTextureFromCanvas = useMemo(() => {
		if (!colorCanvasReady) {
			return null;
		}
		const t = new CanvasTexture(colorCanvasRef.current);
		t.flipY = true;
		t.needsUpdate = true;
		return t;
	}, [colorCanvasReady]);

	const [bumpBaseLoaded, setBumpBaseLoaded] = useState(false);

	useEffect(() => {
		if (bumpTexImg.current === null || !bumpBaseLoaded) {
			return;
		}

		const bumpCanvas = bumpCanvasRef.current;
		const colorCanvas = colorCanvasRef.current;

		if (bumpCanvas.getAttribute("data-initialised") !== "true") {
			bumpCanvas.width = 2048;
			bumpCanvas.height = 256;
			colorCanvas.width = 2048;
			colorCanvas.height = 256;

			bumpCanvas.setAttribute("data-initialised", "true");
			colorCanvas.setAttribute("data-initialised", "true");
		}

		const bumpCtx = bumpCanvas.getContext("2d");
		const colorCtx = colorCanvas.getContext("2d");

		if (bumpCtx === null || colorCtx === null) {
			return;
		}

		bumpCtx.drawImage(bumpTexImg.current, 0, 0, 2048, 256);
		colorCtx.fillStyle = "#B1A070";
		colorCtx.fillRect(0, 0, 2048, 256);
		bumpCtx.font = "120px Libre Bodoni";
		bumpCtx.fillStyle = "#000000";
		colorCtx.font = "120px Libre Bodoni";
		colorCtx.fillStyle = "#806820";
		bumpCtx.fillText(carvedText, 0, 195);
		colorCtx.fillText(carvedText, 0, 195);

		setBumpCanvasReady(() => true);
		setColorCanvasReady(() => true);

		if (bumpTextureFromCanvas) {
			bumpTextureFromCanvas.flipY = false;
			bumpTextureFromCanvas.needsUpdate = true;
		}

		if (colorTextureFromCanvas) {
			colorTextureFromCanvas.flipY = false;
			colorTextureFromCanvas.needsUpdate = true;
		}
	}, [
		carvedText,
		bumpBaseLoaded,
		bumpTextureFromCanvas,
		colorTextureFromCanvas,
	]);

	useEffect(() => {
		if (colTex) {
			colTex.flipY = false;
			colTex.needsUpdate = true;
		}
	}, [colTex]);

	return (
		<group dispose={null}>
			<Html>
				<img
					ref={bumpTexImg}
					onLoad={() => setBumpBaseLoaded(true)}
					src="/bump_base.jpg"
					alt="bump base tex"
					style={{ width: "1px", height: "1px", opacity: "1" }}
				/>
			</Html>
			<mesh
				castShadow
				receiveShadow
				// @ts-expect-error -- geometry ts type
				geometry={nodes.base.geometry}
				position={[0, -2, 0]}
				scale={10}
			>
				<meshPhysicalMaterial
					envMap={envMap}
					metalness={1.0}
					bumpMap={bumpTextureFromCanvas}
					roughnessMap={bumpTextureFromCanvas}
					bumpScale={1.0}
					map={colorTextureFromCanvas}
					roughness={0.2}
				/>
			</mesh>
			<mesh
				castShadow
				receiveShadow
				// @ts-expect-error -- geometry ts type
				geometry={nodes.inner_base.geometry}
				position={[0, -1.95, 0]}
				scale={10}
			>
				<meshPhysicalMaterial color="#fff" />
			</mesh>
		</group>
	);
}
useGLTF.preload("/jar.glb");
useTexture.preload("/bump_base.jpg");
useTexture.preload("/color_base.jpg");
