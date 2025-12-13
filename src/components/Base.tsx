import { useEffect, useState } from "react";
import { useGLTF } from "@react-three/drei";
import type * as THREE from "three";
import { getEnvMap } from "./Models";

export function Base() {
	const { nodes } = useGLTF("/base.glb");

	const [envMap, setEnvMap] = useState<THREE.CubeTexture | null>(null);

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
				position={[0, -3, 0]}
				scale={10}
			>
				<meshPhysicalMaterial
					envMap={envMap}
					metalness={1.0}
					color="#a19b5d"
					roughness={0.2}
				/>
			</mesh>
			<mesh
				castShadow
				receiveShadow
				// @ts-expect-error -- geometry ts type
				geometry={nodes.inner_base.geometry}
				position={[0, -2.95, 0]}
				scale={10}
			>
				<meshPhysicalMaterial color="#fff" />
			</mesh>
		</group>
	);
}
useGLTF.preload("/base.glb");
