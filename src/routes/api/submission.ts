import { createFileRoute } from "@tanstack/react-router";
import { pb } from "@/utils/pocketbase";
import shortId from "shortid";

type SubmissionPayload = {
	points: Array<{ x: number; y: number; idx: number }>;
	ornaments: Array<{
		id: string;
		type: string;
		position: [number, number, number];
		normal: { x: number; y: number; z: number };
		clickPoint: { x: number; y: number; z: number };
		color: string;
		color2?: string;
	}>;
	carvedText: string;
	recipientName: string;
	messageText: string;
	senderName: string;
};

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
