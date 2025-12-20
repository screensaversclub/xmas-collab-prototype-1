import { createFileRoute } from "@tanstack/react-router";
import { pb } from "@/utils/pocketbase";

export const Route = createFileRoute("/api/submission/$shortId")({
	server: {
		handlers: {
			GET: async ({ params }) => {
				const { shortId } = params;
				try {
					const submission = await pb
						.collection("submissions")
						.getFirstListItem(`shortid="${shortId}"`);

					return Response.json({ ok: true, submission });
				} catch (err) {
					console.error(err);
					return Response.json({ ok: false }, { status: 404 });
				}
			},
		},
	},
});
