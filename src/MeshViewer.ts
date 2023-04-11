/* Lecture 22
 * CSCI 4611, Spring 2023, University of Minnesota
 * Instructor: Evan Suma Rosenberg <suma@umn.edu>
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 */ 

import * as gfx from 'gophergfx'
import { GUI } from 'dat.gui'
import { SimpleMaterial } from './SimpleMaterial';
import { PerVertexMaterial } from './PerVertexMaterial';
import { PerPixelMaterial } from './PerPixelMaterial';

export class MeshViewer extends gfx.GfxApp
{
    private cameraControls: gfx.OrbitControls;
    private renderStyle: string;
    private model: string;
    private texture: string;
    private lightType: string;

    private models: gfx.Mesh[];

    private gouradMaterial: PerVertexMaterial;
    private phongMaterial: PerPixelMaterial;
    private unlitMaterial: SimpleMaterial;

    private gravelTexture: gfx.Texture;
    private barkTexture: gfx.Texture;
    private glassTexture: gfx.Texture;

    private pointLight: gfx.PointLight;
    private directionalLight: gfx.DirectionalLight;

    constructor()
    {
        // Enable the stencil buffer
        super(true);

        this.cameraControls = new gfx.OrbitControls(this.camera);

        this.renderStyle = 'Unlit';
        this.model = 'bunny.obj';
        this.texture = 'None';
        this.lightType = 'Point Light';
        
        this.models = [];

        this.gouradMaterial = new PerVertexMaterial();
        this.phongMaterial = new PerPixelMaterial();
        this.unlitMaterial = new SimpleMaterial();

        this.gravelTexture = new gfx.Texture('./assets/textures/Gravel_001_BaseColor.jpg');
        this.barkTexture = new gfx.Texture('./assets/textures/Bark_007_BaseColor.jpg');
        this.glassTexture = new gfx.Texture('./assets/textures/Glass_Stained_001_basecolor.jpg');

        this.pointLight = new gfx.PointLight(gfx.Color.WHITE);
        this.directionalLight = new gfx.DirectionalLight(gfx.Color.WHITE);

        this.createGUI();
    }

    createGUI(): void
    {
        // Create the GUI
        const gui = new GUI();
        gui.width = 200;

        const renderControls = gui.addFolder('Shading Model');
        renderControls.open();

        const renderStyleController = renderControls.add(this, 'renderStyle', [
            'Unlit',
            'Gouraud', 
            'Phong'
        ]);
        renderStyleController.name('');
        renderStyleController.onChange(()=>{this.changeRenderStyle()});

        const modelControls = gui.addFolder('Model');
        modelControls.open();

        const modelController = modelControls.add(this, 'model', [
            'bunny.obj', 
            'cow.obj',
            'cube.obj', 
            'head.obj',
            'hippo.obj',
            'sphere.obj',
            'teapot.obj'
        ]);
        modelController.name('');
        modelController.onChange(()=>{this.changeModel()});     

        const textureControls = gui.addFolder('Texture');
        textureControls.open();

        const textureController = textureControls.add(this, 'texture', [
            'None',
            'Gravel',
            'Bark',
            'Stained Glass'
        ]);
        textureController.name('');
        textureController.onChange(()=>{this.changeTexture()});  

        const lightControls = gui.addFolder('Light');
        lightControls.open();

        const lightController = lightControls.add(this, 'lightType', [
            'Point Light',
            'Directional Light',
            'Ambient Only'
        ]);
        lightController.name('');
        lightController.onChange(()=>{this.changeLight()});
    }

    createScene(): void 
    {
        // Setup camera
        this.renderer.viewport = gfx.Viewport.CROP;
        this.camera.setPerspectiveCamera(60, 1920/1080, 0.1, 10);
        this.cameraControls.setDistance(2);
        this.cameraControls.zoomSpeed = 0.1;
        this.cameraControls.setOrbit(-30 * Math.PI / 180, 15 * Math.PI / 180);

        this.renderer.background.set(0.7, 0.7, 0.7);
        
        // Create an ambient light
        const ambientLight = new gfx.AmbientLight(new gfx.Vector3(0.2, 0.2, 0.2));
        this.scene.add(ambientLight);

        this.pointLight.position.set(.75, 1.1, 1);
        this.scene.add(this.pointLight);

        this.directionalLight.position.set(.75, 1.1, 1)
        this.directionalLight.visible = false;
        this.scene.add(this.directionalLight);

        const lightSphere = new gfx.SphereMesh();
        lightSphere.scale.set(0.05, 0.05, 0.05);
        lightSphere.position.set(.75, 1.1, 1);
        this.scene.add(lightSphere);

        const lightSphereMaterial = new gfx.UnlitMaterial();
        lightSphereMaterial.color.set(1, 1, 0);
        lightSphere.material = lightSphereMaterial;

        // Set the initial material colors and texture
        this.changeTexture();

        this.models.push(gfx.ObjLoader.load('./assets/models/bunny.obj'));
        this.models.push(gfx.ObjLoader.load('./assets/models/cow.obj'));
        this.models.push(gfx.ObjLoader.load('./assets/models/cube.obj'));
        this.models.push(gfx.ObjLoader.load('./assets/models/head.obj'));
        this.models.push(gfx.ObjLoader.load('./assets/models/hippo.obj'));
        this.models.push(gfx.ObjLoader.load('./assets/models/sphere.obj'));
        this.models.push(gfx.ObjLoader.load('./assets/models/teapot.obj'));

        this.models.forEach((model: gfx.Mesh) => {
            model.material = this.unlitMaterial;
            model.visible = false;
            this.scene.add(model);
        });

        this.models[0].visible = true;
    }
    update(deltaTime: number): void 
    {
        // Nothing to implement here for this assignment
        this.cameraControls.update(deltaTime);
    }

    private changeRenderStyle(): void
    {
       if(this.renderStyle == 'Gouraud')
       {
            this.models.forEach((model: gfx.Mesh) => {
                model.material = this.gouradMaterial;
            });
       }
       else if(this.renderStyle == 'Phong')
       {
            this.models.forEach((model: gfx.Mesh) => {
                model.material = this.phongMaterial;
            });
       }
       else if(this.renderStyle == 'Unlit')
       {
            this.models.forEach((model: gfx.Mesh) => {
                model.material = this.unlitMaterial;
            });
       }
    }

    private changeModel(): void
    {
        if(this.model == 'bunny.obj')
        {
            this.models.forEach((model: gfx.Mesh) => {
                model.visible = false;
            });
            this.models[0].visible = true;
            this.setMaterialSide(gfx.Side.FRONT);
        }
        else if(this.model == 'cow.obj')
        {
            this.models.forEach((model: gfx.Mesh) => {
                model.visible = false;
            });
            this.models[1].visible = true;
            this.setMaterialSide(gfx.Side.FRONT);
        }
        else if(this.model == 'cube.obj')
        {
            this.models.forEach((model: gfx.Mesh) => {
                model.visible = false;
            });
            this.models[2].visible = true;
            this.setMaterialSide(gfx.Side.FRONT);
        }
        else if(this.model == 'head.obj')
        {
            this.models.forEach((model: gfx.Mesh) => {
                model.visible = false;
            });
            this.models[3].visible = true;
            this.setMaterialSide(gfx.Side.FRONT);
        }
        else if(this.model == 'hippo.obj')
        {
            this.models.forEach((model: gfx.Mesh) => {
                model.visible = false;
            });
            this.models[4].visible = true;
            this.setMaterialSide(gfx.Side.FRONT);
        }
        else if(this.model == 'sphere.obj')
        {
            this.models.forEach((model: gfx.Mesh) => {
                model.visible = false;
            });
            this.models[5].visible = true;
            this.setMaterialSide(gfx.Side.FRONT);
        }
        else if(this.model == 'teapot.obj')
        {
            this.models.forEach((model: gfx.Mesh) => {
                model.visible = false;
            });
            this.models[6].visible = true;
            this.setMaterialSide(gfx.Side.DOUBLE);
        }
    }

    private changeTexture(): void
    {
        if(this.texture == 'None')
        {
            this.gouradMaterial.ambientColor.set(1, 0.4, 0.4);
            this.gouradMaterial.diffuseColor.set(1, 0.4, 0.4);
            this.gouradMaterial.specularColor.set(1, 1, 1);
            this.gouradMaterial.shininess = 50;
            this.gouradMaterial.texture = null;

            this.phongMaterial.ambientColor.set(1, 0.4, 0.4);
            this.phongMaterial.diffuseColor.set(1, 0.4, 0.4);
            this.phongMaterial.specularColor.set(1, 1, 1);
            this.phongMaterial.shininess = 50;
            this.phongMaterial.texture = null;

            this.unlitMaterial.color.set(1, 0.4, 0.4);
            this.unlitMaterial.texture = null;
        }
        else if(this.texture == 'Gravel')
        {
            this.gouradMaterial.ambientColor.set(1, 1, 1);
            this.gouradMaterial.diffuseColor.set(1, 1, 1);
            this.gouradMaterial.specularColor.set(1, 1, 1);
            this.gouradMaterial.shininess = 50;
            this.gouradMaterial.texture = this.gravelTexture;

            this.phongMaterial.ambientColor.set(1, 1, 1);
            this.phongMaterial.diffuseColor.set(1, 1, 1);
            this.phongMaterial.specularColor.set(1, 1, 1);
            this.phongMaterial.shininess = 50;
            this.phongMaterial.texture = this.gravelTexture;

            this.unlitMaterial.color.set(1, 1, 1);
            this.unlitMaterial.texture = this.gravelTexture;
        }
        else if(this.texture == 'Bark')
        {
            this.gouradMaterial.ambientColor.set(1, 1, 1);
            this.gouradMaterial.diffuseColor.set(1, 1, 1);
            this.gouradMaterial.specularColor.set(0.5, 0.5, 0.5);
            this.gouradMaterial.shininess = 10;
            this.gouradMaterial.texture = this.barkTexture;

            this.phongMaterial.ambientColor.set(1, 1, 1);
            this.phongMaterial.diffuseColor.set(1, 1, 1);
            this.phongMaterial.specularColor.set(0.5, 0.5, 0.5);
            this.phongMaterial.shininess = 10;
            this.phongMaterial.texture = this.barkTexture;

            this.unlitMaterial.color.set(1, 1, 1);
            this.unlitMaterial.texture = this.barkTexture;
        }
        else if(this.texture == 'Stained Glass')
        {
            this.gouradMaterial.ambientColor.set(1, 1, 1);
            this.gouradMaterial.diffuseColor.set(1, 1, 1);
            this.gouradMaterial.specularColor.set(1, 1, 1);
            this.gouradMaterial.shininess = 50;
            this.gouradMaterial.texture = this.glassTexture;

            this.phongMaterial.ambientColor.set(1, 1, 1);
            this.phongMaterial.diffuseColor.set(1, 1, 1);
            this.phongMaterial.specularColor.set(1, 1, 1);
            this.phongMaterial.shininess = 50;
            this.phongMaterial.texture = this.glassTexture;

            this.unlitMaterial.color.set(1, 1, 1);
            this.unlitMaterial.texture = this.glassTexture;
        }
    }

    private setMaterialSide(side: gfx.Side): void
    {
        this.gouradMaterial.side = side;
        this.phongMaterial.side = side;
        this.unlitMaterial.side = side;
    }

    private changeLight(): void
    {
        if(this.lightType == 'Point Light')
        {
            this.pointLight.visible = true;
            this.directionalLight.visible = false;
        }
        else if(this.lightType == 'Directional Light')
        {
            this.pointLight.visible = false;
            this.directionalLight.visible = true;
        }
        else
        {
            this.pointLight.visible = false;
            this.directionalLight.visible = false;
        }
    }
}