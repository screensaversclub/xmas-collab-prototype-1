import { describe, expect, it } from "vitest";

const BASE_URL = "http://localhost:3000";

describe("API Routes", () => {
	describe("POST /api/submission", () => {
		it("should create a new submission", async () => {
			const payload = {
				points: [
					[0, 0, 0],
					[1, 1, 1],
				],
				ornaments: [
					{
						position: [0.5, 0.5, 0.5],
						color: "#ff0000",
						type: "sphere",
					},
				],
				carvedText: "Test Tree",
				recipientName: "Alice",
				messageText: "Happy Holidays!",
				senderName: "Bob",
			};

			const response = await fetch(`${BASE_URL}/api/submission`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			});

			expect(response.ok).toBe(true);
			const data = await response.json();

			expect(data.ok).toBe(true);
			expect(data.submission).toBeDefined();
			expect(data.submission.recipientName).toBe("Alice");
			expect(data.submission.senderName).toBe("Bob");
		});

		it("should handle invalid payload gracefully", async () => {
			const response = await fetch(`${BASE_URL}/api/submission`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({}),
			});

			// Should either accept it or return 500 based on PocketBase validation
			const data = await response.json();
			expect(data).toHaveProperty("ok");
		});
	});

	describe("GET /api/submission/:shortId", () => {
		it("should return 404 for non-existent submission", async () => {
			const response = await fetch(`${BASE_URL}/api/submission/nonexistent123`);

			expect(response.status).toBe(404);
			const data = await response.json();
			expect(data.ok).toBe(false);
		});

		it("should retrieve an existing submission", async () => {
			// First create a submission
			const payload = {
				points: [[0, 0, 0]],
				ornaments: [],
				carvedText: "Get Test",
				recipientName: "Charlie",
				messageText: "Test message",
				senderName: "Dave",
			};

			const createResponse = await fetch(`${BASE_URL}/api/submission`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			});

			const createData = await createResponse.json();
			const shortId = createData.submission.shortid;

			// Then retrieve it
			const getResponse = await fetch(`${BASE_URL}/api/submission/${shortId}`);

			expect(getResponse.ok).toBe(true);
			const getData = await getResponse.json();

			expect(getData.ok).toBe(true);
			expect(getData.submission).toBeDefined();
			expect(getData.submission.recipientName).toBe("Charlie");
		});
	});

	describe("POST /api/submission/email/:shortId", () => {
		it("should update submission with email", async () => {
			// First create a submission
			const payload = {
				points: [[0, 0, 0]],
				ornaments: [],
				carvedText: "Email Test",
				recipientName: "Eve",
				messageText: "Test for email",
				senderName: "Frank",
			};

			const createResponse = await fetch(`${BASE_URL}/api/submission`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			});

			const createData = await createResponse.json();
			const shortId = createData.submission.shortid;

			// Then add email to it
			const emailResponse = await fetch(
				`${BASE_URL}/api/submission/email/${shortId}`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ email: "test@example.com" }),
				},
			);

			expect(emailResponse.ok).toBe(true);
			const emailData = await emailResponse.json();
			expect(emailData.ok).toBe(true);
		});

		it("should return 500 for non-existent submission", async () => {
			const response = await fetch(
				`${BASE_URL}/api/submission/email/nonexistent123`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ email: "test@example.com" }),
				},
			);

			expect(response.status).toBe(500);
			const data = await response.json();
			expect(data.ok).toBe(false);
		});
	});
});
