export type SiteSettings = {
	heroTagline: string;
	heroTitle: string;
	heroSubtitle: string;
	heroImageUrl?: string | null;
	spotlightQuote: string;
	spotlightImageUrl?: string | null;
	spotlightTitle: string;
	spotlightSubtitle: string;
	contactPhone: string;
	contactEmail: string;
};

export const defaultSiteSettings: SiteSettings = {
	heroTagline: 'WPC Decking, SPC/LVT, Podne i Zidne Obloge',
	heroTitle: 'Vrhunski decking, podne i zidne obloge za vaš prostor.',
	heroSubtitle:
		'Specijalizovani za WPC kompozitni decking za terase, balkone i bazene, moderne SPC i LVT podne obloge, te dekorativne zidne obloge. Dugotrajnost, UV i vlagootpornost bez potrebe za lakiranjem.',
	heroImageUrl: null,
	spotlightQuote:
		'Dva lica savršenstva: Izaberite moderne linije za minimalistički izgled ili duboku 3D teksturu koja vjerno prenosi toplinu i ljepotu prirodnog drveta.',
	spotlightImageUrl: '/images/showcase/wpc-dual-terrace.jpg',
	spotlightTitle: 'Dvostrani dizajn – Prilagodite terasu svom stilu',
	spotlightSubtitle:
		'Jedna daska, dva estetska rješenja. Prilikom postavljanja slobodno birate koje lice okrećete prema gore, ili ih kombinujete za unikatne bordure i prelaze.',
	contactPhone: '+38761069798',
	contactEmail: 'sezzam@sezzam.ba'
};
