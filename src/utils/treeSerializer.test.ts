import { describe, it, expect } from "vitest";
import * as THREE from "three";
import type { Ornament, Point } from "@/store/useControls";
import {
	serializeTreeState,
	deserializeTreeState,
	serializeTreeStateToJSON,
	deserializeTreeStateFromJSON,
	shortId,
} from "./treeSerializer";

describe("treeSerializer", () => {
	const mockPoints: Point[] = [
		{ x: 10.123456, y: 20.789012, idx: 0 },
		{ x: 30, y: 40, idx: 1 },
		{ x: 50, y: 60, idx: 2 },
	];

	const mockOrnaments: Ornament[] = [
		{
			id: "orn1", // short id
			type: "Ball",
			position: [1.123456, 2.789012, 3.456789],
			normal: new THREE.Vector3(0, 1, 0),
			clickPoint: new THREE.Vector3(1, 2, 3),
			color: "#ff0000",
			color2: "#00ff00",
		},
		{
			id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", // long UUID to be shortened
			type: "Star",
			position: [4, 5, 6],
			normal: new THREE.Vector3(0.5, 0.5, 0),
			clickPoint: new THREE.Vector3(4, 5, 6),
			color: "#ffff00",
		},
	];

	describe("shortId", () => {
		it("should generate 8 character ids", () => {
			const id = shortId();
			expect(id.length).toBeLessThanOrEqual(8);
			expect(id.length).toBeGreaterThan(0);
		});
	});

	describe("serializeTreeState", () => {
		it("should use version 2", () => {
			const result = serializeTreeState([], []);
			expect(result.v).toBe(2);
		});

		it("should serialize points as arrays [x, y, idx]", () => {
			const result = serializeTreeState(mockPoints, []);
			expect(result.pts[0]).toEqual([10.123, 20.789, 0]); // rounded to 3 decimals
			expect(result.pts[1]).toEqual([30, 40, 1]);
		});

		it("should round floats to 3 decimal places", () => {
			const result = serializeTreeState(mockPoints, mockOrnaments);
			expect(result.pts[0][0]).toBe(10.123);
			expect(result.pts[0][1]).toBe(20.789);
			expect(result.orn[0].p).toEqual([1.123, 2.789, 3.457]);
		});

		it("should convert vectors to arrays", () => {
			const result = serializeTreeState([], mockOrnaments);
			expect(result.orn[0].n).toEqual([0, 1, 0]);
			expect(result.orn[1].n).toEqual([0.5, 0.5, 0]);
		});

		it("should use short key names", () => {
			const result = serializeTreeState(mockPoints, mockOrnaments);
			expect(result).toHaveProperty("v"); // version
			expect(result).toHaveProperty("pts"); // points
			expect(result).toHaveProperty("orn"); // ornaments
			expect(result.orn[0]).toHaveProperty("i"); // id
			expect(result.orn[0]).toHaveProperty("t"); // type
			expect(result.orn[0]).toHaveProperty("p"); // position
			expect(result.orn[0]).toHaveProperty("n"); // normal
			expect(result.orn[0]).toHaveProperty("c"); // color
		});

		it("should shorten long UUIDs", () => {
			const result = serializeTreeState([], mockOrnaments);
			expect(result.orn[0].i).toBe("orn1"); // short id preserved
			expect(result.orn[1].i.length).toBeLessThanOrEqual(8); // long UUID shortened
		});

		it("should not include clickPoint", () => {
			const result = serializeTreeState([], mockOrnaments);
			expect(result.orn[0]).not.toHaveProperty("clickPoint");
		});

		it("should handle color2 conditionally", () => {
			const result = serializeTreeState([], mockOrnaments);
			expect(result.orn[0].c2).toBe("#00ff00");
			expect(result.orn[1].c2).toBeUndefined();
		});
	});

	describe("deserializeTreeState", () => {
		it("should restore points from arrays", () => {
			const serialized = serializeTreeState(mockPoints, []);
			const result = deserializeTreeState(serialized);
			expect(result.points[0]).toEqual({ x: 10.123, y: 20.789, idx: 0 });
			expect(result.points[1]).toEqual({ x: 30, y: 40, idx: 1 });
		});

		it("should restore THREE.Vector3 instances", () => {
			const serialized = serializeTreeState([], mockOrnaments);
			const result = deserializeTreeState(serialized);

			expect(result.ornaments[0].normal).toBeInstanceOf(THREE.Vector3);
			expect(result.ornaments[0].clickPoint).toBeInstanceOf(THREE.Vector3);
		});

		it("should reconstruct clickPoint from position", () => {
			const serialized = serializeTreeState([], mockOrnaments);
			const result = deserializeTreeState(serialized);

			// clickPoint should equal position (rounded)
			expect(result.ornaments[0].clickPoint.x).toBeCloseTo(1.123, 3);
			expect(result.ornaments[0].clickPoint.y).toBeCloseTo(2.789, 3);
			expect(result.ornaments[0].clickPoint.z).toBeCloseTo(3.457, 3);
		});

		it("should restore ornament properties", () => {
			const serialized = serializeTreeState([], mockOrnaments);
			const result = deserializeTreeState(serialized);

			expect(result.ornaments[0].type).toBe("Ball");
			expect(result.ornaments[0].color).toBe("#ff0000");
			expect(result.ornaments[0].color2).toBe("#00ff00");
		});
	});

	describe("JSON helpers", () => {
		it("should serialize to valid JSON string", () => {
			const json = serializeTreeStateToJSON(mockPoints, mockOrnaments);
			expect(() => JSON.parse(json)).not.toThrow();
		});

		it("should produce compact JSON", () => {
			const json = serializeTreeStateToJSON(mockPoints, mockOrnaments);
			// Should not contain long key names
			expect(json).not.toContain('"points"');
			expect(json).not.toContain('"ornaments"');
			expect(json).not.toContain('"position"');
			expect(json).not.toContain('"normal"');
			expect(json).not.toContain('"clickPoint"');
			// Should contain short keys
			expect(json).toContain('"pts"');
			expect(json).toContain('"orn"');
		});

		it("should roundtrip through JSON", () => {
			const json = serializeTreeStateToJSON(mockPoints, mockOrnaments);
			const result = deserializeTreeStateFromJSON(json);

			expect(result.points.length).toBe(3);
			expect(result.ornaments.length).toBe(2);
			expect(result.ornaments[0].normal).toBeInstanceOf(THREE.Vector3);
			expect(result.ornaments[0].normal.y).toBe(1);
		});
	});

	describe("roundtrip", () => {
		it("should preserve data through serialize/deserialize cycle", () => {
			const serialized = serializeTreeState(mockPoints, mockOrnaments);
			const deserialized = deserializeTreeState(serialized);

			expect(deserialized.points.length).toBe(mockPoints.length);
			expect(deserialized.ornaments.length).toBe(mockOrnaments.length);

			// Check ornament (with precision loss accepted)
			const restored = deserialized.ornaments[0];
			expect(restored.type).toBe("Ball");
			expect(restored.color).toBe("#ff0000");
			expect(restored.color2).toBe("#00ff00");
			expect(restored.normal.y).toBe(1);
		});
	});
});
