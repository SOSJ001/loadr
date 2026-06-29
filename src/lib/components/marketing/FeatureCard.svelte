<script lang="ts">
	type Icon = 'clipboard' | 'shield' | 'smartphone';

	type Props = {
		icon: Icon;
		title: string;
		description: string;
	};

	let { icon, title, description }: Props = $props();

	const icons: Record<Icon, { light: string; dark: string; label: string }> = {
		clipboard: {
			light: '/images/marketing/icons/clipboard-light.svg',
			dark: '/images/marketing/icons/clipboard-dark.svg',
			label: 'Job management'
		},
		shield: {
			light: '/images/marketing/icons/shield-light.svg',
			dark: '/images/marketing/icons/shield-dark.svg',
			label: 'Proof of delivery'
		},
		smartphone: {
			light: '/images/marketing/icons/smartphone-light.svg',
			dark: '/images/marketing/icons/smartphone-dark.svg',
			label: 'Driver mobile app'
		}
	};

	const { light, dark, label } = $derived(icons[icon]);
</script>

<div
	class="flex flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-6 py-8 text-center lg:gap-4 lg:px-8 lg:pt-8 lg:pb-9 dark:border-slate-700 dark:bg-slate-800"
>
	<div
		class="flex size-14 items-center justify-center rounded-full border border-green-200 bg-green-100 dark:border-emerald-800 dark:bg-emerald-900"
		aria-hidden="true"
	>
		<img src={light} alt="" class="size-6 dark:hidden" width="24" height="24" />
		<img src={dark} alt="" class="hidden size-6 dark:block" width="24" height="24" />
		<span class="sr-only">{label}</span>
	</div>
	<h3 class="font-inter text-lg font-bold leading-snug text-gray-900 dark:text-slate-100">{title}</h3>
	<p class="font-inter text-sm leading-[1.65] text-gray-500 dark:text-slate-400">{description}</p>
</div>
