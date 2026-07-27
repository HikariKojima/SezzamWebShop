<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<section class="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-12 lg:py-12">
	<div
		class="grid overflow-hidden rounded-lg border border-[#c3c8c1] bg-white lg:min-h-[400px] lg:grid-cols-[1fr_1.05fr]"
	>
		<div class="flex flex-col justify-center px-6 py-10 sm:px-12 lg:py-14">
			<p class="mb-5 text-xs font-semibold uppercase text-[#4d6453]">Građevinski materijali</p>
			<h1 class="max-w-xl text-4xl font-semibold leading-tight text-[#061b0e] sm:text-5xl">
				Gradite sigurnije. Birajte preciznije.
			</h1>
			<p class="mt-6 max-w-lg text-base leading-7 text-[#434843] sm:text-lg">
				Od cementa i armature do izolacije i pločica, Sezzam donosi uredan katalog materijala za
				profesionalne i kućne projekte.
			</p>
			<div class="mt-8 flex flex-col gap-3 sm:flex-row">
				<a
					href={resolve('/#materijali')}
					class="inline-flex h-14 items-center justify-center rounded-full bg-[#1b3022] px-8 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(27,48,34,0.16)] transition hover:bg-[#061b0e]"
				>
					Pregledaj materijale
				</a>
				<a
					href={resolve('/')}
					class="inline-flex h-14 items-center justify-center rounded-full border border-[#737973] px-8 text-sm font-semibold text-[#1b1c1a] transition hover:bg-[#efeeeb]"
				>
					Zatraži ponudu
				</a>
			</div>
		</div>

		<div
			class="hero-visual min-h-[280px] border-t border-[#e3e2e0] bg-[#efeeeb] lg:border-l lg:border-t-0"
		>
			<div class="material-stack" aria-hidden="true">
				<div class="beam beam-top"></div>
				<div class="beam beam-mid"></div>
				<div class="beam beam-low"></div>
				<div class="block-grid">
					<span></span>
					<span></span>
					<span></span>
					<span></span>
					<span></span>
					<span></span>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.hero-visual {
		position: relative;
		display: grid;
		place-items: center;
		background:
			radial-gradient(circle at 70% 35%, rgba(255, 255, 255, 0.78), transparent 34%),
			linear-gradient(135deg, #f7f6f3 0%, #e3e2e0 100%);
	}

	.material-stack {
		position: relative;
		width: min(74%, 440px);
		aspect-ratio: 1.2;
	}

	.beam,
	.block-grid {
		position: absolute;
		box-shadow: 0 18px 40px rgba(27, 28, 26, 0.12);
	}

	.beam {
		right: 0;
		height: 15%;
		border-radius: 4px;
		background:
			linear-gradient(90deg, rgba(255, 255, 255, 0.24), transparent 32%),
			repeating-linear-gradient(0deg, rgba(99, 65, 33, 0.12) 0 2px, transparent 2px 8px), #bd9468;
	}

	.beam-top {
		top: 18%;
		width: 82%;
	}

	.beam-mid {
		top: 34%;
		width: 100%;
	}

	.beam-low {
		top: 51%;
		width: 72%;
	}

	.block-grid {
		bottom: 12%;
		left: 2%;
		display: grid;
		width: 58%;
		grid-template-columns: repeat(3, 1fr);
		border-radius: 4px;
		overflow: hidden;
	}

	.block-grid span {
		aspect-ratio: 1.45;
		border: 1px solid rgba(67, 72, 67, 0.26);
		background:
			radial-gradient(circle at 30% 30%, rgba(67, 72, 67, 0.18) 0 2px, transparent 3px),
			radial-gradient(circle at 70% 70%, rgba(67, 72, 67, 0.16) 0 1px, transparent 2px), #c8c6bf;
	}
</style>
