/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
	app(input) {
		return {
			name: "SimonBremnerNet",
			removal:
				input?.stage === "production"
					? "retain"
					: input?.stage === "staging"
						? "retain"
						: "remove",
			protect:
				["production"].includes(input?.stage) ||
				["staging"].includes(input?.stage),
			home: "aws",
			providers: {
				aws: {
					profile: "Simonsberg",
				},
			},
		};
	},
	async run() {
		new sst.aws.Astro("simonbremner-net", {
			domain: {
				name:
					$app.stage === "production"
						? "simonbremner.net"
						: $app.stage === "staging"
							? "staging.simonbremner.net"
							: "dev.simonbremner.net",
				redirects: [
					$app.stage === "production"
						? "www.simonbremner.net"
						: $app.stage === "staging"
							? "www.staging.simonbremner.net"
							: "www.dev.simonbremner.net",
				],
			},
		});
	},
});
