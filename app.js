// 场景、相机、渲染器
let scene, camera, renderer;
let earth, clouds, stars;
let isRotating = true;
let showClouds = true;
let controls = {
    isDragging: false,
    previousMousePosition: { x: 0, y: 0 },
    rotation: { x: 0, y: 0 }
};

// 初始化场景
function init() {
    // 创建场景
    scene = new THREE.Scene();

    // 创建相机
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 3;

    // 创建渲染器
    const canvas = document.getElementById('canvas');
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // 创建地球
    createEarth();

    // 创建云层
    createClouds();

    // 创建星空背景
    createStars();

    // 添加光源
    addLights();

    // 添加事件监听
    addEventListeners();

    // 开始动画
    animate();
}

// 创建地球
function createEarth() {
    const geometry = new THREE.SphereGeometry(1, 64, 64);

    // 使用程序生成的地球纹理
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // 绘制海洋
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a4d7a');
    gradient.addColorStop(0.5, '#2563a8');
    gradient.addColorStop(1, '#1a4d7a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制陆地（简化的大陆形状）
    ctx.fillStyle = '#2d5016';

    // 北美洲
    ctx.beginPath();
    ctx.ellipse(400, 300, 180, 220, 0, 0, Math.PI * 2);
    ctx.fill();

    // 南美洲
    ctx.beginPath();
    ctx.ellipse(450, 650, 120, 200, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // 欧洲
    ctx.beginPath();
    ctx.ellipse(1000, 250, 150, 120, 0, 0, Math.PI * 2);
    ctx.fill();

    // 非洲
    ctx.beginPath();
    ctx.ellipse(1050, 500, 180, 250, 0, 0, Math.PI * 2);
    ctx.fill();

    // 亚洲
    ctx.beginPath();
    ctx.ellipse(1400, 300, 280, 220, 0, 0, Math.PI * 2);
    ctx.fill();

    // 澳大利亚
    ctx.beginPath();
    ctx.ellipse(1600, 700, 140, 100, 0, 0, Math.PI * 2);
    ctx.fill();

    // 添加一些细节
    ctx.fillStyle = '#3d6b26';
    for (let i = 0; i < 200; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = Math.random() * 20 + 10;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.MeshPhongMaterial({
        map: texture,
        bumpScale: 0.05,
        shininess: 5
    });

    earth = new THREE.Mesh(geometry, material);
    scene.add(earth);
}

// 创建云层
function createClouds() {
    const geometry = new THREE.SphereGeometry(1.01, 64, 64);

    // 创建云层纹理
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // 透明背景
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制云层
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < 300; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radiusX = Math.random() * 40 + 20;
        const radiusY = Math.random() * 20 + 10;

        ctx.beginPath();
        ctx.ellipse(x, y, radiusX, radiusY, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.MeshPhongMaterial({
        map: texture,
        transparent: true,
        opacity: 0.6,
        depthWrite: false
    });

    clouds = new THREE.Mesh(geometry, material);
    scene.add(clouds);
}

// 创建星空背景
function createStars() {
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.02,
        transparent: true
    });

    const starVertices = [];
    for (let i = 0; i < 10000; i++) {
        const x = (Math.random() - 0.5) * 50;
        const y = (Math.random() - 0.5) * 50;
        const z = (Math.random() - 0.5) * 50;
        starVertices.push(x, y, z);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
}

// 添加光源
function addLights() {
    // 环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // 方向光（模拟太阳光）
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    // 背面光
    const backLight = new THREE.DirectionalLight(0x6699ff, 0.3);
    backLight.position.set(-5, -3, -5);
    scene.add(backLight);
}

// 动画循环
function animate() {
    requestAnimationFrame(animate);

    // 自动旋转
    if (isRotating) {
        earth.rotation.y += 0.002;
        if (clouds && showClouds) {
            clouds.rotation.y += 0.0025;
        }
    }

    // 手动旋转
    earth.rotation.x += controls.rotation.x;
    earth.rotation.y += controls.rotation.y;
    if (clouds && showClouds) {
        clouds.rotation.x = earth.rotation.x;
        clouds.rotation.y = earth.rotation.y;
    }

    // 减慢手动旋转
    controls.rotation.x *= 0.95;
    controls.rotation.y *= 0.95;

    // 星空缓慢旋转
    if (stars) {
        stars.rotation.y += 0.0001;
    }

    renderer.render(scene, camera);
}

// 添加事件监听
function addEventListeners() {
    // 鼠标拖拽
    const canvas = document.getElementById('canvas');

    canvas.addEventListener('mousedown', (e) => {
        controls.isDragging = true;
        controls.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    canvas.addEventListener('mousemove', (e) => {
        if (controls.isDragging) {
            const deltaX = e.clientX - controls.previousMousePosition.x;
            const deltaY = e.clientY - controls.previousMousePosition.y;

            controls.rotation.y = deltaX * 0.005;
            controls.rotation.x = deltaY * 0.005;

            controls.previousMousePosition = { x: e.clientX, y: e.clientY };
        }
    });

    canvas.addEventListener('mouseup', () => {
        controls.isDragging = false;
    });

    canvas.addEventListener('mouseleave', () => {
        controls.isDragging = false;
    });

    // 触摸事件（移动端）
    canvas.addEventListener('touchstart', (e) => {
        controls.isDragging = true;
        controls.previousMousePosition = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };
    });

    canvas.addEventListener('touchmove', (e) => {
        if (controls.isDragging) {
            const deltaX = e.touches[0].clientX - controls.previousMousePosition.x;
            const deltaY = e.touches[0].clientY - controls.previousMousePosition.y;

            controls.rotation.y = deltaX * 0.005;
            controls.rotation.x = deltaY * 0.005;

            controls.previousMousePosition = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        }
        e.preventDefault();
    });

    canvas.addEventListener('touchend', () => {
        controls.isDragging = false;
    });

    // 鼠标滚轮缩放
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY * 0.001;
        camera.position.z += delta;
        camera.position.z = Math.max(1.5, Math.min(5, camera.position.z));
    });

    // 窗口大小调整
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// 控制按钮功能
function toggleRotation() {
    isRotating = !isRotating;
}

function toggleClouds() {
    showClouds = !showClouds;
    if (clouds) {
        clouds.visible = showClouds;
    }
}

function resetView() {
    camera.position.z = 3;
    earth.rotation.set(0, 0, 0);
    if (clouds) {
        clouds.rotation.set(0, 0, 0);
    }
    controls.rotation = { x: 0, y: 0 };
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', init);
