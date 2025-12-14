import { animated, useTransition } from "@react-spring/web";
import { CameraControls } from "@react-three/drei";
import { Canvas, type ThreeEvent } from "@react-three/fiber";
import { useDrag } from "@use-gesture/react";
import {
	useCallback,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
} from "react";
import * as THREE from "three";
import { DEG2RAD } from "three/src/math/MathUtils.js";
import useSound from "use-sound";
import { type Ornament, type Point, useControls } from "@/store/useControls";
import placeSFX from "/place.wav";
import { Base } from "./Base";
import { Globe } from "./Globe";
import { Grass } from "./Grass";
import { ORNAMENT_MODELS, type OrnamentType } from "./Models";

export const DrawXmasTree = () => {
	const [playPlace] = useSound(placeSFX, { volume: 1.0 });
	const [isPlacing, setIsPlacing] = useState(false);
	const cameraControlRef = useRef<CameraControls>(null);

	const selectedOrnament = useControls((state) => state.selectedOrnament);
	const scene = useControls((state) => state.SCENE);
	const points = useControls((state) => state.points);
	const set = useControls((state) => state.set);
	const ornaments = useControls((state) => state.ornaments);
	const hoverData = useControls((state) => state.hoverData);
	const ballColor1 = useControls((state) => state.color);
	const ballColor2 = useControls((state) => state.color2);
	const carvedText = useControls((state) => state.carvedText);

	useEffect(() => {
		if (!isPlacing) return;
		const handlePointerUp = () => setIsPlacing(false);
		// to capture pointer-up on three mesh and also outside the tree mesh
		window.addEventListener("pointerup", handlePointerUp);
		return () => window.removeEventListener("pointerup", handlePointerUp);
	}, [isPlacing]);

	const resetAll = useCallback(() => {
		set({ points: [], SCENE: "INTRO", ornaments: [] });
	}, [set]);

	const bind = useDrag(({ down, first, xy, target }) => {
		const _target = target as HTMLDivElement;

		if (!down) {
			return;
		}
		if (first) {
			set({
				points: [
					{
						idx: 0,
						x: xy[0] - _target.offsetLeft,
						y: xy[1] - _target.offsetTop,
					},
				],
			});
		} else {
			set({
				points: [
					...points,
					{
						idx: points.length,
						x: xy[0] - _target.offsetLeft,
						y: xy[1] - _target.offsetTop,
					},
				],
			});
		}
	});

	const ref = useRef<THREE.Object3D | undefined>(undefined);

	const rotateCamera = useCallback(
		(direction: "left" | "right") => {
			if (!cameraControlRef.current) return;
			playPlace();
			cameraControlRef.current?.rotate(
				direction === "left" ? 1 : -1 * 45 * DEG2RAD,
				0,
				true,
			);
		},
		[playPlace],
	);

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
			hoverData: null,
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

	const hasDrawn = useMemo(() => points.length > 0, [points]);
	const hasOrnaments = ornaments.length > 0;

	const getNextScene = useCallback(() => {
		if (scene === "DRAW_TREE") return "DECORATE_ORNAMENTS";
		if (scene === "DECORATE_ORNAMENTS") return "INSERT_PLATE_TEXT";
		return null;
	}, [scene]);

	const showNextButton =
		(hasDrawn && scene === "DRAW_TREE") ||
		(scene === "DECORATE_ORNAMENTS" && hasOrnaments);

	const handleNextScreen = useCallback(() => {
		const nextScene = getNextScene();
		if (nextScene) {
			if (nextScene === "INSERT_PLATE_TEXT") {
				const cam = cameraControlRef.current;
				if (cam !== null) {
					const { polarAngle } = cam;
					cam.rotateTo(0, polarAngle, true);
				}
			}
			set({ SCENE: nextScene });
		}
	}, [set, getNextScene]);

	const handlePreviousScreen = useCallback(() => {
		if (scene === "DECORATE_ORNAMENTS") {
			set({ SCENE: "DRAW_TREE", points: [], ornaments: [] });
		} else {
			resetAll();
		}
	}, [resetAll, set, scene]);

	const nextButtonTransition = useTransition(showNextButton, {
		from: { opacity: 0, scale: 0 },
		enter: { opacity: 1, scale: 1, delay: 350 },
		leave: { opacity: 0, scale: 0 },
	});

	const gradientTransition = useTransition(scene === "DRAW_TREE", {
		from: { opacity: 0 },
		enter: { opacity: 1, delay: 1200 },
		leave: { opacity: 0 },
	});

	const drawCanvasTransition = useTransition(scene === "DRAW_TREE", {
		from: { scale: 0 },
		enter: { scale: 1, delay: 1000 },
		leave: { opacity: 0 },
	});

	const backButtonTransition = useTransition(
		scene === "DRAW_TREE" || scene === "DECORATE_ORNAMENTS",
		{
			from: { opacity: 0, y: -20 },
			enter: { opacity: 1, y: 0, delay: 1400 },
			leave: { y: -20, opacity: 0 },
		},
	);

	const writePlateTextTransition = useTransition(
		scene === "INSERT_PLATE_TEXT",
		{
			from: { opacity: 0, y: -20 },
			enter: { opacity: 1, y: 0, delay: 1400 },
			leave: { y: -20, opacity: 0 },
		},
	);

	const rotateButtonsTransition = useTransition(
		scene === "DECORATE_ORNAMENTS" || scene === "INSERT_PLATE_TEXT",
		{
			from: { opacity: 0, scale: 0 },
			enter: { opacity: 1, scale: 1, delay: 1200 },
			leave: { opacity: 0, scale: 0 },
		},
	);

	const drawCanvasId = useId();

	return (
		<div
			className="w-full min-h-screen overflow-hidden relative"
			style={{
				pointerEvents: "none",
				touchAction: "none",
			}}
		>
			<div
				className="w-[200dvmax] h-[200dvmax] bg-[#19844c]"
				style={{
					transform: `translate(-50%, -50%) scale(${scene === "DRAW_TREE" || scene === "DECORATE_ORNAMENTS" ? 1 : 0})`,
					borderRadius: "100%",
					position: "absolute",
					left: "50%",
					top: "50%",
					transition: "all ease-in .8s",
				}}
			></div>

			<div
				className="w-[200dvmax] h-[200dvmax] bg-[#4C42DB]"
				style={{
					transform: `translate(-50%, -50%) scale(${scene === "DECORATE_ORNAMENTS" || scene === "INSERT_PLATE_TEXT" ? 1 : 0})`,
					borderRadius: "100%",
					position: "absolute",
					left: "50%",
					top: "50%",
					transition: "all ease-in .8s",
				}}
			></div>
			<div
				className="w-full h-screen"
				style={{
					pointerEvents: "none",
				}}
			>
				{gradientTransition(
					(style, item) =>
						item && (
							<animated.div
								style={{
									position: "absolute",
									top: 0,
									left: "50%",
									width: "50%",
									height: "100%",
									background:
										"linear-gradient(90deg, rgba(25, 132, 76, 0) 0%, rgba(25, 132, 76, .6) 12%)",
									zIndex: 3,
									...style,
								}}
							/>
						),
				)}

				{backButtonTransition(
					(style, item) =>
						item && (
							<animated.img
								src="/back.svg"
								alt="Back"
								className="absolute pointer-events-auto top-[2dvw] left-[2dvw] z-10 w-[100px] cursor-pointer mt-[2dvh]"
								style={style}
								onClick={handlePreviousScreen}
							/>
						),
				)}

				{nextButtonTransition(
					(style, item) =>
						item && (
							<animated.div
								className="next-button-animated absolute pointer-events-auto top-[2dvw] right-[2dvw] z-10 cursor-pointer"
								style={style}
								onClick={handleNextScreen}
							/>
						),
				)}

				{drawCanvasTransition(
					(style, item) =>
						item && (
							<animated.div
								id={drawCanvasId}
								{...bind()}
								style={{
									position: "absolute",
									left: "50%",
									background: "transparent",
									borderRadius: "3dvw",
									borderColor: "oklab(70.2% -0.114 0.055)",
									borderWidth: "2dvw",
									width: "48dvw",
									padding: "1dvw",
									top: "12dvh",
									height: "42dvh",
									zIndex: "50",
									overflow: "hidden",
									boxSizing: "border-box",
									pointerEvents: scene === "DRAW_TREE" ? "auto" : "none",
									...style,
								}}
							>
								<div
									className="w-[calc(100%-2dvw)] h-[calc(100%-2dvw)] pointer-events-none"
									style={{
										borderColor: "oklab(70.2% -0.114 0.055)",
										borderWidth: ".6dvw",
										borderRadius: "1dvw",
										position: "absolute",
										boxSizing: "border-box",
									}}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										role="presentation"
										overflow={"visible"}
										style={{
											pointerEvents: "none",
											position: "absolute",
											width: "100%",
											height: "100%",
										}}
									>
										<path
											fill="transparent"
											stroke={"oklab(90.2% -0.114 0.055)"}
											strokeDasharray={"6,9"}
											strokeWidth={3}
											d={`${points
												.map((p, i, arr) => {
													if (i === 0) {
														return `M ${p.x} ${p.y}`;
													} else if (i === arr.length - 1) {
														return "";
													} else {
														return `L ${p.x} ${p.y}`;
													}
												})
												.join(" ")}`}
										/>
									</svg>
								</div>
							</animated.div>
						),
				)}
				<Canvas
					gl={{
						stencil: false,
						depth: true,
						preserveDrawingBuffer: false,
						outputColorSpace: THREE.SRGBColorSpace,
					}}
					style={{
						pointerEvents:
							scene === "DRAW_TREE" || scene === "DECORATE_ORNAMENTS"
								? "auto"
								: "none",
						touchAction:
							scene === "DRAW_TREE" || scene === "DECORATE_ORNAMENTS"
								? "auto"
								: "none",
					}}
					camera={{
						position: [0, 12, 50],
						fov: 70,
						near: 0.001,
						far: 3000,
						rotation: [-0.23, 0, 0],
					}}
				>
					<CameraControls
						ref={cameraControlRef}
						dollySpeed={0}
						truckSpeed={0}
						azimuthRotateSpeed={0}
						polarRotateSpeed={0}
					/>
					<group position={[0, 0, 0]} ref={ref} />
					<ambientLight color="#ccc" />
					<directionalLight
						color="#ccc"
						position={[-3, 5, -3]}
						// target={ref.current}
					/>
					<directionalLight
						color="#ccc"
						position={[-3, 5, 3]}
						// target={ref.current}
					/>
					<TreeMesh
						points={points}
						onAddOrnament={handleAddOrnament}
						onHover={handleHover}
						onPointerOut={handlePointerOut}
						onPlacingChange={setIsPlacing}
					/>
					<Ornaments ornaments={ornaments} />
					{hoverData && scene === "DECORATE_ORNAMENTS" && (
						<CursorPreview
							position={hoverData.position}
							normal={hoverData.normal}
							type={selectedOrnament}
						/>
					)}
					<Globe />
					<Base />
				</Canvas>
			</div>

			{rotateButtonsTransition(
				(style, item) =>
					item && (
						<div>
							<animated.button
								type="button"
								onClick={() => rotateCamera("left")}
								style={{
									position: "fixed",
									left: "3dvw",
									bottom: "40%",
									pointerEvents: "auto",
									background: "none",
									border: "none",
									cursor: "pointer",
									maxWidth: "100px",
									...style,
								}}
							>
								<img
									src="/rotate_button.svg"
									alt="Rotate left"
									style={{ transform: "scaleX(1)", width: "12dvw" }}
								/>
							</animated.button>
							<animated.button
								type="button"
								onClick={() => rotateCamera("right")}
								style={{
									position: "fixed",
									right: "3dvw",
									bottom: "40%",
									pointerEvents: "auto",
									background: "none",
									border: "none",
									cursor: "pointer",
									maxWidth: "100px",
									...style,
								}}
							>
								<img
									src="/rotate_button.svg"
									alt="Rotate right"
									style={{ transform: "scaleX(-1)", width: "12dvw" }}
								/>
							</animated.button>
						</div>
					),
			)}

			{writePlateTextTransition(
				(style, item) =>
					item && (
						<div>
							<animated.div
								style={{
									position: "fixed",
									left: "50%",
									bottom: "6dvh",
									pointerEvents: "auto",
									background: "none",
									border: "none",
									cursor: "pointer",
									transform: "translate(-50%, 0)",
									...style,
								}}
							>
								<div className="w-[90dvw] max-w-[300px]">
									<input
										type="text"
										onChange={(e) => {
											const text = e.target.value.slice(0, 15);
											set({ carvedText: text });
										}}
										value={carvedText}
										placeholder="Your message here"
										className="text-center w-full text-[6dvw] rounded-[2dvw] p-[2dvw] bg-white border-0"
									/>
								</div>
							</animated.div>
						</div>
					),
			)}
		</div>
	);
};

interface TreeMeshProps {
	points: Array<Point>;
	onAddOrnament: (e: ThreeEvent<PointerEvent>) => void;
	onHover: (e: ThreeEvent<PointerEvent>) => void;
	onPointerOut: () => void;
	onPlacingChange: (isPlacing: boolean) => void;
}

const TreeMesh: React.FC<TreeMeshProps> = ({
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
				// merged.computeBoundingSphere();
				// merged.computeBoundingBox();
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
