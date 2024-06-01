const zapier = require("zapier-platform-core");

const App = require("../index");
const appTester = zapier.createAppTester(App);

describe("custom auth", () => {
	zapier.tools.env.inject();
	it("passes authentication and returns json", async () => {
		const bundle = {
			authData: {
				apiKey: "33da89d7-790d-418f-a3c9-a50dfb9b5277",
			},
		};

		const response = await appTester(App.authentication.test, bundle);
		expect(response.status).toBe(200);
		expect(response.data).toHaveProperty("app");
	});

	it("fails on bad auth", async () => {
		const bundle = {
			authData: {
				apiKey: "bad",
			},
		};

		try {
			await appTester(App.authentication.test, bundle);
		} catch (error) {
			expect(error.message).toContain("The API Key you supplied is incorrect");
			return;
		}
		throw new Error("appTester should have thrown");
	});
});
