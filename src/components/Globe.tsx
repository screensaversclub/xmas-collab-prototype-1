import React, { useRef } from "react";
import { MeshTransmissionMaterial, useGLTF } from "@react-three/drei";
import * as THREE from "three";

const bgColo2 = new THREE.Color(76 / 255, 66 / 255, 219 / 255);

export function Globe(props) {
	const { nodes } = useGLTF("/globe.glb");
	return (
		<group {...props} dispose={null}>
			<mesh
				castShadow
				receiveShadow
				// @ts-expect-error -- geometry ts type
				geometry={nodes.Sphere.geometry}
				position={[0, 5, 0]}
				scale={15}
			>
				<MeshTransmissionMaterial
					color="#eee"
					transmission={1.1}
					thickness={0.15}
					backside={true}
					background={bgColo2}
				/>
			</mesh>
		</group>
	);
}
useGLTF.preload("/globe.glb");
