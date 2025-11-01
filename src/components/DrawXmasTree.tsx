import { PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useDrag } from "@use-gesture/react";

import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

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
				<Canvas>
					<group position={[0, 0, 0]} ref={ref} />
					<PerspectiveCamera
						makeDefault
						near={0.00001}
						far={3000}
						position={[0, 3, 10]}
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

		return _points
			.map(function normalizeToRange(p) {
				return {
					...p,
					x: (p.x - xRange[0]) / (xRange[1] - xRange[0]),
					y: 1 - (p.y - yRange[0]) / (yRange[1] - yRange[0]),
				};
			})
			.map((p) => {
				return new THREE.Vector2(p.x * 2, p.y * 4);
			});
	}, [points]);

	if (lPoints.length < 3) {
		return null;
	}
	return (
		<group>
			<mesh position={[0, 0, 0]}>
				<latheGeometry args={[lPoints, 24]} />
				<meshPhysicalMaterial color="#00ff03" />
			</mesh>

			<mesh position={[0, -0.5, 0]}>
				<cylinderGeometry args={[0.2, 0.25, 1, 12, 1]} />
				<meshPhysicalMaterial color="#956503" />
			</mesh>
		</group>
	);
};
