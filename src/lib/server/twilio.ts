import { env } from '$env/dynamic/private';

export async function sendDriverInviteSms(phone: string, activateUrl: string): Promise<void> {
	const accountSid = env.TWILIO_ACCOUNT_SID;
	const authToken = env.TWILIO_AUTH_TOKEN;
	const fromNumber = env.TWILIO_PHONE_NUMBER;
	const body = `You've been invited to Loadr. Activate your account: ${activateUrl}`;

	if (!accountSid || !authToken || !fromNumber) {
		console.info('[twilio] DEV — Twilio not configured. Driver activation link:');
		console.info(activateUrl);
		return;
	}

	const credentials = btoa(`${accountSid}:${authToken}`);
	const response = await fetch(
		`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
		{
			method: 'POST',
			headers: {
				Authorization: `Basic ${credentials}`,
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: new URLSearchParams({
				To: phone,
				From: fromNumber,
				Body: body
			})
		}
	);

	if (!response.ok) {
		const detail = await response.text();
		throw new Error(`Twilio SMS failed (${response.status}): ${detail}`);
	}
}
