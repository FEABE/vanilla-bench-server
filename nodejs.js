(function () {
    const NAME_FILE = 'vanilla-bench-server/nodejs.js';
    console.log(NAME_FILE);

    // 공통 모듈 로드
    require('../vanilla-common-node/define.js');

    // 체계적인 라우터 시스템 로드
    global.load('vanilla-common-router/index.js');

    //----------------------------------------------------------------------------------------------------;

    // 프로세스 이름 설정
    const KEY_PROCESS = 'vanilla-bench-server';
    const PORT = global.PORT_SERVER[KEY_PROCESS] || 3020;

    // 웹 경로 설정
    global.setWebRootPath(KEY_PROCESS, 'vanilla-web');

    // Vanilla 프레임워크의 createServerHttp 사용
    const SERVER = global.createServerHttp(PORT, `../vanilla-web/${KEY_PROCESS}`);
    UtilObject.defineProperty__const(global, 'SERVER', SERVER);

    // 완전한 서버 설정 (미들웨어 + 공통 라우터 + 서버별 라우터)
    global.setupVanillaServer(SERVER, KEY_PROCESS);

    //----------------------------------------------------------------------------------------------------;

    // 에러 처리
    SERVER.on('error', (error) => {
        global.UtilLogger.error('Bench Server Error:', error);
    });

    // 종료 처리
    process.on('SIGTERM', () => {
        global.UtilLogger.log('Bench Server shutting down...');
        SERVER.close(() => {
            global.UtilLogger.log('Bench Server closed');
        });
    });

}())
