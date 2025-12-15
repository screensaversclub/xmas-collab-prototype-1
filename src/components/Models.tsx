import { useCubeTexture, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { JSX } from "react";
import { useMemo } from "react";
import * as THREE from "three";
import CustomShaderMaterial from "three-custom-shader-material/vanilla";
import ballFragShader from "../shaders/ball.frag.glsl?raw";
import ballVertShader from "../shaders/ball.vert.glsl?raw";
import caneFragShader from "../shaders/cane.frag.glsl?raw";
import caneVertShader from "../shaders/cane.vert.glsl?raw";

const CUBE_TEXTURE_FILES = [
	"px.png",
	"nx.png",
	"py.png",
	"ny.png",
	"pz.png",
	"nz.png",
];
const CUBE_TEXTURE_PATH = "/cube/";

export function useEnvMap() {
	return useCubeTexture(CUBE_TEXTURE_FILES, { path: CUBE_TEXTURE_PATH });
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
	const envMap = useEnvMap();

	const uniforms = useMemo(
		() => ({
			time: { value: 0 },
			color: { value: new THREE.Color(0.2, 0.0, 0.1) },
			color1: { value: new THREE.Color(color) },
			color2: { value: new THREE.Color(color2) },
			envMapF: { value: envMap },
		}),
		[color, color2, envMap],
	);

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
useCubeTexture.preload(CUBE_TEXTURE_FILES, { path: "/cube/" });

export const ORNAMENT_MODELS = {
	Star: StarModel,
	Cane: CaneModel,
	Ball: BallModel,
};

export type OrnamentType = keyof typeof ORNAMENT_MODELS;
