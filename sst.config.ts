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
			protect: ["production", "staging"].includes(input?.stage ?? "") || false,
			home: "aws",
			providers: {
				aws: {
					profile: "Simonsberg",
				},
			},
		};
	},
	async run() {
		// Define an empty edge config by default
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		let edgeConfig: any = undefined;

		// Only construct and apply basic auth if the current stage is "staging"
		if ($app.stage === "staging") {
			const username = new sst.Secret("USERNAME");
			const password = new sst.Secret("PASSWORD");
			const basicAuth = $resolve([username.value, password.value]).apply(
				([username, password]) =>
					Buffer.from(`${username}:${password}`).toString("base64"),
			);

			edgeConfig = {
				viewerRequest: {
					injection: $interpolate`
              if (
                  !event.request.headers.authorization
                    || event.request.headers.authorization.value !== "Basic ${basicAuth}"
                 ) {
                return {
                  statusCode: 401,
                  headers: {
                    "www-authenticate": { value: "Basic" }
                  }
                };
              }`,
				},
			};
		}

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
			// This will be undefined for dev/production, skipping the injection entirely
			edge: edgeConfig,
		});
	},
});
