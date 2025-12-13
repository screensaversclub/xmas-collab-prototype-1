import * as THREE from "three";
import type { Ornament, Point } from "@/store/useControls";
import type { OrnamentType } from "@/components/Models";

type SerializedVector3 = { x: number; y: number; z: number };

type SerializedOrnament = {
	id: string;
	type: OrnamentType;
	position: [number, number, number];
	normal: SerializedVector3;
	clickPoint: SerializedVector3;
	color: string;
	color2?: string;
};

export type SerializedTreeState = {
	version: 1;
	points: Point[];
	ornaments: SerializedOrnament[];
};

export function serializeTreeState(
	points: Point[],
	ornaments: Ornament[],
): SerializedTreeState {
	return {
		version: 1,
		points,
		ornaments: ornaments.map((o) => ({
			id: o.id,
			type: o.type,
			position: o.position,
			normal: { x: o.normal.x, y: o.normal.y, z: o.normal.z },
			clickPoint: { x: o.clickPoint.x, y: o.clickPoint.y, z: o.clickPoint.z },
			color: o.color,
			color2: o.color2,
		})),
	};
}

export function deserializeTreeState(data: SerializedTreeState): {
	points: Point[];
	ornaments: Ornament[];
} {
	return {
		points: data.points,
		ornaments: data.ornaments.map((o) => ({
			id: o.id,
			type: o.type,
			position: o.position,
			normal: new THREE.Vector3(o.normal.x, o.normal.y, o.normal.z),
			clickPoint: new THREE.Vector3(
				o.clickPoint.x,
				o.clickPoint.y,
				o.clickPoint.z,
			),
			color: o.color,
			color2: o.color2,
		})),
	};
}

/** Serialize to JSON string */
export function serializeTreeStateToJSON(
	points: Point[],
	ornaments: Ornament[],
): string {
	return JSON.stringify(serializeTreeState(points, ornaments));
}

/** Deserialize from JSON string */
export function deserializeTreeStateFromJSON(json: string): {
	points: Point[];
	ornaments: Ornament[];
} {
	return deserializeTreeState(JSON.parse(json));
}
