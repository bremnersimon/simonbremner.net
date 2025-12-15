/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
	app(input) {
		return {
			name: "SimonBremnerNet",
			removal: input?.stage === "production" ? "retain" : "remove",
			protect: ["production"].includes(input?.stage),
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
				name: "simonbremner.net",
				redirects: ["www.simonbremner.net"],
			},
		});
	},
});
