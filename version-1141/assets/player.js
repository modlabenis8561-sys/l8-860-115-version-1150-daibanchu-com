(function () {
    var scriptUrl = document.currentScript ? document.currentScript.src : './assets/player.js';
    var localHlsUrl = new URL('hls.js', scriptUrl).href;
    var hlsClassPromise = null;

    function getHlsClass() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }
        if (hlsClassPromise) {
            return hlsClassPromise;
        }
        hlsClassPromise = import(localHlsUrl).then(function (module) {
            return module.H;
        }).catch(function () {
            return new Promise(function (resolve, reject) {
                if (window.Hls) {
                    resolve(window.Hls);
                    return;
                }
                var script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.6.5/dist/hls.min.js';
                script.onload = function () {
                    resolve(window.Hls);
                };
                script.onerror = reject;
                document.head.appendChild(script);
            });
        });
        return hlsClassPromise;
    }

    window.setupMoviePlayer = function (videoId, buttonId, source) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var loaded = false;
        var hlsInstance = null;

        function hideButton() {
            if (button) {
                button.classList.add('is-hidden');
            }
        }

        function loadSource() {
            if (loaded || !video || !source) {
                return Promise.resolve();
            }
            loaded = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                return Promise.resolve();
            }
            return getHlsClass().then(function (HlsClass) {
                if (HlsClass && HlsClass.isSupported && HlsClass.isSupported()) {
                    hlsInstance = new HlsClass({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = source;
                }
            }).catch(function () {
                video.src = source;
            });
        }

        function start() {
            loadSource().then(function () {
                hideButton();
                var result = video.play();
                if (result && result.catch) {
                    result.catch(function () {});
                }
            });
        }

        if (button) {
            button.addEventListener('click', start);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    start();
                }
            });
            video.addEventListener('play', hideButton);
            video.addEventListener('ended', function () {
                if (hlsInstance && hlsInstance.destroy) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        }
    };
})();
