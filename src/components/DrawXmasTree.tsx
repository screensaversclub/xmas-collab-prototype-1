import { PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useControls } from "@/store/useControls";
import { useDrag } from "@use-gesture/react";

import { useMemo, useRef, useState } from "react";

import * as THREE from "three";
import { Grass } from "./Grass";

type Point = Record<"x" | "y" | "idx", number>;

export const DrawXmasTree = () => {
	const [points, setPoints] = useState<Array<Point>>([]);
	const bind = useDrag(({ down, initial, offset: [mx, my], first }) => {
		if (!down) {
			return;
		}
		if (first) {
			setPoints(() => [{ idx: 0, x: initial[0], y: initial[1] }]);
		} else {
			setPoints((_points) => [
				..._points,
				{ idx: _points.length, x: initial[0] + mx, y: initial[1] + my },
			]);
		}
	});

	const ref = useRef<THREE.Object3D | undefined>(undefined);

	return (
		<div
			className="w-full min-h-screen bg-amber-50"
			{...bind()}
			style={{
				touchAction: "none",
			}}
		>
			{points.map((point) => {
				return (
					<b
						key={`point_${point.idx}`}
						style={{
							position: "absolute",
							pointerEvents: "none",
							left: point.x,
							top: point.y,
							zIndex: 4,
						}}
					>
						x
					</b>
				);
			})}
			<div
				className="w-full h-screen"
				style={{
					pointerEvents: "none",
				}}
			>
				<Canvas
					gl={{
						stencil: false,
						depth: true,
						preserveDrawingBuffer: false,
					}}
				>
					<group position={[0, 0, 0]} ref={ref} />
					<PerspectiveCamera
						makeDefault
						near={0.001}
						far={3000}
						position={[0, 12, 30]}
						rotation={[-0.23, 0, 0]}
					/>
					<ambientLight color="#ccc" />
					<directionalLight
						color="#ccc"
						position={[-3, 5, 3]}
						target={ref.current}
					/>

					<TreeMesh points={points} />
				</Canvas>
			</div>
		</div>
	);
};

const TreeMesh: React.FC<{ points: Array<Point> }> = ({ points }) => {
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

	const { distribution, patchSize } = useControls();

	const latheGeometryTree = useMemo(() => {
		if (lPoints.length < 3) {
			return undefined;
		}
		return new THREE.LatheGeometry(lPoints);
	}, [lPoints]);

	const sourceGeometry = useMemo(() => {
		if (distribution === "custom") {
			if (latheGeometryTree) {
				const merged = latheGeometryTree;

				if (!merged.getAttribute("normal")) {
					merged.computeVertexNormals();
				}
				merged.computeBoundingSphere();
				merged.computeBoundingBox();
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
			<mesh position={[0, -2.75, 0]}>
				<cylinderGeometry args={[0.7, 1, 12, 12, 1]} />
				<meshPhysicalMaterial color="#453503" />
			</mesh>

			<mesh>
				<latheGeometry args={[lPoints]} />
			</mesh>
			<Grass sourceGeometry={sourceGeometry || undefined} />
		</group>
	);
};
