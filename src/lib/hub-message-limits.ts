/**
 * One conversion-trial limit shared by every Hub enforcement layer.
 *
 * The database-backed weekly quota is authoritative. The client counter and
 * best-effort daily IP limiter import the same value so the UI never promises
 * more messages than the server will accept.
 */
export const ANONYMOUS_HUB_MESSAGE_LIMIT = 5;
