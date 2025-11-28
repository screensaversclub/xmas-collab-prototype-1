import { useGLTF } from "@react-three/drei";
import type { JSX } from "react";
import type * as THREE from "three";

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
			scale={0.6}
		>
			<meshStandardMaterial
				color={color}
				roughness={0.26}
				metalness={0.527}
				opacity={1}
			/>
		</mesh>
	);
};

export const CaneModel = (
	props: JSX.IntrinsicElements["mesh"] & { color?: string },
) => {
	const { color = "red", ...restProps } = props;
	const { nodes, materials } = useGLTF("/candy_cane.glb");
	return (
		<mesh
			{...restProps}
			geometry={(nodes.Cane as THREE.Mesh)?.geometry}
			material={materials.Cane}
			scale={0.3}
		>
			<meshStandardMaterial color={color} />
		</mesh>
	);
};

export const BallModel = (
	props: JSX.IntrinsicElements["group"] & { color?: string },
) => {
	const { color = "red", ...restProps } = props;
	const { nodes, materials } = useGLTF("/ball.glb");

	return (
		<group {...restProps}>
			<mesh geometry={(nodes.Circle as THREE.Mesh)?.geometry} scale={0.3}>
				<meshStandardMaterial
					roughness={0.26}
					metalness={0.727}
					color={(materials.Tip as THREE.MeshStandardMaterial)?.color}
				/>
			</mesh>
			<mesh geometry={(nodes.Tip as THREE.Mesh)?.geometry} scale={0.3}>
				<meshStandardMaterial
					roughness={0.26}
					metalness={0.727}
					color={(materials.Tip as THREE.MeshStandardMaterial)?.color}
				/>
			</mesh>
			<mesh geometry={(nodes.Ball as THREE.Mesh)?.geometry} scale={0.3}>
				<meshStandardMaterial color={color} />
			</mesh>
		</group>
	);
};
useGLTF.preload("/star.glb");
useGLTF.preload("/candy_cane.glb");
useGLTF.preload("/ball.glb");

export const ORNAMENT_MODELS = {
	Star: StarModel,
	Cane: CaneModel,
	Ball: BallModel,
};

export type OrnamentType = keyof typeof ORNAMENT_MODELS;
