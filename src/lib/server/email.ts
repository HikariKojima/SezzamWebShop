import { Resend } from 'resend';
import { env } from '$env/dynamic/private';

export interface OrderNotificationData {
	order: {
		id: number;
		customerName: string;
		customerPhone: string;
		customerEmail?: string | null;
		companyName?: string | null;
		companyId?: string | null;
		companyAddress?: string | null;
		orderNote?: string | null;
		paymentMethod: 'cash_in_person' | 'bank_transfer';
		subtotalCents: number;
	};
	lines: Array<{
		product: {
			name: string;
			unit: string;
			priceCents: number;
		};
		quantity: number;
		lineTotalCents: number;
	}>;
}

function formatKm(cents: number): string {
	return (cents / 100).toFixed(2).replace('.', ',') + ' KM';
}

function generateHtmlEmail(data: OrderNotificationData): string {
	const { order, lines } = data;
	const isBank = order.paymentMethod === 'bank_transfer';
	const paymentLabel = isBank ? 'Virmansko plaćanje (žiro račun / predračun)' : 'Plaćanje pri preuzimanju';
	const itemsRows = lines
		.map(
			(line) => `
		<tr style="border-bottom: 1px solid #e5e7eb;">
			<td style="padding: 12px 8px; font-weight: 600; color: #111827;">${line.product.name}</td>
			<td style="padding: 12px 8px; text-align: center; color: #374151;">${line.quantity} ${line.product.unit}</td>
			<td style="padding: 12px 8px; text-align: right; color: #374151;">${formatKm(line.product.priceCents)}</td>
			<td style="padding: 12px 8px; text-align: right; font-weight: 700; color: #061b0e;">${formatKm(line.lineTotalCents)}</td>
		</tr>`
		)
		.join('');

	const companySection =
		isBank && (order.companyName || order.companyId || order.companyAddress)
			? `
		<div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-top: 16px;">
			<h3 style="margin: 0 0 8px 0; font-size: 14px; text-transform: uppercase; color: #4b5563; letter-spacing: 0.05em;">Podaci o firmi (za predračun)</h3>
			<p style="margin: 4px 0; font-size: 14px; color: #1f2937;"><strong>Naziv firme:</strong> ${order.companyName || '/'}</p>
			<p style="margin: 4px 0; font-size: 14px; color: #1f2937;"><strong>ID broj:</strong> ${order.companyId || '/'}</p>
			<p style="margin: 4px 0; font-size: 14px; color: #1f2937;"><strong>Adresa:</strong> ${order.companyAddress || '/'}</p>
		</div>`
			: '';

	const noteSection = order.orderNote
		? `
		<div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 14px 16px; margin-top: 16px;">
			<h4 style="margin: 0 0 6px 0; font-size: 13px; color: #92400e; text-transform: uppercase;">Napomena kupca:</h4>
			<p style="margin: 0; font-size: 14px; color: #78350f; font-style: italic;">"${order.orderNote}"</p>
		</div>`
		: '';

	return `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Nova narudžba #${order.id}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f2; margin: 0; padding: 24px 12px; color: #1f2937;">
	<div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
		<!-- Header -->
		<div style="background-color: #1b3022; padding: 24px 28px; text-align: left;">
			<h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: -0.02em;">SEZZAM Webshop</h1>
			<p style="margin: 6px 0 0 0; color: #d0e9d4; font-size: 13px;">Nova narudžba zaprimljena &bull; #${order.id}</p>
		</div>

		<!-- Body -->
		<div style="padding: 24px 28px;">
			<div style="display: flex; justify-content: space-between; align-items: baseline; border-bottom: 2px solid #f3f4f6; padding-bottom: 16px; margin-bottom: 20px;">
				<h2 style="margin: 0; font-size: 18px; color: #111827;">Detalji narudžbe #${order.id}</h2>
				<span style="font-size: 13px; color: #6b7280;">${new Date().toLocaleString('bs-BA', { timeZone: 'Europe/Sarajevo' })}</span>
			</div>

			<!-- Customer Info Box -->
			<div style="background-color: #fbf9f6; border: 1px solid #e3e2e0; border-radius: 8px; padding: 18px; margin-bottom: 20px;">
				<h3 style="margin: 0 0 12px 0; font-size: 13px; font-weight: 700; text-transform: uppercase; color: #5b5f60; letter-spacing: 0.05em;">Podaci o kupcu</h3>
				<p style="margin: 6px 0; font-size: 15px; color: #1b1c1a;"><strong>Ime i prezime:</strong> ${order.customerName}</p>
				<p style="margin: 6px 0; font-size: 15px; color: #1b1c1a;">
					<strong>Broj telefona:</strong> 
					<a href="tel:${order.customerPhone}" style="color: #1b3022; font-weight: 700; text-decoration: underline;">${order.customerPhone}</a>
				</p>
				<p style="margin: 6px 0; font-size: 15px; color: #1b1c1a;">
					<strong>Email kupca:</strong> ${order.customerEmail ? `<a href="mailto:${order.customerEmail}" style="color: #1b3022;">${order.customerEmail}</a>` : '<span style="color: #9ca3af;">Nije naveden</span>'}
				</p>
				<p style="margin: 6px 0; font-size: 15px; color: #1b1c1a;"><strong>Način plaćanja:</strong> ${paymentLabel}</p>
				${companySection}
				${noteSection}

				<div style="margin-top: 16px;">
					<a href="tel:${order.customerPhone}" style="display: inline-block; background-color: #1b3022; color: #ffffff; text-decoration: none; padding: 10px 18px; border-radius: 9999px; font-size: 13px; font-weight: 700;">
						📞 Pozovi kupca odmah
					</a>
				</div>
			</div>

			<!-- Items Table -->
			<h3 style="margin: 20px 0 10px 0; font-size: 14px; font-weight: 700; text-transform: uppercase; color: #5b5f60; letter-spacing: 0.05em;">Naručeni artikli</h3>
			<table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 16px;">
				<thead>
					<tr style="border-bottom: 2px solid #e5e7eb; text-align: left; color: #6b7280; font-size: 12px; text-transform: uppercase;">
						<th style="padding: 8px;">Artikal</th>
						<th style="padding: 8px; text-align: center;">Količina</th>
						<th style="padding: 8px; text-align: right;">Cijena</th>
						<th style="padding: 8px; text-align: right;">Ukupno</th>
					</tr>
				</thead>
				<tbody>
					${itemsRows}
				</tbody>
			</table>

			<!-- Total Summary -->
			<div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; text-align: right; margin-top: 20px;">
				<span style="font-size: 14px; color: #166534; font-weight: 600; margin-right: 12px;">UKUPAN IZNOS:</span>
				<span style="font-size: 22px; color: #14532d; font-weight: 800;">${formatKm(order.subtotalCents)}</span>
			</div>
		</div>

		<!-- Footer -->
		<div style="background-color: #fafafa; border-top: 1px solid #e5e7eb; padding: 16px 28px; text-align: center; font-size: 12px; color: #9ca3af;">
			Automatska obavijest sa Sezzam webshop platforme.
		</div>
	</div>
</body>
</html>
	`;
}

function generateTextEmail(data: OrderNotificationData): string {
	const { order, lines } = data;
	const isBank = order.paymentMethod === 'bank_transfer';
	const paymentLabel = isBank ? 'Virmansko plaćanje (žiro račun)' : 'Plaćanje pri preuzimanju';

	const items = lines
		.map(
			(l) =>
				`- ${l.product.name} x ${l.quantity} ${l.product.unit} = ${formatKm(l.lineTotalCents)} (${formatKm(l.product.priceCents)} po ${l.product.unit})`
		)
		.join('\n');

	let companyInfo = '';
	if (isBank) {
		companyInfo = `\nPodaci o firmi (za predračun):\nFirma: ${order.companyName || '/'}\nID: ${order.companyId || '/'}\nAdresa: ${order.companyAddress || '/'}\n`;
	}

	let noteInfo = '';
	if (order.orderNote) {
		noteInfo = `\nNapomena kupca:\n${order.orderNote}\n`;
	}

	return `
NOVA NARUDŽBA #${order.id} - SEZZAM WEBSHOP
--------------------------------------------------
Kupac: ${order.customerName}
Telefon: ${order.customerPhone}
Email: ${order.customerEmail || 'Nije naveden'}
Plaćanje: ${paymentLabel}
${companyInfo}${noteInfo}
NARUČENI ARTIKLI:
${items}
--------------------------------------------------
UKUPNO: ${formatKm(order.subtotalCents)}
--------------------------------------------------
Datum: ${new Date().toLocaleString('bs-BA', { timeZone: 'Europe/Sarajevo' })}
	`.trim();
}

/**
 * Sends an email notification to the site owner via Resend whenever a customer places an order/inquiry.
 * Gracefully logs without throwing if Resend API key is not configured yet.
 */
export async function sendInquiryNotification(data: OrderNotificationData): Promise<{ success: boolean; id?: string }> {
	const apiKey = env.RESEND_API_KEY;
	const recipient = env.NOTIFICATION_EMAIL || 'sezzam@sezzam.ba';
	const fromAddress = env.EMAIL_FROM || 'Sezzam Webshop <sezzam@sezzam.ba>';

	if (!apiKey || apiKey.startsWith('re_your')) {
		console.warn(
			`[Email Notification] RESEND_API_KEY nije podešen u .env. Obavijest o narudžbi #${data.order.id} za ${recipient} nije poslana.`
		);
		return { success: false };
	}

	try {
		const resend = new Resend(apiKey);
		const html = generateHtmlEmail(data);
		const text = generateTextEmail(data);

		const response = await resend.emails.send({
			from: fromAddress,
			to: [recipient],
			replyTo: data.order.customerEmail || undefined,
			subject: `Nova narudžba #${data.order.id} - ${data.order.customerName} (${formatKm(data.order.subtotalCents)})`,
			html,
			text
		});

		if (response.error) {
			console.error(`[Email Notification Error] Greška pri slanju narudžbe #${data.order.id}:`, response.error);
			return { success: false };
		}

		console.info(`[Email Notification] Uspješno poslana obavijest za narudžbu #${data.order.id} na ${recipient}. Email ID: ${response.data?.id}`);
		return { success: true, id: response.data?.id };
	} catch (err) {
		console.error(`[Email Notification Exception] Neočekivana greška za narudžbu #${data.order.id}:`, err);
		return { success: false };
	}
}
