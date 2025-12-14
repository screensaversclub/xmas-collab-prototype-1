import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { JSX } from "react";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import CustomShaderMaterial from "three-custom-shader-material/vanilla";
import ballFragShader from "../shaders/ball.frag.glsl?raw";
import ballVertShader from "../shaders/ball.vert.glsl?raw";
import caneFragShader from "../shaders/cane.frag.glsl?raw";
import caneVertShader from "../shaders/cane.vert.glsl?raw";

let envMapCache: THREE.CubeTexture | null = null;
let envMapPromise: Promise<THREE.CubeTexture> | null = null;

export function getEnvMap(): Promise<THREE.CubeTexture> {
	if (envMapCache) return Promise.resolve(envMapCache);
	if (envMapPromise) return envMapPromise;

	const path = "/cube/";
	const format = ".png";
	const urls = [
		`${path}px${format}`,
		`${path}nx${format}`,
		`${path}py${format}`,
		`${path}ny${format}`,
		`${path}pz${format}`,
		`${path}nz${format}`,
	];

	envMapPromise = new Promise((resolve) => {
		const loader = new THREE.CubeTextureLoader();
		loader.load(urls, (texture) => {
			envMapCache = texture;
			resolve(texture);
		});
	});

	return envMapPromise;
}

export const StarModel = (
	props: JSX.IntrinsicElements["mesh"] & { color?: string },
) => {
	const { color = "yellow", ...restProps } = props;
	const { nodes, materials } = useGLTF("/star.glb");
	return (
		<mesh
			{...restProps}
			geometry={(nodes.Star as THREE.Mesh)?.geometry}
			material={materials.Star}
			scale={1}
		>
			<meshStandardMaterial
				color={color}
				emissive={color}
				emissiveIntensity={0.5}
				roughness={0.26}
				metalness={0.527}
				opacity={1}
			/>
		</mesh>
	);
};
StarModel.displayName = "StarModel";

export const CaneModel = (
	props: JSX.IntrinsicElements["mesh"] & { color?: string; color2?: string },
) => {
	const { color = "red", color2 = "white", ...restProps } = props;
	const { nodes } = useGLTF("/candy_cane.glb");

	const uniforms = useMemo(
		() => ({
			color1: { value: new THREE.Color(color) },
			color2: { value: new THREE.Color(color2) },
			time: { value: 0 },
		}),
		[color, color2],
	);

	const customMaterial = useMemo(
		() =>
			new CustomShaderMaterial({
				baseMaterial: THREE.MeshStandardMaterial,
				vertexShader: caneVertShader,
				fragmentShader: caneFragShader,
				uniforms,
			}),
		[uniforms],
	);

	useFrame(({ clock }) => {
		customMaterial.uniforms.time.value = clock.elapsedTime;
		customMaterial.needsUpdate = true;
	});

	return (
		<mesh
			{...restProps}
			geometry={(nodes.Cane as THREE.Mesh)?.geometry}
			scale={0.6}
		>
			<primitive object={customMaterial} />
		</mesh>
	);
};
CaneModel.displayName = "CaneModel";

export const BallModel = (
	props: JSX.IntrinsicElements["group"] & { color?: string; color2?: string },
) => {
	const { color, color2, ...restProps } = props;
	const { nodes, materials } = useGLTF("/ball.glb");
	const [envMap, setEnvMap] = useState<THREE.CubeTexture | null>(null);

	useEffect(() => {
		getEnvMap().then(setEnvMap);
	}, []);

	const uniforms = useMemo(
		() => ({
			time: { value: 0 },
			color: { value: new THREE.Color(0.2, 0.0, 0.1) },
			color1: { value: new THREE.Color(color) },
			color2: { value: new THREE.Color(color2) },
			envMapF: { value: null as THREE.CubeTexture | null },
		}),
		[color, color2],
	);

	useEffect(() => {
		if (envMap) {
			uniforms.envMapF.value = envMap;
		}
	}, [envMap, uniforms]);

	const customMaterial = useMemo(
		() =>
			new CustomShaderMaterial({
				baseMaterial: THREE.MeshPhysicalMaterial,
				vertexShader: ballVertShader,
				fragmentShader: ballFragShader,
				uniforms,
				roughness: 0.0,
				metalness: 0.0,
				clearcoat: 1.0,
				clearcoatRoughness: 0.1,
			}),
		[uniforms],
	);

	return (
		<group {...restProps}>
			<mesh geometry={(nodes.Circle as THREE.Mesh)?.geometry} scale={0.6}>
				<meshStandardMaterial
					roughness={0.26}
					metalness={0.727}
					color={(materials.Tip as THREE.MeshStandardMaterial)?.color}
				/>
			</mesh>
			<mesh geometry={(nodes.Tip as THREE.Mesh)?.geometry} scale={0.6}>
				<meshStandardMaterial
					roughness={0.26}
					metalness={0.727}
					color={(materials.Tip as THREE.MeshStandardMaterial)?.color}
				/>
			</mesh>
			<mesh geometry={(nodes.Ball as THREE.Mesh)?.geometry} scale={0.6}>
				<primitive object={customMaterial} />
			</mesh>
		</group>
	);
};
BallModel.displayName = "BallModel";

useGLTF.preload("/star.glb");
useGLTF.preload("/candy_cane.glb");
useGLTF.preload("/ball.glb");

export const ORNAMENT_MODELS = {
	Star: StarModel,
	Cane: CaneModel,
	Ball: BallModel,
};

export type OrnamentType = keyof typeof ORNAMENT_MODELS;
