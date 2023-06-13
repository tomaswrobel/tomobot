export default class MissingPermissionsEror extends Error {
	public constructor(permissions: string[]) {
		super(`Missing permissions: ${permissions.join(", ")}`);
		this.name = "MissingPermissionsError";
	}
}
