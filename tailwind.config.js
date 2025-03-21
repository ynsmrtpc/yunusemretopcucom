/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ["class"],
	content: [
		// "./index.html",
		"./src/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			container: {
				center: true,
				padding: '2rem',
				screens: {
					'2xl': '1400px'
				}
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			typography: {
				DEFAULT: {
					css: {
						maxWidth: '100%',
						color: 'hsl(var(--foreground))',
						h1: {
							color: 'hsl(var(--foreground))'
						},
						h2: {
							color: 'hsl(var(--foreground))'
						},
						h3: {
							color: 'hsl(var(--foreground))'
						},
						h4: {
							color: 'hsl(var(--foreground))'
						},
						p: {
							color: 'hsl(var(--muted-foreground))'
						},
						a: {
							color: 'hsl(var(--primary))',
							'&:hover': {
								color: 'hsl(var(--primary))'
							}
						},
						code: {
							color: 'hsl(var(--primary))',
							backgroundColor: 'hsl(var(--muted))',
							padding: '0.25rem',
							borderRadius: '0.25rem',
							fontWeight: '500'
						},
						'code::before': {
							content: '"'
						},
						'code::after': {
							content: '"'
						}
					}
				}
			}
		}
	},
	plugins: [require("@tailwindcss/typography"), require("tailwindcss-animate")],
}

