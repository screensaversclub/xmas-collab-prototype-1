import { describe, it, expect } from "vitest";
import * as THREE from "three";
import type { Ornament, Point } from "@/store/useControls";
import {
	serializeTreeState,
	deserializeTreeState,
	serializeTreeStateToJSON,
	deserializeTreeStateFromJSON,
} from "./treeSerializer";

describe("treeSerializer", () => {
	const mockPoints: Point[] = [
		{ x: 10, y: 20, idx: 0 },
		{ x: 30, y: 40, idx: 1 },
		{ x: 50, y: 60, idx: 2 },
	];

	const mockOrnaments: Ornament[] = [
		{
			id: "ornament-1",
			type: "Ball",
			position: [1, 2, 3],
			normal: new THREE.Vector3(0, 1, 0),
			clickPoint: new THREE.Vector3(1, 2, 3),
			color: "#ff0000",
			color2: "#00ff00",
		},
		{
			id: "ornament-2",
			type: "Star",
			position: [4, 5, 6],
			normal: new THREE.Vector3(0.5, 0.5, 0),
			clickPoint: new THREE.Vector3(4, 5, 6),
			color: "#ffff00",
		},
	];

	describe("serializeTreeState", () => {
		it("should serialize points unchanged", () => {
			const result = serializeTreeState(mockPoints, []);
			expect(result.points).toEqual(mockPoints);
		});

		it("should include version number", () => {
			const result = serializeTreeState([], []);
			expect(result.version).toBe(1);
		});

		it("should convert THREE.Vector3 to plain objects", () => {
			const result = serializeTreeState([], mockOrnaments);
			expect(result.ornaments[0].normal).toEqual({ x: 0, y: 1, z: 0 });
			expect(result.ornaments[0].clickPoint).toEqual({ x: 1, y: 2, z: 3 });
		});

		it("should preserve all ornament properties", () => {
			const result = serializeTreeState([], mockOrnaments);
			expect(result.ornaments[0].id).toBe("ornament-1");
			expect(result.ornaments[0].type).toBe("Ball");
			expect(result.ornaments[0].position).toEqual([1, 2, 3]);
			expect(result.ornaments[0].color).toBe("#ff0000");
			expect(result.ornaments[0].color2).toBe("#00ff00");
		});

		it("should handle ornaments without color2", () => {
			const result = serializeTreeState([], mockOrnaments);
			expect(result.ornaments[1].color2).toBeUndefined();
		});
	});

	describe("deserializeTreeState", () => {
		it("should restore points unchanged", () => {
			const serialized = serializeTreeState(mockPoints, []);
			const result = deserializeTreeState(serialized);
			expect(result.points).toEqual(mockPoints);
		});

		it("should restore THREE.Vector3 instances", () => {
			const serialized = serializeTreeState([], mockOrnaments);
			const result = deserializeTreeState(serialized);

			expect(result.ornaments[0].normal).toBeInstanceOf(THREE.Vector3);
			expect(result.ornaments[0].clickPoint).toBeInstanceOf(THREE.Vector3);
		});

		it("should restore correct Vector3 values", () => {
			const serialized = serializeTreeState([], mockOrnaments);
			const result = deserializeTreeState(serialized);

			expect(result.ornaments[0].normal.x).toBe(0);
			expect(result.ornaments[0].normal.y).toBe(1);
			expect(result.ornaments[0].normal.z).toBe(0);
		});

		it("should preserve all ornament properties", () => {
			const serialized = serializeTreeState(mockPoints, mockOrnaments);
			const result = deserializeTreeState(serialized);

			expect(result.ornaments[0].id).toBe("ornament-1");
			expect(result.ornaments[0].type).toBe("Ball");
			expect(result.ornaments[0].position).toEqual([1, 2, 3]);
			expect(result.ornaments[0].color).toBe("#ff0000");
			expect(result.ornaments[0].color2).toBe("#00ff00");
		});
	});

	describe("JSON helpers", () => {
		it("should serialize to valid JSON string", () => {
			const json = serializeTreeStateToJSON(mockPoints, mockOrnaments);
			expect(() => JSON.parse(json)).not.toThrow();
		});

		it("should roundtrip through JSON", () => {
			const json = serializeTreeStateToJSON(mockPoints, mockOrnaments);
			const result = deserializeTreeStateFromJSON(json);

			expect(result.points).toEqual(mockPoints);
			expect(result.ornaments.length).toBe(2);
			expect(result.ornaments[0].normal).toBeInstanceOf(THREE.Vector3);
			expect(result.ornaments[0].normal.y).toBe(1);
		});
	});

	describe("roundtrip", () => {
		it("should preserve data through serialize/deserialize cycle", () => {
			const serialized = serializeTreeState(mockPoints, mockOrnaments);
			const deserialized = deserializeTreeState(serialized);

			// Check points
			expect(deserialized.points).toEqual(mockPoints);

			// Check ornament count
			expect(deserialized.ornaments.length).toBe(mockOrnaments.length);

			// Check first ornament deeply
			const original = mockOrnaments[0];
			const restored = deserialized.ornaments[0];

			expect(restored.id).toBe(original.id);
			expect(restored.type).toBe(original.type);
			expect(restored.position).toEqual(original.position);
			expect(restored.color).toBe(original.color);
			expect(restored.color2).toBe(original.color2);
			expect(restored.normal.x).toBe(original.normal.x);
			expect(restored.normal.y).toBe(original.normal.y);
			expect(restored.normal.z).toBe(original.normal.z);
		});
	});
});
