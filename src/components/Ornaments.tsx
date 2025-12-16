import { useMemo } from "react";
import * as THREE from "three";
import { type Ornament, useControls } from "@/store/useControls";
import { ORNAMENT_MODELS, type OrnamentType } from "./Models";

export const Ornaments = ({ ornaments }: { ornaments: Ornament[] }) => {
	return (
		<group name="ornaments">
			{ornaments.map((ornament) => {
				const normalXZ = new THREE.Vector3(
					ornament.normal.x,
					0,
					ornament.normal.z,
				).normalize();

				const angle = Math.atan2(normalXZ.x, normalXZ.z);

				const quaternion = new THREE.Quaternion();
				quaternion.setFromEuler(new THREE.Euler(0, angle, 0, "XYZ"));

				const Model = ORNAMENT_MODELS[ornament.type];

				return (
					<group
						key={ornament.id}
						position={ornament.position}
						quaternion={quaternion}
					>
						{ornament.type === "Ball" || ornament.type === "Cane" ? (
							<Model color={ornament.color} color2={ornament.color2} />
						) : (
							<Model color={ornament.color} />
						)}
					</group>
				);
			})}
		</group>
	);
};

export const CursorPreview = ({
	position,
	normal,
	type,
}: {
	position: [number, number, number];
	normal: THREE.Vector3;
	type: OrnamentType;
}) => {
	const color1 = useControls((state) => state.color);
	const color2 = useControls((state) => state.color2);

	const quaternion = useMemo(() => {
		const normalXZ = new THREE.Vector3(normal.x, 0, normal.z).normalize();
		const angle = Math.atan2(normalXZ.x, normalXZ.z);
		const q = new THREE.Quaternion();
		q.setFromEuler(new THREE.Euler(0, angle, 0, "XYZ"));
		return q;
	}, [normal]);

	const Model = ORNAMENT_MODELS[type];

	return (
		<group position={position} quaternion={quaternion}>
			<group>
				<Model color={color1} color2={color2} />
			</group>
		</group>
	);
};
