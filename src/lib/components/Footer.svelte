<script lang="ts">
	import { resolve } from '$app/paths';
	import { MapPin, Phone, Mail, Clock, ArrowUpRight } from '@lucide/svelte';

	const googleMapsUrl =
		'https://maps.google.com/maps?vet=10CAAQoqAOahcKEwjo1LDRnsiWAxUAAAAAHQAAAAAQCA..i&pvq=Cg0vZy8xMXlqaGpwMjB6IgwKBnNlenphbRACGAM&lqi=CgpzZXp6YW0gYmloSJ6QqvjBvYCACFoUEAAYACIKc2V6emFtIGJpaDICaHKSAQl3YXJlaG91c2U&fvr=1&cs=1&um=1&ie=UTF-8&fb=1&gl=ba&sa=X&ftid=0x4758b5007a0f380d:0x6bf45d9d0e160531';
	const phoneNumber = '+387 61 069 798';
	const phoneHref = 'tel:+38761069798';
	const emailAddress = 'info@sezzam.ba';
</script>

<footer class="border-t border-[#c3c8c1] bg-[#121b14] text-white">
	<div class="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-12 lg:py-16">
		<div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
			<!-- Col 1: Brand & About -->
			<div>
				<a
					href={resolve('/')}
					class="inline-block text-2xl font-bold tracking-tight text-white transition hover:opacity-85"
					aria-label="Sezzam početna"
				>
					Sezzam
				</a>
				<p class="mt-3 text-xs font-semibold uppercase tracking-wider text-[#8da391]">
					Premium Decking Sistemi & Podne Obloge
				</p>
				<p class="mt-4 text-sm leading-relaxed text-[#c0cac2]">
					Vrhunski WPC decking za terase, balkone i bazene, te kvalitetne SPC i LVT podne obloge.
					Dugotrajna rješenja sa brzom isporukom u BiH.
				</p>
			</div>

			<!-- Col 2: Location & Maps -->
			<div>
				<p class="text-xs font-semibold uppercase tracking-wider text-[#8da391]">
					Lokacija & Skladište
				</p>
				<div class="mt-4 space-y-3">
					<div class="flex items-start gap-2.5 text-sm text-[#e3ece4]">
						<MapPin class="mt-0.5 size-4 shrink-0 text-[#8da391]" />
						<div>
							<p class="font-medium text-white">Sezzam Skladište</p>
							<p class="text-xs text-[#c0cac2]">Bosna i Hercegovina</p>
						</div>
					</div>
					<div>
						<a
							href={googleMapsUrl}
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-1.5 rounded-full border border-[#8da391]/40 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:border-white hover:bg-white/10"
						>
							<span>Otvori Google Maps</span>
							<ArrowUpRight class="size-3.5" />
						</a>
					</div>
				</div>
			</div>

			<!-- Col 3: Contact & Hours -->
			<div>
				<p class="text-xs font-semibold uppercase tracking-wider text-[#8da391]">
					Kontakt & Narudžbe
				</p>
				<ul class="mt-4 space-y-3 text-sm text-[#e3ece4]">
					<li>
						<a
							href={phoneHref}
							class="inline-flex items-center gap-2.5 transition hover:text-[#8da391]"
						>
							<Phone class="size-4 text-[#8da391]" />
							<span class="font-semibold">{phoneNumber}</span>
						</a>
					</li>
					<li>
						<a
							href={`mailto:${emailAddress}`}
							class="inline-flex items-center gap-2.5 transition hover:text-[#8da391]"
						>
							<Mail class="size-4 text-[#8da391]" />
							<span>{emailAddress}</span>
						</a>
					</li>
					<li class="flex items-start gap-2.5 text-xs text-[#c0cac2]">
						<Clock class="mt-0.5 size-4 shrink-0 text-[#8da391]" />
						<div>
							<p>Pon - Pet: 07:30 - 17:00</p>
							<p>Subota: 08:00 - 14:00</p>
						</div>
					</li>
				</ul>
			</div>

			<!-- Col 4: Quick links & Calculator -->
			<div>
				<p class="text-xs font-semibold uppercase tracking-wider text-[#8da391]">Brzi linkovi</p>
				<ul class="mt-4 space-y-2 text-sm text-[#c0cac2]">
					<li>
						<a href={resolve('/#materijali')} class="transition hover:text-white">
							Katalog materijala
						</a>
					</li>
					<li>
						<a href={resolve('/#kalkulator')} class="transition hover:text-white">
							Kalkulator utroška
						</a>
					</li>
					<li>
						<a href={resolve('/admin')} class="transition hover:text-white"> Admin prijava </a>
					</li>
				</ul>
			</div>
		</div>

		<div
			class="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-[#8da391] sm:flex-row"
		>
			<p>© {new Date().getFullYear()} Sezzam. Sva prava zadržana.</p>
			<div class="flex flex-wrap items-center justify-center gap-2 text-center">
				<span>Izrada web stranice:</span>
				<a
					href="mailto:tarik.mujezinovicbiz@gmail.com"
					rel="external"
					class="font-medium text-white underline decoration-[#8da391]/60 underline-offset-4 transition hover:text-[#8da391]"
				>
					TarikM
				</a>
				<span class="text-white/30">•</span>
				<a
					href="mailto:tarik.mujezinovicbiz@gmail.com"
					rel="external"
					class="text-[#c0cac2] transition hover:text-white"
				>
					tarik.mujezinovicbiz@gmail.com
				</a>
			</div>
		</div>
	</div>
</footer>
