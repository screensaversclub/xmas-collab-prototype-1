import { useGLTF } from "@react-three/drei";
import { useMemo, type JSX } from "react";
import * as THREE from "three";
import { useEnvMap } from "./Models";

type GLTFResult = {
	nodes: {
		box: THREE.Mesh;
		ribbon: THREE.Mesh;
	};
	materials: {
		"Material.001": THREE.MeshStandardMaterial;
		metal: THREE.MeshStandardMaterial;
	};
};

type PresentProps = JSX.IntrinsicElements["group"] & {
	ribbonColor?: THREE.ColorRepresentation;
};

export function Present({ ribbonColor = "red", ...props }: PresentProps) {
	const { nodes, materials } = useGLTF(
		"/try-transformed.glb",
	) as unknown as GLTFResult;

	const envMap = useEnvMap();

	const boxMaterial = useMemo(() => {
		const mat = materials["Material.001"].clone();
		mat.envMap = envMap;
		return mat;
	}, [materials, envMap]);

	const ribbonMaterial = useMemo(() => {
		const mat = materials.metal.clone();
		mat.envMap = envMap;
		mat.color = new THREE.Color(ribbonColor);
		mat.roughness = 0.5;
		return mat;
	}, [materials, envMap, ribbonColor]);

	return (
		<group {...props} dispose={null}>
			<mesh geometry={nodes.box.geometry} material={boxMaterial} />
			<mesh
				geometry={nodes.ribbon.geometry}
				material={ribbonMaterial}
				scale={1}
			/>
		</group>
	);
}

useGLTF.preload("/try-transformed.glb");
