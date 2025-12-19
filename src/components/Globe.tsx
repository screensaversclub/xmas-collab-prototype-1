import { animated, useSpring } from "@react-spring/three";
import {
	MeshTransmissionMaterial,
	useGLTF,
	useTexture,
} from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useControls } from "@/store/useControls";
import { useEnvMap } from "./Models";

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
				positions[i] = (Math.random() - 0.5) * 25; // Math.random() - 0.5 to have a random value between -0.5 and +0.5
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

	const envMap = useEnvMap();

	useEffect(() => {
		frostTex.flipY = false;
		frostTex.needsUpdate = true;
	}, [frostTex]);

	const globeVisible =
		scene === "INSERT_PLATE_TEXT" ||
		scene === "INTRO" ||
		scene === "WRITE_MESSAGE";

	const [props] = useSpring(() => {
		return {
			opacity: globeVisible ? 1 : 0,
			position: globeVisible ? [0, -2, 0] : [0, 50, 0],
		};
	}, [globeVisible]);

	const { nodes } = useGLTF("/jar.glb");
	return (
		<animated.group
			dispose={null}
			/* @ts-expect-error - type mismatch on react spring value */
			position={props.position}
			opacity={props.opacity}
		>
			<points
				position={[0, globeVisible ? 10 : 50, 0]}
				geometry={snowGeom}
				material={snowMaterial}
			/>
			<mesh
				castShadow
				receiveShadow
				// @ts-expect-error -- geometry ts type
				geometry={nodes.sphere.geometry}
				scale={11.5}
				position={[0, -0.2, 0]}
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
				scale={11.5}
				position={[0, -0.2, 0]}
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
