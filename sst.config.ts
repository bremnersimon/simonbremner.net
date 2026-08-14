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
		const username = new sst.Secret("USERNAME");
		const password = new sst.Secret("PASSWORD");
		const basicAuth = $resolve([username.value, password.value]).apply(
			([username, password]) =>
				Buffer.from(`${username}:${password}`).toString("base64"),
		);

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
			edge: {
				viewerRequest: {
					injection: `
        var auth = event.request.headers.authorization;
        var expected = "Basic " + "USERNAME:PASSWORD_BASE64"; // Replace with encoded string or logic
        if (!auth || auth.value !== expected) {
          return {
            statusCode: 401,
            statusDescription: "Unauthorized",
            headers: {
              "www-authenticate": { value: 'Basic realm="Secure Area"' }
            }
          };
        }
        return event.request;
      `,
				},
			},
		});
	},
});
