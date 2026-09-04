/**
 * @file bench.api.routers.js
 * @description Minimal benchmark service router for framework contract checks. (Vanilla 파사드)
 *              - GET /api/bench/status   data = { service, status, uptime, timestamp }
 */
(function () {
	const NAME_FILE = '/js-router/bench.api.routers.js';
	const owner = { constructor: { name: NAME_FILE } };

	const ROUTER = global.Vanilla.createRouter('/api/bench', { name: 'bench-api' });

	ROUTER.get('/status', function (ctx) {
		return ctx.ok({
			service: 'vanilla-bench-server',
			status: 'ok',
			uptime: process.uptime(),
			timestamp: new Date().toISOString()
		}, { message: 'Bench service router is ready' });
	});

	global.Vanilla.mount(global.SERVER, ROUTER);

	if (global.UtilLogger) {
		global.UtilLogger.log('Bench API router loaded', { owner: owner.constructor.name, routes: ROUTER.routes.length });
	}
}());
