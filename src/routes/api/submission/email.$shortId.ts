import { createFileRoute } from "@tanstack/react-router";
import { pb } from "@/utils/pocketbase";
import Postmark from "postmark";

type EmailPayload = { email: string };

export const Route = createFileRoute("/api/submission/email/$shortId")({
	server: {
		handlers: {
			POST: async ({ request, params }) => {
				if (process.env.POSTMARK_API_KEY === undefined) {
					throw Error("POSTMARK_API_KEY must be set");
				}

				if (process.env.SENDER_EMAIL === undefined) {
					throw Error("SENDER_EMAIL must be set");
				}

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

					const pmClient = new Postmark.ServerClient(
						process.env.POSTMARK_API_KEY,
					);

					await pmClient.sendEmail({
						To: email,
						From: process.env.SENDER_EMAIL,
						Subject: `${submission.senderName} sent you a snow globe ❄!`,
						TextBody: `
Hey ${submission.recipientName},

${submission.senderName} just sent you a frosty greeting!

=*=*=*=*=*=*=*=*=*=*=*=*=*=*=

${submission.messageText}

=*=*=*=*=*=*=*=*=*=*=*=*=*=*=

View your snow globe here:
https://snow.lemonsour.studio/${submission.shortid}

Happy holidays!!
`,
					});

					return Response.json({ ok: true });
				} catch (err) {
					console.error(err);
					return Response.json({ ok: false }, { status: 500 });
				}
			},
		},
	},
});
