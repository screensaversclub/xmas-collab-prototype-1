import { useEffect, useState } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import type * as THREE from "three";
import { getEnvMap } from "./Models";

export function Base() {
	const { nodes } = useGLTF("/jar.glb");

	const [envMap, setEnvMap] = useState<THREE.CubeTexture | null>(null);
	const bumpTex = useTexture("/bump_base.jpg");
	const colTex = useTexture("/color_base.jpg");

	useEffect(() => {
		if (bumpTex) {
			bumpTex.flipY = false;
			bumpTex.needsUpdate = true;
		}
	}, [bumpTex]);

	useEffect(() => {
		if (colTex) {
			colTex.flipY = false;
			colTex.needsUpdate = true;
		}
	}, [colTex]);

	useEffect(() => {
		getEnvMap().then((map) => setEnvMap(map));
	}, []);

	return (
		<group dispose={null}>
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
					bumpMap={bumpTex}
					bumpScale={1.0}
					map={colTex}
					roughness={0.2}
				/>
			</mesh>
			<mesh
				castShadow
				receiveShadow
				// @ts-expect-error -- geometry ts type
				geometry={nodes.inner_base.geometry}
				position={[0, -1.9, 0]}
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
