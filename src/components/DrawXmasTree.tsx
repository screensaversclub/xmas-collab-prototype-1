import { Center, OrbitControls } from "@react-three/drei";
import { Canvas, type ThreeEvent } from "@react-three/fiber";
import { useDrag } from "@use-gesture/react";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import useSound from "use-sound";
import { type Ornament, type Point, useControls } from "@/store/useControls";
import placeSFX from "/place.wav";
import { Grass } from "./Grass";
import { ORNAMENT_MODELS, type OrnamentType } from "./Models";

export const DrawXmasTree = () => {
	const [playPlace] = useSound(placeSFX, { volume: 1.0 });

	const selectedOrnament = useControls((state) => state.selectedOrnament);
	const isDrawingComplete = useControls((state) => state.isDrawingComplete);
	const points = useControls((state) => state.points);
	const ornaments = useControls((state) => state.ornaments);
	const hoverData = useControls((state) => state.hoverData);
	const ballColor1 = useControls((state) => state.color);
	const ballColor2 = useControls((state) => state.color2);
	const set = useControls((state) => state.set);

	const bind = useDrag(({ last, down, initial, offset: [mx, my], first }) => {
		if (last) {
			set({ isDrawingComplete: true });
			return;
		}
		if (isDrawingComplete) {
			return;
		}
		if (!down) {
			return;
		}
		if (first) {
			set({ points: [{ idx: 0, x: initial[0], y: initial[1] }] });
		} else {
			set({
				points: [
					...points,
					{ idx: points.length, x: initial[0] + mx, y: initial[1] + my },
				],
			});
		}
	});

	const ref = useRef<THREE.Object3D | undefined>(undefined);

	const handleAddOrnament = (e: ThreeEvent<PointerEvent>) => {
		e.stopPropagation();

		const intersection = e.intersections[0];

		if (!intersection) return;

		const point = intersection.point;
		const normal = intersection?.face?.normal.clone();

		if (!normal) return;

		const offset = 0;
		const position: [number, number, number] = [
			point.x + normal.x * offset,
			point.y + normal.y * offset,
			point.z + normal.z * offset,
		];
		set({
			ornaments: [
				...ornaments,
				{
					id: crypto.randomUUID(),
					position: position,
					type: selectedOrnament,
					normal,
					clickPoint: point.clone(),
					color: ballColor1,
					color2: ballColor2,
				},
			],
		});
		playPlace();
	};

	const handleHover = (e: ThreeEvent<PointerEvent>) => {
		e.stopPropagation();
		const intersection = e.intersections[0];
		if (!intersection || !intersection.face) {
			set({ hoverData: null });
			return;
		}
		const point = intersection.point;
		const normal = intersection.face.normal.clone();
		set({
			hoverData: {
				position: [point.x, point.y, point.z],
				normal,
			},
		});
	};

	const handlePointerOut = () => {
		set({ hoverData: null });
	};

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
					camera={{
						position: [0, 12, 30],
						fov: 75,
						near: 0.001,
						far: 3000,
						rotation: [-0.23, 0, 0],
					}}
				>
					<OrbitControls
						enabled={isDrawingComplete}
						minPolarAngle={0.2}
						maxPolarAngle={1.22}
						enableZoom={false}
						enablePan={false}
					/>
					<group position={[0, 0, 0]} ref={ref} />
					<ambientLight color="#ccc" />
					<directionalLight
						color="#ccc"
						position={[-3, 5, 3]}
						target={ref.current}
					/>
					<Center>
						<TreeMesh
							points={points}
							onAddOrnament={handleAddOrnament}
							onHover={handleHover}
							onPointerOut={handlePointerOut}
						/>
					</Center>
					<Ornaments ornaments={ornaments} />
					{hoverData && (
						<CursorPreview
							position={hoverData.position}
							normal={hoverData.normal}
							type={selectedOrnament}
						/>
					)}
				</Canvas>
			</div>
		</div>
	);
};

interface TreeMeshProps {
	points: Array<Point>;
	onAddOrnament: (e: ThreeEvent<PointerEvent>) => void;
	onHover: (e: ThreeEvent<PointerEvent>) => void;
	onPointerOut: () => void;
}

const TreeMesh: React.FC<TreeMeshProps> = ({
	points,
	onAddOrnament,
	onHover,
	onPointerOut,
}) => {
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

			<mesh
				name="latheMesh"
				onPointerUp={onAddOrnament}
				onPointerMove={onHover}
				onPointerOut={onPointerOut}
			>
				<latheGeometry args={[lPoints]} />
				<meshStandardMaterial color="green" />
			</mesh>
			<Grass sourceGeometry={sourceGeometry || undefined} />
		</group>
	);
};

const Ornaments = ({ ornaments }: { ornaments: Ornament[] }) => {
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

const CursorPreview = ({
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
