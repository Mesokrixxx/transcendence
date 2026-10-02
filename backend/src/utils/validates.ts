
export function isNonEmptyString(v: unknown): v is string {
	return typeof v === 'string' && v.trim() !== '';
}
