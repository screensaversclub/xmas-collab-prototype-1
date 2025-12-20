type EmailResponse = {
	ok: boolean;
	error?: string;
};

export async function sendSnowglobeEmail(
	shortId: string,
	email: string,
): Promise<{ ok: boolean; error?: string }> {
	try {
		const response = await fetch(`/api/submission/email/${shortId}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email }),
		});

		const result = (await response.json()) as EmailResponse;

		if (result.ok) {
			return { ok: true };
		}

		return { ok: false, error: result.error || "Failed to send email" };
	} catch (err) {
		return { ok: false, error: String(err) };
	}
}
