import type * as THREE from "three";
import { create } from "zustand";
import type { OrnamentType } from "../components/Models";

export type Point = Record<"x" | "y" | "idx", number>;

export type Ornament = {
	id: string;
	type: OrnamentType;
	position: [number, number, number];
	normal: THREE.Vector3;
	clickPoint: THREE.Vector3;
	color: string;
	color2?: string;
};

export type HoverData = {
	position: [number, number, number];
	normal: THREE.Vector3;
} | null;

export interface ControlState {
	SCENE:
		| "INTRO"
		| "DRAW_TREE"
		| "DECORATE_ORNAMENTS"
		| "PICK_JAR"
		| "INSERT_PLATE_TEXT"
		| "INPUT_DELIVERY_DETAILS"
		| "SUCCESS"
		| "VIEW";

	bladeCount: number;
	patchSize: number;
	bladeHeight: number;
	bladeWidth: number;
	windStrength: number;
	timeScale: number;
	noiseFreq: number;
	noiseAmp: number;
	colorBottom: string; // hex
	colorTop: string; // hex
	curvature: number;
	distribution: "plane" | "sphere" | "torus" | "custom";
	followNormals: boolean;
	waveAmp: number;
	waveLength: number;
	waveSpeed: number;
	waveDirectionDeg: number; // direction angle in degrees on XZ plane
	waveBlend: number; // blend factor 0-1
	wireframe: boolean; // show wireframe for grass material
	selectedOrnament: OrnamentType;
	isDrawingComplete: boolean;
	points: Point[];
	ornaments: Ornament[];
	hoverData: HoverData;
	ornamentBaseColor: string;
	color: string;
	color2: string;
	set: (partial: Partial<ControlState>) => void;
}

export const useControls = create<ControlState>((set) => ({
	SCENE: "INTRO",

	bladeCount: 20000,
	patchSize: 100,
	bladeHeight: 0.55,
	bladeWidth: 0.2,
	windStrength: 0.6,
	timeScale: 1.0,
	noiseFreq: 0.9,
	noiseAmp: 0.4,
	colorBottom: "#006600",
	colorTop: "#238922",
	curvature: 0.3,
	distribution: "custom" as const,
	followNormals: true,
	waveAmp: 0.8,
	waveLength: 40,
	waveSpeed: 0.18,
	waveDirectionDeg: 35,
	waveBlend: 1,
	wireframe: false,
	selectedOrnament: "Ball",
	isDrawingComplete: false,
	points: [],
	ornaments: [],
	hoverData: null,
	ornamentBaseColor: "red",
	color: "red",
	color2: "green",
	set: (partial) => set(partial),
}));
