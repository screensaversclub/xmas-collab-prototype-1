import { createFileRoute } from "@tanstack/react-router";
import { DrawXmasTree } from "@/components/DrawXmasTree";

export const Route = createFileRoute("/")({ component: App });

function App() {
	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
			<DrawXmasTree />
		</div>
	);
}
