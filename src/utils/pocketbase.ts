import PocketBase from "pocketbase";

if (process.env.POCKETBASE_ADMIN_USER === undefined) {
	throw Error("POCKETBASE_ADMIN_USER must be set");
}

if (process.env.POCKETBASE_ADMIN_PASSWORD === undefined) {
	throw Error("POCKETBASE_ADMIN_PASSWORD must be set");
}

const pb = new PocketBase(process.env.POCKETBASE_URL);

await pb
	.collection("_superusers")
	.authWithPassword(
		process.env.POCKETBASE_ADMIN_USER,
		process.env.POCKETBASE_ADMIN_PASSWORD,
	);

export { pb };
