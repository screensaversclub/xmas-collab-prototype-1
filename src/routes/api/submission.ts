import { createFileRoute } from "@tanstack/react-router";
import type { ControlState } from "@/store/useControls";
import { pb } from "@/utils/pocketbase";
import shortId from "shortid";

type SubmissionPayload = Pick<
	ControlState,
	| "points"
	| "ornaments"
	| "carvedText"
	| "recipientName"
	| "messageText"
	| "senderName"
>;

export const Route = createFileRoute("/api/submission")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				try {
					const {
						points,
						ornaments,
						carvedText,
						recipientName,
						messageText,
						senderName,
					} = (await request.json()) as SubmissionPayload;

					const shortid = shortId.generate();

					// @wataru we probably should do zod validation here
					// but for this mini project let's just skip it lol

					const submission = await pb.collection("submissions").create({
						shortid,
						points,
						ornaments,
						carvedText,
						recipientName,
						messageText,
						senderName,
					});

					return Response.json({ ok: true, submission });
				} catch (err) {
					console.error(err);
					return Response.json({ ok: false }, { status: 500 });
				}
			},
		},
	},
});
