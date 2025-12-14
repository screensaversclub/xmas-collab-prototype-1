import { useControls } from "@/store/useControls";
import { animated, useSpring } from "@react-spring/three";
import {
	MeshTransmissionMaterial,
	useGLTF,
	useTexture,
} from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";

const bgColo2 = new THREE.Color("#234a99");

export function Globe() {
	const scene = useControls((a) => a.SCENE);
	const normalTex = useTexture("/frost_normal.jpg");
	const frostTex = useTexture("/globe-frost.jpg");

	useEffect(() => {
		frostTex.flipY = false;
		frostTex.needsUpdate = true;
	}, [frostTex]);

	const [props] = useSpring(() => {
		return {
			position: scene === "INSERT_PLATE_TEXT" ? [0, -2, 0] : [0, 30, 0],
		};
	}, [scene]);

	const { nodes } = useGLTF("/jar.glb");
	return (
		/* @ts-expect-error - type mismatch on react spring value */
		<animated.group dispose={null} position={props.position}>
			<mesh
				castShadow
				receiveShadow
				// @ts-expect-error -- geometry ts type
				geometry={nodes.sphere.geometry}
				scale={10.5}
			>
				<MeshTransmissionMaterial
					color="#fff"
					normalMap={normalTex}
					normalScale={0.15}
					transmission={0.98}
					thickness={0.2}
					background={bgColo2}
				/>
			</mesh>
			<mesh
				// @ts-expect-error -- geometry ts type
				geometry={nodes.sphere.geometry}
				scale={10.5}
			>
				<meshBasicMaterial
					color="#fff"
					alphaMap={frostTex}
					transparent={true}
				/>
			</mesh>
		</animated.group>
	);
}
useGLTF.preload("/jar.glb");
useTexture.preload("/frost_normal.jpg");
useTexture.preload("/globe-frost.jpg");
