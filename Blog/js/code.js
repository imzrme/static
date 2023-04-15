// 在代码块右上角添加复制按钮
document.addEventListener('DOMContentLoaded', initCodeCopyButton);
function initCodeCopyButton() {
    function initCSS(callback) {
        const css = `
                .btn-code-copy {
                    position: absolute;
                    line-height: .6em;
                    top: .2em;
                    right: .2em;
                    color: rgb(87, 87, 87);
                }
                .btn-code-copy:hover {
                    color: rgb(145, 145, 145);
                    cursor: pointer;
                }
                `;
        const styleId = btoa('btn-code-copy').replace(/[=+\/]/g, '');
        const head = document.getElementsByTagName('head')[0];
        if (!head.querySelector('#' + styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            if (style.styleSheet) {
                style.styleSheet.cssText = css;
            } else {
                style.appendChild(document.createTextNode(css));
            }
            head.appendChild(style);
        }
        callback();
    };
    function copyTextContent(source) {
        let result = false;
        const target = document.createElement('pre');
        target.style.opacity = '0';
        target.textContent = source.textContent;
        document.body.appendChild(target);
        try {
            const range = document.createRange();
            range.selectNode(target);
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);
            document.execCommand('copy');
            window.getSelection().removeAllRanges();
            result = true;
        } catch (e) { console.log('copy failed.'); }
        document.body.removeChild(target);
        return result;
    };
    function initButton(pre) {
        const code = pre.querySelector('code');
        if (code) {
            const preParent = pre.parentElement;
            const newPreParent = document.createElement('div');
            newPreParent.style = 'position: relative';
            preParent.insertBefore(newPreParent, pre);
            const copyBtn = document.createElement('div');
            copyBtn.innerHTML = 'copy';
            copyBtn.className = 'btn-code-copy';
            copyBtn.addEventListener('click', () => {
                copyBtn.innerHTML = copyTextContent(code) ? 'success' : 'failure';
                setTimeout(() => copyBtn.innerHTML = 'copy', 250);
            });
            newPreParent.appendChild(copyBtn);
            newPreParent.appendChild(pre);
        }
    };
    const pres = document.querySelectorAll('pre');
    if (pres.length !== 0) {
        initCSS(() => pres.forEach(pre => initButton(pre)));
    }
};