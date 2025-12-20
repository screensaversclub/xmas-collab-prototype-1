import type { ControlState } from "@/store/useControls";

type SubmissionPayload = Pick<
	ControlState,
	| "points"
	| "ornaments"
	| "carvedText"
	| "recipientName"
	| "messageText"
	| "senderName"
>;

type SubmissionResponse = {
	ok: boolean;
	submission?: {
		shortid: string;
		id: string;
	};
};

export async function submitSnowglobe(
	data: SubmissionPayload,
): Promise<{ ok: boolean; shortId?: string; error?: string }> {
	try {
		const response = await fetch("/api/submission", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});

		const result = (await response.json()) as SubmissionResponse;

		if (result.ok && result.submission) {
			return { ok: true, shortId: result.submission.shortid };
		}

		return { ok: false, error: "Submission failed" };
	} catch (err) {
		return { ok: false, error: String(err) };
	}
}
