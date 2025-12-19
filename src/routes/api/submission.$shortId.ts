import { createFileRoute } from "@tanstack/react-router";
import type { ControlState } from "@/store/useControls";
import { pb } from "@/utils/pocketbase";

type SubmissionPayload = Pick<
	ControlState,
	| "points"
	| "ornaments"
	| "carvedText"
	| "recipientName"
	| "messageText"
	| "senderName"
>;

export const Route = createFileRoute("/api/submission/$shortId")({
	server: {
		handlers: {
			GET: async ({ params }) => {
				const { shortId } = params;
				try {
					const submission = (await pb
						.collection("submissions")
						.getFirstListItem(`shortId = ${shortId}`)) as SubmissionPayload;

					return Response.json({ ok: true, submission });
				} catch (err) {
					console.error(err);
					return Response.json({ ok: false }, { status: 404 });
				}
			},
		},
	},
});
