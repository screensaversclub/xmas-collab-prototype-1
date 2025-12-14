import { useControls } from "@/store/useControls";
import { animated, useSpring } from "@react-spring/three";
import {
	MeshTransmissionMaterial,
	useGLTF,
	useTexture,
} from "@react-three/drei";
import { useEffect, useMemo, useState } from "react";

import * as THREE from "three";
import { getEnvMap } from "./Models";
import { useFrame } from "@react-three/fiber";

const bgColo2 = new THREE.Color("#234a99");

export function Globe() {
	const scene = useControls((a) => a.SCENE);
	const normalTex = useTexture("/frost_normal.jpg");
	const frostTex = useTexture("/globe-frost.jpg");

	const COUNT = 500;

	const [snowGeom, snowMaterial] = useMemo(() => {
		const geom = new THREE.BufferGeometry();
		const snowmaterial = new THREE.PointsMaterial({
			size: 0.1,
			sizeAttenuation: true,
		});
		const positions = new Float32Array(COUNT * 3);
		for (let i = 0; i < COUNT * 3; i++) {
			if (i % 3 === 1) {
				// y axis
				positions[i] = (Math.random() - 0.5) * 16; // Math.random() - 0.5 to have a random value between -0.5 and +0.5
			} else if (i % 3 === 0) {
				const d = Math.random() * 11;
				const angle = Math.random() * 2 * Math.PI;
				const posX = Math.sin(angle) * d;
				const posZ = Math.cos(angle) * d;

				positions[i] = posX;
				positions[i + 2] = posZ;
			} else {
				// z already set in x step
			}
		}

		const speeds = new Float32Array(COUNT * 3);
		for (let i = 0; i < COUNT * 3; i++) {
			speeds[i] = Math.random() * 0.02 + 0.01; // Math.random() - 0.5 to have a random value between -0.5 and +0.5
		}
		geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
		geom.setAttribute("speed", new THREE.BufferAttribute(speeds, 3));
		return [geom, snowmaterial];
	}, []);

	useFrame(() => {
		for (let i = 0; i < COUNT * 3; i++) {
			const speed = snowGeom.attributes.speed.array[i];

			if (i % 3 === 1) {
				let newY = snowGeom.attributes.position.array[i] - speed;
				if (newY < -8) {
					newY = 8;
				}
				snowGeom.attributes.position.array[i] = newY;
			}
		}
		snowGeom.attributes.position.needsUpdate = true;
	});

	const [envMap, setEnvMap] = useState<THREE.CubeTexture | null>(null);
	useEffect(() => {
		getEnvMap().then((map) => setEnvMap(map));
	}, []);

	useEffect(() => {
		frostTex.flipY = false;
		frostTex.needsUpdate = true;
	}, [frostTex]);

	const [props] = useSpring(() => {
		return {
			position: scene === "INSERT_PLATE_TEXT" ? [0, -2, 0] : [0, 50, 0],
		};
	}, [scene]);

	const { nodes } = useGLTF("/jar.glb");
	return (
		/* @ts-expect-error - type mismatch on react spring value */
		<animated.group dispose={null} position={props.position}>
			<points
				position={[0, scene === "INSERT_PLATE_TEXT" ? 10 : 50, 0]}
				geometry={snowGeom}
				material={snowMaterial}
			/>
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
					envMap={envMap}
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
