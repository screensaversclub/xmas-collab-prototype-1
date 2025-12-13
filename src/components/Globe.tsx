import { useControls } from "@/store/useControls";
import { animated, useSpring } from "@react-spring/three";
import { MeshTransmissionMaterial, useGLTF } from "@react-three/drei";
import * as THREE from "three";

const bgColo2 = new THREE.Color("#234a99");

export function Globe() {
	const scene = useControls((a) => a.SCENE);

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
				scale={10}
			>
				<MeshTransmissionMaterial
					color="#ffe"
					transmission={1.1}
					thickness={0.15}
					backside={true}
					backsideThickness={1}
					background={bgColo2}
				/>
			</mesh>
		</animated.group>
	);
}
useGLTF.preload("/jar.glb");
