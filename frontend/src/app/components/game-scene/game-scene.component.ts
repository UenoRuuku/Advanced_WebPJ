import {Component, OnInit, AfterViewInit, ViewChild} from '@angular/core';
import {Stats} from 'stats.js'
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader"
import {MMDLoader} from "three/examples/jsm/loaders/MMDLoader"
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {
    MeshPhongMaterial,
    TorusGeometry,
    Group,
    MeshLambertMaterial,
    Euler,
    Raycaster,
    Vector3,
    Vector2,
    Clock,
    AnimationMixer,
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    GridHelper,
    PlaneBufferGeometry,
    BoxGeometry,
    MeshBasicMaterial,
    Mesh,
    TextureLoader,
    DoubleSide,
    AmbientLight
} from 'three';
import {WebsocketService} from "../../service/websocket.service";
import {HanoiService} from "../../service/chat.service";
import {Router} from "@angular/router";


class hanoi {
    num: any;
    No: any;
    name: string;

    constructor(a, b, c) {
        this.num = a;
        this.No = b;
        this.name = c;
    }
}

class Player {
    username: string;
    posX: number;
    posY: number;

    constructor(username, posX, posY) {
        this.username = username;
        this.posX = posX;
        this.posY = posY;
    }
}

@Component({
    selector: 'app-game-scene',
    templateUrl: './game-scene.component.html',
    styleUrls: ['./game-scene.component.css'],
    providers: [WebsocketService, HanoiService]
})
export class GameSceneComponent implements OnInit {
    showChatCard: boolean = false;

    private scene: Scene;
    private camera: PerspectiveCamera;
    private renderer: WebGLRenderer;
    // private stats: Stats
    private gltfLoader: GLTFLoader;
    private mmdLoader: MMDLoader;
    private animationMixer: AnimationMixer;
    private clock: Clock;
    private mainCharacter: any;
    private target: Vector3;
    private stepLen: any;
    private geometry: BoxGeometry;
    private TorusGeometry: TorusGeometry
    private cube: Mesh;
    private cube2: Mesh;
    private cube3: Mesh;
    private matarial: MeshLambertMaterial
    private newMaterial: MeshPhongMaterial
    private dizuo: Group
    private roll: Mesh
    private roll2: Mesh
    private roll3: Mesh
    private roll4: Mesh
    private totalFlag: any
    private isMoving: any
    private hanoi: any[]
    private movingBlock: any
    private id: number
    private playerList: any[]
    @ViewChild('mapGL') mapGL: any;

    constructor(private hanoiService: HanoiService) {
        hanoiService.messages.subscribe((msg) => {

            console.log(msg)
            switch (msg.type) {
                case 1: {
                    if (localStorage.getItem("username") != msg.username) {
                        if (this.playerList.length > 0) {
                            for (let i of this.playerList) {
                                if (i.username == msg.username) {
                                    i.posX = msg.posX;
                                    i.posY = msg.posY;
                                    return;
                                }
                            }
                        }
                        this.playerList.push(new Player(msg.username, msg.posX, msg.posY));
                        this.mmdLoader.load('assets/???/?????????.pmx', mmd => {
                            this.scene.add(mmd)
                            mmd.traverse(function (child) {
                                child.name = msg.username;
                            });
                        })
                    }
                    break;
                }
                case 2: {
                    // console.log("case 2")
                    if (msg.username != localStorage.getItem("username")) {
                        this.totalFlag = true;
                        this.isMoving = true;
                        this.movingBlock = this.scene.getObjectByName(String.fromCharCode(101 - msg.plane))
                        // console.log(String.fromCharCode(101 - msg.plane))
                        this.scene.getObjectByName(String.fromCharCode(101 - msg.plane)).material = this.matarial;
                    }
                    break;
                }
                case 3: {
                    this.isMoving = false;
                    this.movingBlock = this.scene.getObjectByName(String.fromCharCode(101 - msg.plane))
                    this.MoveObj(msg.pillar);
                    this.scene.getObjectByName(String.fromCharCode(101 - msg.plane)).material = this.newMaterial;
                }

            }
        })

        this.init()
        this.init_model()
        this.init_keyBoard()
        this.render();
    }

    private init() {
        this.totalFlag = true;
        this.isMoving = false;
        this.scene = new Scene();
        this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new WebGLRenderer({antialias: true});
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.gltfLoader = new GLTFLoader();
        this.mmdLoader = new MMDLoader();
        // document.body.appendChild(this.renderer.domElement);
        window.addEventListener('resize', () => this.onWindowResize());
        this.camera.position.set(0, 25, 25);
        this.clock = new Clock()
        this.animationMixer = new AnimationMixer(this.scene)
        // this.stats = new Stats();
        // this.stats.showPanel(0);
        // window.document.body.appendChild(this.stats.dom);
        this.id = -1;
        new OrbitControls(this.camera, this.renderer.domElement);
        this.scene.add(new AmbientLight(0xFFFFFF, 0.5))
        const planeBufferGeometry = new PlaneBufferGeometry(100, 100);
        const plane = new Mesh(planeBufferGeometry, new MeshBasicMaterial({color: 0xFFFFFF, side: DoubleSide}));
        plane.rotation.x = Math.PI / 2;
        plane.name = "plane"
        this.stepLen = 0.2
        this.scene.add(plane);
        this.scene.add(new GridHelper(100, 100));

        this.geometry = new BoxGeometry(6, 4, 6);
        this.matarial = new MeshLambertMaterial({color: 'red'});
        this.newMaterial = new MeshPhongMaterial({
            color: 0xfffff0,
            specular: 0x444444,//?????????????????????
            shininess: 20,//??????????????????????????????30
        });
        this.playerList = [];
        //?????????????????????????????????????????????????????????????????????????????????????????????????????????
        this.cube = new Mesh(this.geometry, this.matarial);
        this.cube.name = "Fore"
        this.cube2 = new Mesh(this.geometry, this.matarial);
        this.cube2.name = "Start"
        this.cube3 = new Mesh(this.geometry, this.matarial);
        this.cube3.name = "Later"
        this.cube.translateZ(20)
        this.cube3.translateZ(-20)
        this.scene.add(this.cube);
        this.scene.add(this.cube2);
        this.scene.add(this.cube3);
        //????????????????????????????????????????????????????????????????????????????????????
        this.TorusGeometry = new TorusGeometry(5, 1, 25, 80)
        this.roll = new Mesh(this.TorusGeometry, this.newMaterial)
        this.roll.rotateX(Math.PI / 2)
        this.roll.translateZ(-5)
        this.roll.name = "a"
        this.scene.add(this.roll)
        this.TorusGeometry = new TorusGeometry(4, 0.75, 25, 80)
        this.roll2 = new Mesh(this.TorusGeometry, this.newMaterial)
        this.roll2.rotateX(Math.PI / 2)
        this.roll2.translateZ(-8)
        this.roll2.name = "b"
        this.scene.add(this.roll2)
        this.TorusGeometry = new TorusGeometry(3, 0.5, 25, 80)
        this.roll3 = new Mesh(this.TorusGeometry, this.newMaterial)
        this.roll3.rotateX(Math.PI / 2)
        this.roll3.translateZ(-11)
        this.roll3.name = "c"
        this.scene.add(this.roll3)
        this.TorusGeometry = new TorusGeometry(2, 0.5, 25, 80)
        this.roll4 = new Mesh(this.TorusGeometry, this.newMaterial)
        this.roll4.rotateX(Math.PI / 2)
        this.roll4.translateZ(-14)
        this.roll4.name = "d"
        this.scene.add(this.roll4)

        this.hanoi = []
        this.hanoi.push(new hanoi(2, 4, "a"));
        this.hanoi.push(new hanoi(2, 3, "b"));
        this.hanoi.push(new hanoi(2, 2, "c"));
        this.hanoi.push(new hanoi(2, 1, "d"));
    }

    private init_model() {
        this.gltfLoader.load('assets/scene.gltf', gltf => {
            this.scene.add(gltf.scene)
            this.target = gltf.position
            gltf.scene.traverse(function (child) {
                child.name = "main";
            });
            gltf.scene.position.set(gltf.scene.position.x, gltf.scene.position.y + 7, gltf.scene.position.z)

        });

        this.mmdLoader.load('assets/??????.pmx', mmd => {
            this.scene.add(mmd)
            mmd.traverse(function (child) {
                child.name = "exit";
            });
            mmd.translateX(30)
        })

    }

    private init_keyBoard() {
        this.renderer.domElement.addEventListener("click", e => {
            const {offsetX, offsetY} = e;
            const x = (offsetX / window.innerWidth) * 2 - 1
            const y = -(offsetY / window.innerHeight) * 2 + 1
            const rayCaster = new Raycaster()
            // rayCaster.setFromCamera(new Vector2(x, y), this.camera)
            // this.scene.getObjectByName("main").position.set(x, y, 0)
            // ??????????????????????????????????????????
            rayCaster.setFromCamera(new Vector2(x, y), this.camera);

            // ??????????????????????????????
            var intersects = rayCaster.intersectObjects(this.scene.children);

            for (var i = 0; i < intersects.length; i++) {
                if (intersects[i].object.name == "plane" && this.totalFlag == true) {
                    this.target = intersects[i].point;
                    // this.scene.getObjectByName("main").position.set(intersects[i].point.x, intersects[i].point.y, intersects[i].point.z);
                }
                if (intersects[i].object.name == "Start" && this.totalFlag) {
                    this.totalFlag = false;
                    // todo: ???????????????????????????????????????

                    console.log("end")
                }
                if (intersects[i].object.name == "exit") {
                    this.totalFlag = true;
                }
                // ??????????????????????????????????????????????????????????????????
                var na = intersects[i].object.name
                if ((na == "a" || na == "b" || na == "c" || na == "d") && !this.totalFlag && !this.isMoving) {
                    if (this.canMove(na)) {
                        this.isMoving = true;
                        intersects[i].object.material = (this.matarial)
                        this.movingBlock = intersects[i]
                        // console.log("case 2")
                        this.hanoiService.messages.next({
                            // username:localStorage.getItem("username"),
                            posX: this.scene.getObjectByName("main").position.x,
                            posY: this.scene.getObjectByName("main").position.z,
                            type: 2,
                            pillar: this.getPillar(na),
                            plane: 101 - na.charCodeAt(0),
                            // id: this.id + 1,
                        })
                        // console.log("case 2")
                    }
                }
                if (!this.totalFlag && this.isMoving && (na == "Start" || na == "Fore" || na == "Later")) {
                    console.log("down!")
                    let ii = 0
                    switch (na) {
                        case "Start":
                            ii = 2
                            break;
                        case "Fore":
                            ii = 1
                            break;
                        case "Later":
                            ii = 3
                            break;
                    }
                    if (this.canDown(ii)) {
                        console.log("down!")
                        this.Move(ii)
                        this.hanoiService.messages.next({
                            // username:localStorage.getItem("username"),
                            posX: this.scene.getObjectByName("main").position.x,
                            posY: this.scene.getObjectByName("main").position.z,
                            type: 3,
                            pillar: ii,
                            plane: 101 - this.movingBlock.object.name.charCodeAt(0),
                            // id: this.id + 1,
                        })
                        this.hanoiService.messages.next({
                            // username:localStorage.getItem("username"),
                            posX: this.scene.getObjectByName("main").position.x,
                            posY: this.scene.getObjectByName("main").position.z,
                            type: 4,
                            pillar: ii,
                            plane: 101 - this.movingBlock.object.name.charCodeAt(0),
                            // id: this.id + 1,
                        })
                        // todo: ?????????????????????????????????
                    }
                }
                console.log(na)
            }

            //????????????
            var temp = new Vector3(this.target.x / Math.abs(this.target.x), 0, this.target.z / Math.abs(this.target.y))
            var er = new Euler(0, 0, 0, "xyz")
            this.scene.getObjectByName("main").rotation.set(er.x, er.y, er.z)
            this.scene.getObjectByName("main").rotateY(temp.angleTo(new Vector3(0, 0, 1)))
            this.renderer.render(this.scene, this.camera);

        })
    }

    private canMove(name) {
        let num = 0
        let No = 0
        for (var i of this.hanoi) {
            if (i.name == name) {
                num = i.num
                No = i.No
            }
        }
        for (var i of this.hanoi) {
            if (i.name != name && i.num == num) {
                if (i.No < No) {
                    return false
                }
            }
        }
        return true
    }

    private getPillar(name) {
        let num = 0
        for (var i of this.hanoi) {
            if (i.name == name) {
                num = i.num
            }
        }
        return num
    }

    private canDown(n) {
        let num = 0
        let No = 0
        let rest = 0
        let least = "0"
        for (let i of this.hanoi) {
            if (i.name == this.movingBlock.object.name) {
                num = i.num
                No = i.No
            }
            if (i.num == n) {
                rest += 1
                if (i.name > least) {
                    least = i.name
                }
            }
        }
        if (least > this.movingBlock.object.name) {
            return false
        }
        return true;
    }

    private Move(n) {
        let num = 0
        let No = 0
        let rest = 0
        let least = 100
        for (let i of this.hanoi) {
            if (i.name == this.movingBlock.object.name) {
                num = i.num
                No = i.No
            }
            if (i.num == n) {
                rest += 1
                if (i.no < least) {
                    least = i.No
                }
            }
        }
        this.movingBlock.object.material = this.newMaterial;
        this.isMoving = false;
        if (n == num) {
            return
        }
        if (4 - No > rest) {
            for (let i = 0; i < (4 - No) - rest; i++) {
                this.movingBlock.object.translateZ(3)
            }
        } else {
            for (let i = 0; i < rest - (4 - No); i++) {
                this.movingBlock.object.translateZ(-3)
            }
        }
        if (n > num) {
            for (let i = 0; i < n - num; i++) {
                this.movingBlock.object.translateY(-20)
            }
        } else if (n < num) {
            for (let i = 0; i < num - n; i++) {
                this.movingBlock.object.translateY(20)
            }
        }
        for (let i of this.hanoi) {
            if (i.name == this.movingBlock.object.name) {
                i.num = n
                i.No = 4 - rest
            }
        }
        console.log(this.hanoi)
    }

    private MoveObj(n) {
        let num = 0
        let No = 0
        let rest = 0
        let least = 100
        for (let i of this.hanoi) {
            if (i.name == this.movingBlock.name) {
                num = i.num
                No = i.No
            }
            if (i.num == n) {
                rest += 1
                if (i.no < least) {
                    least = i.No
                }
            }
        }
        this.movingBlock.material = this.newMaterial;
        this.isMoving = false;
        if (n == num) {
            return
        }
        if (4 - No > rest) {
            for (let i = 0; i < (4 - No) - rest; i++) {
                this.movingBlock.translateZ(3)
            }
        } else {
            for (let i = 0; i < rest - (4 - No); i++) {
                this.movingBlock.translateZ(-3)
            }
        }
        if (n > num) {
            for (let i = 0; i < n - num; i++) {
                this.movingBlock.translateY(-20)
            }
        } else if (n < num) {
            for (let i = 0; i < num - n; i++) {
                this.movingBlock.translateY(20)
            }
        }
        for (let i of this.hanoi) {
            if (i.name == this.movingBlock.name) {
                i.num = n
                i.No = 4 - rest
            }
        }
        console.log(this.hanoi)
    }

    private onWindowResize() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.animationMixer.update(this.clock.getDelta());
        this.camera.updateProjectionMatrix();
    }

    private render() {
        // this.stats.begin();
        window.requestAnimationFrame(() => this.render());
        if (this.scene.getObjectByName("main") != undefined) {
            var cur = this.scene.getObjectByName("main").position;
            var flag = 1
            if (this.target != undefined && this.scene.getObjectByName("main") != undefined) {
                if (Math.abs(cur.x - this.target.x) > this.stepLen) {
                    flag = -Math.abs(cur.x - this.target.x) / (cur.x - this.target.x)
                    this.scene.getObjectByName("main").position.set(cur.x + flag * this.stepLen, cur.y, cur.z)
                }
                if (Math.abs(cur.y - this.target.y - 7) > this.stepLen) {
                    flag = -Math.abs(cur.y - this.target.y) / (cur.y - this.target.y)
                    this.scene.getObjectByName("main").position.set(cur.x, cur.y + flag * this.stepLen, cur.z)
                }
                if (Math.abs(cur.z - this.target.z) > this.stepLen) {
                    flag = -Math.abs(cur.z - this.target.z) / (cur.z - this.target.z)
                    this.scene.getObjectByName("main").position.set(cur.x, cur.y, cur.z + flag * this.stepLen)
                }
            }
        }
        if (this.scene.getObjectByName("main") != undefined) {
            this.hanoiService.messages.next({
                // username:localStorage.getItem("username"),
                posX: this.scene.getObjectByName("main").position.x,
                posY: this.scene.getObjectByName("main").position.z,
                type: 1,
                pillar: 0,
                plane: 0,
                // id: this.id + 1,
            })
        }
        //todo:???????????????????????????
        if (this.playerList != undefined && this.playerList.length > 0) {
            for (let i of this.playerList) {
                let nam = i.username
                let curr = this.scene.getObjectByName(nam).position;
                this.scene.getObjectByName(nam).position.set(i.posX, curr.y, i.posY)
            }
        }
        this.renderer.render(this.scene, this.camera);
        // this.stats.end();
    }

    ngOnInit(): void {
        document.getElementById("a").append((this.renderer.domElement))
    }


}
