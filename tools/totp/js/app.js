function getCurrentSeconds() {
    return Math.round(new Date().getTime() / 1000.0);
}

function stripSpaces(str) {
    return str.replace(/\s/g, '');
}

function truncateTo(str, digits) {
    if (str.length <= digits) {
        return str;
    }

    return str.slice(-digits);
}

function parseURLSearch(search) {
    const queryParams = search.substr(1).split('&').reduce(function (q, query) {
        const chunks = query.split('=');
        const key = chunks[0];
        let value = decodeURIComponent(chunks[1]);
        value = isNaN(Number(value)) ? value : Number(value);
        return (q[key] = value, q);
    }, {});

    return queryParams;
}

const app = Vue.createApp({
    data() {
        return {
            secret_key: 'JBSWY3DPEHPK3PXP',
            digits: 6,
            period: 30,
            algorithm: 'SHA1',
            updatingIn: 30,
            token: null,
            clipboardButton: null,
            isDarkMode: false,
        };
    },

    watch: {
        isDarkMode: function(isDark) {
            this.applyDarkModeClass(isDark); // isDarkMode 变化时，应用样式
        }
    },

    mounted: function () {
        this.getKeyFromUrl();
        this.getQueryParameters()
        this.initializeDarkMode();
        this.applyDarkModeClass(this.isDarkMode); // 关键修复：确保初始化后应用正确的样式
        this.update();

        this.intervalHandle = setInterval(this.update, 1000);

        this.clipboardButton = new ClipboardJS('#clipboard-button');
    },

    destroyed: function () {
        clearInterval(this.intervalHandle);
    },

    computed: {
        totp: function () {
            return new OTPAuth.TOTP({
                algorithm: this.algorithm,
                digits: this.digits,
                period: this.period,
                secret: OTPAuth.Secret.fromBase32(stripSpaces(this.secret_key)),
            });
        }
    },

    methods: {
        update: function () {
            this.updatingIn = this.period - (getCurrentSeconds() % this.period);
            this.token = truncateTo(this.totp.generate(), this.digits);
        },

        // 暗黑模式 DOM 操作方法
        applyDarkModeClass: function (isDark) {
            if (isDark) {
                document.body.classList.add('is-dark');
            } else {
                document.body.classList.remove('is-dark');
            }
        },

        // 暗黑模式初始化方法
        initializeDarkMode: function () {
            const storedTheme = localStorage.getItem('theme');
            if (storedTheme) {
                this.isDarkMode = storedTheme === 'dark';
                return;
            }
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                this.isDarkMode = true;
            }
        },

        toggleDarkMode: function () {
            this.isDarkMode = !this.isDarkMode;
            localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
        },
        // 结束暗黑模式方法

        getKeyFromUrl: function () {
            const key = document.location.hash.replace(/[#\/]+/, '');

            if (key.length > 0) {
                this.secret_key = key;
            }
        },
        getQueryParameters: function () {
            const queryParams = parseURLSearch(window.location.search);

            if (queryParams.key) {
                this.secret_key = queryParams.key;
            }

            if (queryParams.digits) {
                this.digits = queryParams.digits;
            }

            if (queryParams.period) {
                this.period = queryParams.period;
            }

            if (queryParams.algorithm) {
                this.algorithm = queryParams.algorithm;
            }
        }
    }
});

app.mount('#app');