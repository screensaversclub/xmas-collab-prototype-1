import * as THREE from "three";
import type { Ornament, Point } from "@/store/useControls";
import type { OrnamentType } from "@/components/Models";

// Compact format: vectors as [x,y,z], short keys, no clickPoint
type SerializedVector3 = [number, number, number];
type SerializedPoint = [number, number, number]; // [x, y, idx]

type SerializedOrnament = {
	i: string; // id
	t: OrnamentType; // type
	p: SerializedVector3; // position
	n: SerializedVector3; // normal
	c: string; // color
	c2?: string; // color2
};

export type SerializedTreeState = {
	v: 2; // version
	pts: SerializedPoint[]; // points
	orn: SerializedOrnament[]; // ornaments
};

const PRECISION = 3;

function round(n: number): number {
	return Math.round(n * 10 ** PRECISION) / 10 ** PRECISION;
}

function vec3ToArray(v: THREE.Vector3): SerializedVector3 {
	return [round(v.x), round(v.y), round(v.z)];
}

function arrayToVec3(arr: SerializedVector3): THREE.Vector3 {
	return new THREE.Vector3(arr[0], arr[1], arr[2]);
}

/** Generate short ID (8 chars) */
export function shortId(): string {
	return Math.random().toString(36).slice(2, 10);
}

export function serializeTreeState(
	points: Point[],
	ornaments: Ornament[],
): SerializedTreeState {
	return {
		v: 2,
		pts: points.map((p) => [round(p.x), round(p.y), p.idx]),
		orn: ornaments.map((o) => {
			const serialized: SerializedOrnament = {
				i: o.id.length > 8 ? shortId() : o.id, // shorten long UUIDs
				t: o.type,
				p: [round(o.position[0]), round(o.position[1]), round(o.position[2])],
				n: vec3ToArray(o.normal),
				c: o.color,
			};
			if (o.color2) serialized.c2 = o.color2;
			return serialized;
		}),
	};
}

export function deserializeTreeState(data: SerializedTreeState): {
	points: Point[];
	ornaments: Ornament[];
} {
	return {
		points: data.pts.map((p) => ({ x: p[0], y: p[1], idx: p[2] })),
		ornaments: data.orn.map((o) => ({
			id: o.i,
			type: o.t,
			position: o.p as [number, number, number],
			normal: arrayToVec3(o.n),
			clickPoint: arrayToVec3(o.p), // reconstruct from position
			color: o.c,
			color2: o.c2,
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
