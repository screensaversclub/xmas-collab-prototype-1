import { MeshTransmissionMaterial, useGLTF } from "@react-three/drei";
import * as THREE from "three";

const bgColo2 = new THREE.Color("#234a99");

export function Globe() {
	const { nodes } = useGLTF("/jar.glb");
	return (
		<group dispose={null}>
			<mesh
				castShadow
				receiveShadow
				// @ts-expect-error -- geometry ts type
				geometry={nodes.sphere.geometry}
				position={[0, -2, 0]}
				scale={10}
			>
				<MeshTransmissionMaterial
					color="#ffe"
					transmission={1.1}
					thickness={0.15}
					backside={true}
					background={bgColo2}
				/>
			</mesh>
		</group>
	);
}
useGLTF.preload("/jar.glb");
