import { useMemo } from "react";
import * as THREE from "three";
import type { ThreeEvent } from "@react-three/fiber";
import { type Point, useControls } from "@/store/useControls";
import { Grass } from "./Grass";

interface TreeMeshProps {
	points: Array<Point>;
	onAddOrnament: (e: ThreeEvent<PointerEvent>) => void;
	onHover: (e: ThreeEvent<PointerEvent>) => void;
	onPointerOut: () => void;
	onPlacingChange: (isPlacing: boolean) => void;
}

export const TreeMesh: React.FC<TreeMeshProps> = ({
	points,
	onAddOrnament,
	onHover,
	onPointerOut,
	onPlacingChange,
}) => {
	const scene = useControls((a) => a.SCENE);
	const facing = useMemo(() => {
		if (points.length < 2) {
			return "UP" as const;
		} else {
			if (points[0].y < points[points.length - 1].y) {
				return "UP" as const;
			} else {
				return "DOWN" as const;
			}
		}
	}, [points]);

	const lPoints = useMemo(() => {
		const _points = points.reduce<Point[]>((p, c, i, a) => {
			if (i === 0 || i === a.length - 1) {
				p.push(c);
				return p;
			} else {
				const THRESHOLD = 10;
				const lastPoint = p.at(p.length - 1) ?? { x: 0, y: 0, idx: 32 };
				const dist = Math.sqrt(
					(lastPoint.x - c.x) ** 2 + (lastPoint.y - c.y) ** 2,
				);
				if (dist > THRESHOLD) {
					p.push(c);
					return p;
				}
				return p;
			}
		}, []);
		const xRange = _points.reduce(
			(p, c, i) => {
				if (i === 0) {
					return [c.x, c.x];
				} else if (i === 1) {
					if (c.x < p[0]) {
						return [c.x, p[1]];
					} else {
						return [p[0], c.x + 0.01];
					}
				} else if (c.x < p[0]) {
					return [c.x, p[1]];
				} else if (c.x > p[1]) {
					return [p[0], c.x];
				} else {
					return p;
				}
			},
			[0, 0],
		);

		const yRange = _points.reduce(
			(p, c, i) => {
				if (i === 0) {
					return [c.y, c.y];
				} else if (i === 1) {
					if (c.y < p[0]) {
						return [c.y, p[1]];
					} else {
						return [p[0], c.y + 0.01];
					}
				} else if (c.y < p[0]) {
					return [c.y, p[1]];
				} else if (c.y > p[1]) {
					return [p[0], c.y];
				} else {
					return p;
				}
			},
			[0, 0],
		);

		const __points = _points
			.map(function normalizeToRange(p) {
				return {
					...p,
					x: (p.x - xRange[0]) / (xRange[1] - xRange[0]),
					y: 1 - (p.y - yRange[0]) / (yRange[1] - yRange[0]),
				};
			})
			.map((p) => {
				return new THREE.Vector2(p.x * 8, p.y * 16);
			});

		__points.push(new THREE.Vector2(0, 1));

		return __points;
	}, [points]);

	const distribution = useControls((state) => state.distribution);
	const patchSize = useControls((state) => state.patchSize);

	const latheGeometryTree = useMemo(() => {
		if (lPoints.length < 3) {
			return undefined;
		}
		if (facing === "DOWN") {
			return new THREE.LatheGeometry(lPoints);
		} else {
			return new THREE.LatheGeometry(lPoints.reverse());
		}
	}, [lPoints, facing]);

	const sourceGeometry = useMemo(() => {
		if (distribution === "custom") {
			if (latheGeometryTree) {
				const merged = latheGeometryTree;

				if (!merged.getAttribute("normal")) {
					merged.computeVertexNormals();
				}
				return merged;
			}
			return null;
		}
		switch (distribution) {
			case "sphere": {
				const g = new THREE.SphereGeometry(patchSize * 0.5, 32, 32);
				g.computeBoundingSphere();
				g.computeBoundingBox();
				return g;
			}
			case "torus": {
				const g = new THREE.TorusKnotGeometry(
					patchSize * 0.2,
					patchSize * 0.06,
					128,
					16,
				);
				g.computeBoundingSphere();
				g.computeBoundingBox();
				return g;
			}
		}
	}, [distribution, patchSize, latheGeometryTree]);

	if (lPoints.length < 3) {
		return null;
	}

	return (
		<group>
			<mesh position={[0, 1, 0]}>
				<cylinderGeometry args={[0.7, 1, 10, 12, 1]} />
				<meshPhysicalMaterial color="#453503" />
			</mesh>

			<mesh
				name="latheMesh"
				onPointerUp={(e) => {
					if (scene === "DECORATE_ORNAMENTS") {
						onAddOrnament(e);
					}
				}}
				onPointerMove={onHover}
				onPointerDown={(e) => {
					if (scene === "DECORATE_ORNAMENTS") {
						onPlacingChange(true);
					}
					onHover(e);
				}}
				onPointerOut={onPointerOut}
				position={[0, 2, 0]}
			>
				<latheGeometry args={[lPoints]} />
				<meshStandardMaterial color="green" />
			</mesh>
			<Grass sourceGeometry={sourceGeometry || undefined} />
		</group>
	);
};
