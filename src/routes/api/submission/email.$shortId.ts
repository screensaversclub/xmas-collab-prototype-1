import { createFileRoute } from "@tanstack/react-router";
import { pb } from "@/utils/pocketbase";

type EmailPayload = { email: string };

export const Route = createFileRoute("/api/submission/email/$shortId")({
	server: {
		handlers: {
			POST: async ({ request, params }) => {
				try {
					const { shortId } = params;
					const { email } = (await request.json()) as EmailPayload;

					const submission = await pb
						.collection("submissions")
						.getFirstListItem(`shortid="${shortId}"`);

					if (submission === undefined) {
						throw Error(`No matching submission found for shortId: ${shortId}`);
					}

					await pb.collection("submissions").update(submission.id, { email });

					// postmark send email here
					console.info("Postmark send email action here");

					return Response.json({ ok: true });
				} catch (err) {
					console.error(err);
					return Response.json({ ok: false }, { status: 500 });
				}
			},
		},
	},
});
