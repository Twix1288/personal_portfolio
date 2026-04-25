/**
 * My Work — WebGL blueprint studio + scrollytelling helpers
 */
(function () {
    'use strict';

    const canvas = document.getElementById('mw-webgl');
    const hero = document.querySelector('.mw-hero');
    if (!canvas || !hero) return;

    const gl = canvas.getContext('webgl', {
        alpha: true,
        antialias: true,
        premultipliedAlpha: false,
        preserveDrawingBuffer: false,
    });
    if (!gl) {
        console.warn('[my_work] WebGL unavailable');
        return;
    }

    function compileShader(type, src) {
        const sh = gl.createShader(type);
        gl.shaderSource(sh, src);
        gl.compileShader(sh);
        if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
            console.error('[my_work] Shader error:', gl.getShaderInfoLog(sh));
            gl.deleteShader(sh);
            return null;
        }
        return sh;
    }

    const vsSource = `
        attribute vec3 aPos;
        uniform mat4 uMVP;
        void main() {
            gl_Position = uMVP * vec4(aPos, 1.0);
        }
    `;

    const fsSource = `
        precision mediump float;
        void main() {
            gl_FragColor = vec4(0.15, 0.92, 1.0, 0.92);
        }
    `;

    const vs = compileShader(gl.VERTEX_SHADER, vsSource);
    const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('[my_work] Program link error:', gl.getProgramInfoLog(program));
        return;
    }
    gl.useProgram(program);

    const aPos = gl.getAttribLocation(program, 'aPos');
    const uMVP = gl.getUniformLocation(program, 'uMVP');
    if (aPos < 0 || !uMVP) {
        console.error('[my_work] Invalid program locations');
        return;
    }

    function resize() {
        const rect = hero.getBoundingClientRect();
        const cssW = Math.max(1, Math.floor(rect.width));
        const cssH = Math.max(1, Math.floor(rect.height));
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = Math.floor(cssW * dpr);
        const h = Math.floor(cssH * dpr);
        if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
        }
        gl.viewport(0, 0, canvas.width, canvas.height);
    }

    function mat4Identity(out) {
        out[0] = 1; out[1] = 0; out[2] = 0; out[3] = 0;
        out[4] = 0; out[5] = 1; out[6] = 0; out[7] = 0;
        out[8] = 0; out[9] = 0; out[10] = 1; out[11] = 0;
        out[12] = 0; out[13] = 0; out[14] = 0; out[15] = 1;
        return out;
    }

    function mat4Multiply(out, a, b) {
        for (let c = 0; c < 4; c++) {
            for (let r = 0; r < 4; r++) {
                out[c * 4 + r] =
                    a[0 * 4 + r] * b[c * 4 + 0] +
                    a[1 * 4 + r] * b[c * 4 + 1] +
                    a[2 * 4 + r] * b[c * 4 + 2] +
                    a[3 * 4 + r] * b[c * 4 + 3];
            }
        }
        return out;
    }

    function mat4Perspective(out, fovy, aspect, near, far) {
        const f = 1.0 / Math.tan(fovy / 2);
        const nf = 1 / (near - far);
        out[0] = f / aspect; out[1] = 0; out[2] = 0; out[3] = 0;
        out[4] = 0; out[5] = f; out[6] = 0; out[7] = 0;
        out[8] = 0; out[9] = 0; out[10] = (far + near) * nf; out[11] = -1;
        out[12] = 0; out[13] = 0; out[14] = 2 * far * near * nf; out[15] = 0;
        return out;
    }

    function mat4RotateY(out, a, rad) {
        const c = Math.cos(rad);
        const s = Math.sin(rad);
        const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
        const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
        out[0] = a00 * c + a20 * s;
        out[1] = a01 * c + a21 * s;
        out[2] = a02 * c + a22 * s;
        out[3] = a03 * c + a23 * s;
        out[8] = a00 * -s + a20 * c;
        out[9] = a01 * -s + a21 * c;
        out[10] = a02 * -s + a22 * c;
        out[11] = a03 * -s + a23 * c;
        out[4] = a[4]; out[5] = a[5]; out[6] = a[6]; out[7] = a[7];
        out[12] = a[12]; out[13] = a[13]; out[14] = a[14]; out[15] = a[15];
        return out;
    }

    function mat4Translate(out, a, v) {
        const x = v[0], y = v[1], z = v[2];
        if (a !== out) {
            out[0] = a[0]; out[1] = a[1]; out[2] = a[2]; out[3] = a[3];
            out[4] = a[4]; out[5] = a[5]; out[6] = a[6]; out[7] = a[7];
            out[8] = a[8]; out[9] = a[9]; out[10] = a[10]; out[11] = a[11];
        }
        out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
        out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
        out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
        out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
        return out;
    }

    const lines = [];
    const gridSize = 14;
    const step = 1.2;
    const o = (gridSize * step) / 2;
    for (let i = 0; i <= gridSize; i++) {
        const p = i * step - o;
        lines.push(-o, 0, p, o, 0, p);
        lines.push(p, 0, -o, p, 0, o);
    }
    for (let i = 0; i < gridSize; i += 2) {
        const x = i * step - o + step;
        lines.push(x, 0, -o, x, 4.5 + (i % 4), -o + 2);
        lines.push(x, 0, o, x, 3.5 + (i % 3), o - 1.5);
    }

    const vertices = new Float32Array(lines);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);

    const proj = new Float32Array(16);
    const viewA = new Float32Array(16);
    const viewB = new Float32Array(16);
    const model = new Float32Array(16);
    const mvp = new Float32Array(16);
    const tmp = new Float32Array(16);

    let scrollY = window.scrollY;
    window.addEventListener(
        'scroll',
        () => {
            scrollY = window.scrollY;
        },
        { passive: true }
    );

    let start = performance.now();
    function frame(t) {
        resize();
        const elapsed = (t - start) * 0.001;
        const aspect = canvas.width / Math.max(1, canvas.height);

        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.depthMask(false);
        gl.lineWidth(1);

        mat4Perspective(proj, (48 * Math.PI) / 180, aspect, 0.1, 120);
        mat4Identity(viewA);
        mat4Translate(viewB, viewA, [0, -2.2, -14 + Math.min(scrollY * 0.0025, 4)]);
        mat4RotateY(viewA, viewB, elapsed * 0.14 + scrollY * 0.0015);

        mat4Identity(model);
        mat4Multiply(tmp, viewA, model);
        mat4Multiply(mvp, proj, tmp);
        gl.uniformMatrix4fv(uMVP, false, mvp);

        gl.drawArrays(gl.LINES, 0, vertices.length / 3);

        requestAnimationFrame(frame);
    }

    window.addEventListener('resize', resize, { passive: true });
    if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(() => resize());
        ro.observe(hero);
    }
    resize();
    requestAnimationFrame(frame);
})();

(function () {
    const page = document.querySelector('.page-my-work');
    if (!page) return;

    const fill = document.querySelector('.mw-scroll-rail-fill');
    const vignette = document.querySelector('.mw-vignette-pulse');
    const chapters = document.querySelectorAll('.mw-chapter-nav a');

    function onScroll() {
        const doc = document.documentElement;
        const max = doc.scrollHeight - window.innerHeight;
        const p = max > 0 ? window.scrollY / max : 0;
        if (fill) fill.style.height = `${Math.min(100, p * 100)}%`;
        if (vignette) vignette.style.opacity = (0.12 + p * 0.28).toFixed(3);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const sections = document.querySelectorAll('[data-mw-chapter]');
    if (sections.length && chapters.length) {
        const obs = new IntersectionObserver(
            (entries) => {
                entries.forEach((en) => {
                    if (!en.isIntersecting) return;
                    const id = en.target.getAttribute('id');
                    chapters.forEach((a) => {
                        a.classList.toggle('is-active', a.getAttribute('href') === `#${id}`);
                    });
                });
            },
            { rootMargin: '-40% 0px -45% 0px', threshold: 0 }
        );
        sections.forEach((s) => obs.observe(s));
    }

    const stages = document.querySelectorAll('.mw-project-stage');
    let mx = 0.5;
    let my = 0.5;
    document.addEventListener(
        'mousemove',
        (e) => {
            mx = e.clientX / window.innerWidth;
            my = e.clientY / window.innerHeight;
        },
        { passive: true }
    );

    function tiltScenes() {
        const offX = (mx - 0.5) * 8;
        const offY = (my - 0.5) * -6;
        stages.forEach((el) => {
            const rect = el.getBoundingClientRect();
            const vh = window.innerHeight;
            const vis = 1 - Math.min(1, Math.abs(rect.top + rect.height / 2 - vh / 2) / (vh * 0.9));
            const scrollLift = (1 - vis) * 4;
            el.style.transform = `rotateX(${offY * vis - scrollLift}deg) rotateY(${offX * vis}deg) translateZ(0)`;
        });
        requestAnimationFrame(tiltScenes);
    }
    if (stages.length) requestAnimationFrame(tiltScenes);

    const depths = document.querySelectorAll('.mw-depth');
    window.addEventListener(
        'scroll',
        () => {
            const y = window.scrollY;
            depths.forEach((el) => {
                const speed = parseFloat(el.getAttribute('data-speed') || '0.12', 10);
                el.style.transform = `translate3d(0, ${y * speed}px, 0)`;
            });
        },
        { passive: true }
    );
})();
