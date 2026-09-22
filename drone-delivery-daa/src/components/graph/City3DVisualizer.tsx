'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

const CITY_LOCATIONS = [
    { name: "Depot Alpha", x: 0, z: 0, type: "depot" },
    { name: "Harbor District", x: -15, z: 10, type: "normal" },
    { name: "Old Town", x: -5, z: -15, type: "normal" },
    { name: "Skyline Tower", x: 10, z: -10, type: "highrise" },
    { name: "Riverside", x: 12, z: 8, type: "normal" },
    { name: "Tech Park", x: 22, z: 4, type: "normal" },
    { name: "Greenwood", x: 30, z: 12, type: "normal" },
    { name: "University", x: 20, z: 25, type: "normal" },
    { name: "Eastgate", x: 35, z: -5, type: "normal" },
    { name: "Hillcrest", x: 38, z: 20, type: "normal" }
];

const ROUTES = [
    {
        id: 0,
        name: "Short Delivery",
        algo: "Dijkstra — 12 nodes",
        path: [
            { name: "Depot Alpha", x: 0, z: 0 },
            { name: "Skyline Tower", x: 10, z: -10 },
            { name: "Eastgate", x: 35, z: -5 }
        ]
    },
    {
        id: 1,
        name: "Complex Path",
        algo: "A* — 5 nodes",
        path: [
            { name: "Depot Alpha", x: 0, z: 0 },
            { name: "Riverside", x: 12, z: 8 },
            { name: "Tech Park", x: 22, z: 4 },
            { name: "Greenwood", x: 30, z: 12 },
            { name: "Hillcrest", x: 38, z: 20 }
        ]
    }
];

export default function City3DVisualizer() {
    const containerRef = useRef<HTMLDivElement>(null);
    const passedNotificationRef = useRef<HTMLDivElement>(null);

    // UI Refs
    const routeTextRef = useRef<HTMLDivElement>(null);
    const algoBadgeRef = useRef<HTMLDivElement>(null);
    const legTextRef = useRef<HTMLDivElement>(null);
    const distTextRef = useRef<HTMLDivElement>(null);
    const progressTextRef = useRef<HTMLSpanElement>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);

    // Controls Refs
    const btnPlayRef = useRef<HTMLButtonElement>(null);
    const btnPauseRef = useRef<HTMLButtonElement>(null);
    const btnRestartRef = useRef<HTMLButtonElement>(null);
    const speedSelectRef = useRef<HTMLSelectElement>(null);
    const routeSelectRef = useRef<HTMLSelectElement>(null);
    const camToggleRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        let currentRouteIdx = 1;
        let routeData = ROUTES[currentRouteIdx];
        
        let isPlaying = false;
        let flightProgress = 0;
        let flightSpeed = 1.0;
        let chaseCam = true;
        let prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const FLIGHT_ALTITUDE = 6;
        const DRONE_SCALE = 0.5;
        const BASE_DURATION = 15000;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x050a1f);
        scene.fog = new THREE.FogExp2(0x050a1f, 0.015);

        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
        
        const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        containerRef.current.appendChild(renderer.domElement);

        const labelRenderer = new CSS2DRenderer();
        labelRenderer.setSize(width, height);
        labelRenderer.domElement.style.position = 'absolute';
        labelRenderer.domElement.style.top = '0px';
        labelRenderer.domElement.style.pointerEvents = 'none';
        containerRef.current.appendChild(labelRenderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.maxPolarAngle = Math.PI / 2 - 0.05;
        
        function resetCamera() {
            camera.position.set(-15, 25, 20);
            controls.target.set(15, 0, 5);
        }
        resetCamera();

        const ambientLight = new THREE.AmbientLight(0x223355, 1.5);
        scene.add(ambientLight);
        
        const dirLight = new THREE.DirectionalLight(0x4466aa, 1);
        dirLight.position.set(50, 100, 20);
        scene.add(dirLight);

        const gridHelper = new THREE.GridHelper(100, 50, 0x112244, 0x0a1530);
        gridHelper.position.y = 0.01;
        scene.add(gridHelper);

        const groundGeo = new THREE.PlaneGeometry(100, 100);
        const groundMat = new THREE.MeshBasicMaterial({ color: 0x030612 });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        scene.add(ground);

        const buildingMaterials = [
            new THREE.MeshLambertMaterial({ color: 0x1a2642 }),
            new THREE.MeshLambertMaterial({ color: 0x243254 }),
            new THREE.MeshLambertMaterial({ color: 0x15203b }),
            new THREE.MeshLambertMaterial({ color: 0x1f2f54, emissive: 0x112244, emissiveIntensity: 0.2 })
        ];

        CITY_LOCATIONS.forEach(loc => {
            let width = 2 + Math.random() * 2;
            let depth = 2 + Math.random() * 2;
            let height = loc.type === "highrise" ? 15 + Math.random() * 5 : 
                         loc.type === "depot" ? 4 : 
                         3 + Math.random() * 6;

            const bGeo = new THREE.BoxGeometry(width, height, depth);
            bGeo.translate(0, height / 2, 0);
            
            const bMat = buildingMaterials[Math.floor(Math.random() * buildingMaterials.length)];
            const building = new THREE.Mesh(bGeo, bMat);
            building.position.set(loc.x, 0, loc.z);
            scene.add(building);

            const div = document.createElement('div');
            // Tailwind classes instead of raw CSS
            div.className = 'px-1.5 py-0.5 bg-black/60 border border-white/20 rounded font-mono text-[10px] text-white/80 whitespace-nowrap pointer-events-none';
            div.textContent = loc.name;
            const label = new CSS2DObject(div);
            label.position.set(loc.x, height + 1, loc.z);
            scene.add(label);
            
            for(let i=0; i<3; i++) {
                let bw = 1+Math.random()*2;
                let bd = 1+Math.random()*2;
                let bh = height * (0.3 + Math.random()*0.5);
                const bg = new THREE.BoxGeometry(bw, bh, bd);
                bg.translate(0, bh/2, 0);
                const bm = new THREE.Mesh(bg, buildingMaterials[0]);
                bm.position.set(loc.x + (Math.random()-0.5)*8, 0, loc.z + (Math.random()-0.5)*8);
                scene.add(bm);
            }
        });

        const droneGroup = new THREE.Group();
        scene.add(droneGroup);

        const bodyGeo = new THREE.BoxGeometry(1.2, 0.4, 1.2);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8, roughness: 0.2 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        droneGroup.add(body);

        const coreGeo = new THREE.BoxGeometry(0.8, 0.45, 0.8);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
        const core = new THREE.Mesh(coreGeo, coreMat);
        droneGroup.add(core);

        const armGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.8);
        armGeo.rotateZ(Math.PI / 2);
        const armMat = new THREE.MeshStandardMaterial({ color: 0x555555 });
        
        const rotorGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.05, 16);
        const rotorMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });

        const rotors: THREE.Mesh[] = [];
        const offsets = [
            { x: 0.8, z: 0.8, rotY: Math.PI/4 },
            { x: -0.8, z: 0.8, rotY: -Math.PI/4 },
            { x: 0.8, z: -0.8, rotY: -Math.PI/4 },
            { x: -0.8, z: -0.8, rotY: Math.PI/4 }
        ];

        offsets.forEach(off => {
            const arm = new THREE.Mesh(armGeo, armMat);
            arm.rotation.y = off.rotY;
            droneGroup.add(arm);
            const motorGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.3);
            const motor = new THREE.Mesh(motorGeo, bodyMat);
            motor.position.set(off.x, 0.1, off.z);
            droneGroup.add(motor);
            const rotor = new THREE.Mesh(rotorGeo, rotorMat);
            rotor.position.set(off.x, 0.25, off.z);
            rotors.push(rotor);
            droneGroup.add(rotor);
        });

        droneGroup.scale.set(DRONE_SCALE, DRONE_SCALE, DRONE_SCALE);
        droneGroup.visible = false;

        let pathCurve: THREE.CatmullRomCurve3 | null = null;
        let routeObjects: any[] = [];
        let routeLength = 0;
        let segments: any[] = [];
        let trailLine: THREE.Mesh | null = null;
        let destPulsarMat: THREE.MeshBasicMaterial | null = null;
        let trailShaderMat: THREE.ShaderMaterial | null = null;

        function loadRoute(routeDef: any) {
            routeObjects.forEach(obj => {
                if (obj.isCSS2DObject) {
                    if (obj.parent) obj.parent.remove(obj);
                } else {
                    scene.remove(obj);
                    if (obj.geometry) obj.geometry.dispose();
                    if (obj.material) {
                        if (Array.isArray(obj.material)) obj.material.forEach((m: any) => m.dispose());
                        else obj.material.dispose();
                    }
                }
            });
            routeObjects = [];
            segments = [];
            
            const points = routeDef.path.map((p: any) => new THREE.Vector3(p.x, FLIGHT_ALTITUDE, p.z));
            pathCurve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5);
            
            const tubeGeo = new THREE.TubeGeometry(pathCurve, Math.max(64, points.length * 20), 0.15, 8, false);
            const tubeMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.4 });
            const tube = new THREE.Mesh(tubeGeo, tubeMat);
            scene.add(tube);
            routeObjects.push(tube);

            const trailGeo = new THREE.TubeGeometry(pathCurve, Math.max(64, points.length * 20), 0.2, 8, false);
            trailShaderMat = new THREE.ShaderMaterial({
                uniforms: {
                    color: { value: new THREE.Color(0x22d3ee) },
                    progress: { value: 0.0 }
                },
                vertexShader: `
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform vec3 color;
                    uniform float progress;
                    varying vec2 vUv;
                    void main() {
                        if (vUv.x > progress) discard;
                        gl_FragColor = vec4(color, 1.0);
                    }
                `,
                transparent: true,
                side: THREE.DoubleSide
            });
            trailLine = new THREE.Mesh(trailGeo, trailShaderMat);
            scene.add(trailLine);
            routeObjects.push(trailLine);

            routeLength = pathCurve.getLength();
            let accumulated = 0;
            for(let i=0; i<points.length-1; i++) {
                let legDist = points[i].distanceTo(points[i+1]);
                segments.push({
                    from: routeDef.path[i].name,
                    to: routeDef.path[i+1].name,
                    startT: accumulated / routeLength,
                    endT: (accumulated + legDist) / routeLength,
                    passed: false
                });
                accumulated += legDist;
            }

            routeDef.path.forEach((wp: any, index: number) => {
                const isStart = index === 0;
                const isEnd = index === routeDef.path.length - 1;
                const isInter = !isStart && !isEnd;

                const ringGeo = new THREE.RingGeometry(1, 1.5, 32);
                ringGeo.rotateX(-Math.PI/2);
                let ringColor = 0x06b6d4;
                if (isEnd) ringColor = 0xfbbf24;
                else if (isStart) ringColor = 0x3b82f6;

                const ringMat = new THREE.MeshBasicMaterial({ color: ringColor, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
                const ring = new THREE.Mesh(ringGeo, ringMat);
                ring.position.set(wp.x, 0.05, wp.z);
                scene.add(ring);
                routeObjects.push(ring);

                if (isInter || isEnd) {
                    const beaconGeo = new THREE.CylinderGeometry(0.1, 0.1, FLIGHT_ALTITUDE, 16);
                    beaconGeo.translate(0, FLIGHT_ALTITUDE/2, 0);
                    
                    let bMat;
                    if (isEnd) {
                        destPulsarMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.6 });
                        bMat = destPulsarMat;
                        
                        const div = document.createElement('div');
                        div.className = 'px-2 py-1 bg-black/80 border border-amber-400 rounded text-amber-400 font-bold uppercase text-[14px] pointer-events-none';
                        div.textContent = `DEST: ${wp.name}`;
                        const label = new CSS2DObject(div);
                        label.position.set(wp.x, FLIGHT_ALTITUDE + 2, wp.z);
                        scene.add(label);
                        routeObjects.push(label);
                    } else {
                        bMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.4 });
                    }
                    
                    const beacon = new THREE.Mesh(beaconGeo, bMat);
                    beacon.position.set(wp.x, 0, wp.z);
                    scene.add(beacon);
                    routeObjects.push(beacon);
                    
                    if (isInter) {
                        segments[index-1].beaconMat = bMat;
                    }
                }
            });

            if (routeTextRef.current) routeTextRef.current.textContent = routeDef.path.map((p: any) => p.name).join(" → ");
            if (algoBadgeRef.current) algoBadgeRef.current.textContent = routeDef.algo;
            if (distTextRef.current) distTextRef.current.textContent = `0 / ${(routeLength/10).toFixed(1)} km`;
            if (legTextRef.current) legTextRef.current.textContent = "Ready";
            if (progressTextRef.current) progressTextRef.current.textContent = "0%";
            if (progressBarRef.current) progressBarRef.current.style.width = "0%";
            
            flightProgress = 0;
            updateDronePosition(0);
            droneGroup.visible = true;
            isPlaying = false;
            updatePlayBtn();
            if (trailShaderMat) trailShaderMat.uniforms.progress.value = 0.0;
        }

        const clock = new THREE.Clock();
        
        function updateDronePosition(t: number) {
            if (!pathCurve) return;
            
            const pos = pathCurve.getPointAt(t);
            droneGroup.position.copy(pos);
            
            const time = clock.getElapsedTime();
            droneGroup.position.y += Math.sin(time * 3) * 0.2;

            if (t < 0.999) {
                const tangent = pathCurve.getTangentAt(t).normalize();
                const targetPos = pos.clone().add(tangent);
                droneGroup.lookAt(targetPos);
                
                if (t > 0.01) {
                    const prevTangent = pathCurve.getTangentAt(t - 0.01).normalize();
                    const cross = new THREE.Vector3().crossVectors(prevTangent, tangent);
                    droneGroup.rotateZ(-cross.y * 30);
                }
            } else {
                droneGroup.position.y = THREE.MathUtils.lerp(FLIGHT_ALTITUDE, 0.5, (t - 0.95) * 20);
            }

            rotors.forEach((r, i) => {
                r.rotation.y += (isPlaying ? 0.8 : 0.2) * (i % 2 === 0 ? 1 : -1);
            });

            if (chaseCam && isPlaying) {
                const tangent = pathCurve.getTangentAt(Math.min(t, 0.99)).normalize();
                const camOffset = tangent.clone().multiplyScalar(-10).add(new THREE.Vector3(0, 5, 0));
                camera.position.lerp(pos.clone().add(camOffset), 0.1);
                controls.target.lerp(pos, 0.1);
            }
        }

        function triggerPassedNotification(name: string) {
            if (passedNotificationRef.current) {
                const notif = passedNotificationRef.current;
                notif.textContent = `Passed: ${name}`;
                notif.style.opacity = '1';
                notif.style.transform = 'translate(-50%, 0) scale(1.1)';
                setTimeout(() => {
                    notif.style.transform = 'translate(-50%, 0) scale(1)';
                }, 100);
                setTimeout(() => {
                    notif.style.opacity = '0';
                    notif.style.transform = 'translate(-50%, -20px) scale(0.9)';
                }, 2000);
            }
        }

        let animationFrameId: number;
        function animate() {
            animationFrameId = requestAnimationFrame(animate);
            const delta = clock.getDelta();

            if (isPlaying) {
                if (prefersReducedMotion) {
                    flightProgress = 1;
                } else {
                    const timeForFullRoute = BASE_DURATION / flightSpeed;
                    flightProgress += (delta * 1000) / timeForFullRoute;
                }
                
                if (flightProgress >= 1) {
                    flightProgress = 1;
                    isPlaying = false;
                    updatePlayBtn();
                    if (legTextRef.current) legTextRef.current.textContent = "Arrived at Destination";
                }

                if (trailShaderMat) trailShaderMat.uniforms.progress.value = flightProgress;
                
                const pct = Math.floor(flightProgress * 100);
                if (progressTextRef.current) progressTextRef.current.textContent = `${pct}%`;
                if (progressBarRef.current) progressBarRef.current.style.width = `${pct}%`;
                
                const covered = ((flightProgress * routeLength)/10).toFixed(1);
                const total = (routeLength/10).toFixed(1);
                if (distTextRef.current) distTextRef.current.textContent = `${covered} / ${total} km`;

                let currentLeg = segments.find(s => flightProgress >= s.startT && flightProgress < s.endT);
                if (currentLeg && legTextRef.current) {
                    legTextRef.current.textContent = `En route to ${currentLeg.to}`;
                }
                
                segments.forEach(seg => {
                    if (flightProgress > seg.endT && !seg.passed) {
                        seg.passed = true;
                        triggerPassedNotification(seg.to);
                        if (seg.beaconMat) {
                            seg.beaconMat.opacity = 0.9;
                            seg.beaconMat.color.setHex(0xffffff);
                            setTimeout(() => {
                                if (seg.beaconMat) {
                                    seg.beaconMat.opacity = 0.4;
                                    seg.beaconMat.color.setHex(0x06b6d4);
                                }
                            }, 500);
                        }
                    }
                });

                if (destPulsarMat) {
                    destPulsarMat.opacity = 0.4 + Math.sin(clock.getElapsedTime() * 8) * 0.3;
                }
            }

            updateDronePosition(flightProgress);
            controls.update();
            renderer.render(scene, camera);
            labelRenderer.render(scene, camera);
        }

        function updatePlayBtn() {
            if (btnPlayRef.current) btnPlayRef.current.style.display = isPlaying ? 'none' : 'flex';
            if (btnPauseRef.current) btnPauseRef.current.style.display = isPlaying ? 'flex' : 'none';
        }

        // Event Listeners
        const handlePlay = () => {
            if (flightProgress >= 1) {
                flightProgress = 0;
                segments.forEach(s => s.passed = false);
            }
            isPlaying = true;
            updatePlayBtn();
        };

        const handlePause = () => {
            isPlaying = false;
            updatePlayBtn();
        };

        const handleRestart = () => {
            flightProgress = 0;
            isPlaying = false;
            segments.forEach(s => s.passed = false);
            updatePlayBtn();
            updateDronePosition(0);
            if (trailShaderMat) trailShaderMat.uniforms.progress.value = 0;
            if (progressBarRef.current) progressBarRef.current.style.width = "0%";
            if (progressTextRef.current) progressTextRef.current.textContent = "0%";
            if (distTextRef.current) distTextRef.current.textContent = `0 / ${(routeLength/10).toFixed(1)} km`;
            if (legTextRef.current) legTextRef.current.textContent = "Ready";
            if (chaseCam) resetCamera();
        };

        const handleSpeedChange = (e: any) => {
            flightSpeed = parseFloat(e.target.value);
        };

        const handleCamToggle = (e: any) => {
            chaseCam = e.target.checked;
            if (!chaseCam) {
                controls.target.copy(droneGroup.position);
            }
        };

        const handleRouteChange = (e: any) => {
            currentRouteIdx = parseInt(e.target.value);
            routeData = ROUTES[currentRouteIdx];
            loadRoute(routeData);
            if(chaseCam) resetCamera();
        };

        const handleResize = () => {
            if (!containerRef.current) return;
            const width = containerRef.current.clientWidth;
            const height = containerRef.current.clientHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
            labelRenderer.setSize(width, height);
        };

        if (btnPlayRef.current) btnPlayRef.current.addEventListener('click', handlePlay);
        if (btnPauseRef.current) btnPauseRef.current.addEventListener('click', handlePause);
        if (btnRestartRef.current) btnRestartRef.current.addEventListener('click', handleRestart);
        if (speedSelectRef.current) speedSelectRef.current.addEventListener('change', handleSpeedChange);
        if (camToggleRef.current) camToggleRef.current.addEventListener('change', handleCamToggle);
        if (routeSelectRef.current) routeSelectRef.current.addEventListener('change', handleRouteChange);
        window.addEventListener('resize', handleResize);

        // Init
        loadRoute(routeData);
        animate();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            if (btnPlayRef.current) btnPlayRef.current.removeEventListener('click', handlePlay);
            if (btnPauseRef.current) btnPauseRef.current.removeEventListener('click', handlePause);
            if (btnRestartRef.current) btnRestartRef.current.removeEventListener('click', handleRestart);
            if (speedSelectRef.current) speedSelectRef.current.removeEventListener('change', handleSpeedChange);
            if (camToggleRef.current) camToggleRef.current.removeEventListener('change', handleCamToggle);
            if (routeSelectRef.current) routeSelectRef.current.removeEventListener('change', handleRouteChange);
            
            renderer.dispose();
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
        };
    }, []);

    return (
        <div className="relative w-full h-full overflow-hidden bg-[#050a1f] text-[#e0f2fe] font-sans">
            {/* 3D Canvas Container */}
            <div ref={containerRef} className="absolute inset-0 z-0" />
            
            {/* Passed Notification Overlay */}
            <div 
                ref={passedNotificationRef}
                className="absolute top-[20%] left-1/2 -translate-x-1/2 bg-emerald-500/20 border border-emerald-500 text-emerald-500 px-4 py-2 rounded-full font-bold opacity-0 transition-all duration-300 pointer-events-none z-20 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
            >
                Passed: Riverside
            </div>

            {/* UI Layer */}
            <div className="absolute inset-0 z-10 p-5 pointer-events-none flex flex-col justify-between">
                
                {/* Top Panel */}
                <div className="bg-[#050a1f]/70 border border-cyan-400/30 rounded-xl p-5 backdrop-blur-md shadow-2xl max-w-md pointer-events-auto">
                    <header className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="m-0 text-lg font-semibold uppercase tracking-wider text-white">Meridian City</h1>
                            <div className="text-xs text-sky-300">Flight Path Visualizer</div>
                        </div>
                        <div ref={algoBadgeRef} className="bg-cyan-500/20 text-cyan-400 border border-cyan-400/40 px-2 py-1 rounded text-xs font-bold">
                            A* — 5 nodes
                        </div>
                    </header>

                    <select ref={routeSelectRef} className="w-full bg-white/10 border border-white/20 text-white p-2.5 rounded-md text-sm font-medium outline-none cursor-pointer hover:bg-white/20 mb-4 appearance-none">
                        <option value="0" className="bg-[#050a1f]">Route 1: Short Delivery (3 stops)</option>
                        <option value="1" className="bg-[#050a1f]" selected>Route 2: Complex Path (5 stops)</option>
                    </select>

                    <div className="text-sm">
                        <div className="text-xs text-sky-300 uppercase mb-1">Current Route</div>
                        <div ref={routeTextRef} className="text-cyan-500 font-medium mb-3">Depot Alpha → ...</div>
                        
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-white/5 rounded-md p-2.5">
                                <div className="text-xs text-sky-300 uppercase mb-1">Current Leg</div>
                                <div ref={legTextRef} className="font-semibold text-sm">Ready</div>
                            </div>
                            <div className="bg-white/5 rounded-md p-2.5">
                                <div className="text-xs text-sky-300 uppercase mb-1">Distance</div>
                                <div ref={distTextRef} className="font-semibold text-base">0 / 0 km</div>
                            </div>
                        </div>
                        
                        <div>
                            <div className="flex justify-between text-xs mb-1.5">
                                <span>Progress</span>
                                <span ref={progressTextRef}>0%</span>
                            </div>
                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div ref={progressBarRef} className="h-full bg-cyan-500 w-0 transition-all duration-100 shadow-[0_0_10px_#06b6d4]"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Controls Panel */}
                <div className="self-center flex gap-3 items-center mb-5 bg-[#050a1f]/70 border border-cyan-400/30 rounded-xl p-4 backdrop-blur-md pointer-events-auto">
                    <button ref={btnPlayRef} className="flex items-center gap-2 bg-cyan-500/20 border border-cyan-500 text-cyan-400 hover:bg-cyan-500/40 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] px-4 py-2 rounded-md font-medium transition-all">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> Play
                    </button>
                    <button ref={btnPauseRef} style={{ display: 'none' }} className="flex items-center gap-2 bg-white/10 border border-white/20 text-white hover:bg-white/20 px-4 py-2 rounded-md font-medium transition-all">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> Pause
                    </button>
                    <button ref={btnRestartRef} className="bg-white/10 border border-white/20 text-white hover:bg-white/20 p-2 rounded-md transition-all">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>
                    </button>
                    
                    <select ref={speedSelectRef} className="bg-white/10 border border-white/20 text-white px-3 py-2 rounded-md font-medium outline-none cursor-pointer appearance-none ml-2">
                        <option value="0.5" className="bg-[#050a1f]">0.5x</option>
                        <option value="1" className="bg-[#050a1f]" selected>1.0x</option>
                        <option value="2" className="bg-[#050a1f]">2.0x</option>
                        <option value="5" className="bg-[#050a1f]">5.0x</option>
                    </select>

                    <div className="w-px h-6 bg-white/20 mx-2"></div>
                    
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-white">Chase Cam</span>
                        <label className="relative inline-block w-11 h-6 cursor-pointer">
                            <input ref={camToggleRef} type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-white/20 rounded-full peer peer-checked:bg-cyan-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                        </label>
                    </div>
                </div>

            </div>
        </div>
    );
}
