/**
 * @file bench.api.routers.js
 * @description Minimal benchmark service router for framework contract checks.
 */
(function () {
	const NAME_FILE = '/js-router/bench.api.routers.js';
	const owner = { constructor: { name: NAME_FILE } };

	global.UtilRouter.addRouter(global.SERVER, '/api/bench/status', 'GET', function (req, res) {
		global.UtilRouter.Response.success(res, {
			service: 'vanilla-bench-server',
			status: 'ok',
			uptime: process.uptime(),
			timestamp: new Date().toISOString()
		}, 'Bench service router is ready');
	});

	if (global.UtilLogger) {
		global.UtilLogger.log('Bench API router loaded', { owner: owner.constructor.name });
	}
}());
