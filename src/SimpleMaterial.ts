/* Lecture 22
 * CSCI 4611, Spring 2023, University of Minnesota
 * Instructor: Evan Suma Rosenberg <suma@umn.edu>
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 */ 

// The is identical to the UnlitMaterial in GopherGfx.

// @ts-ignore
import unlitVertexShader from './shaders/simple.vert'
// @ts-ignore
import unlitFragmentShader from './shaders/simple.frag'

import * as gfx from 'gophergfx'

export class SimpleMaterial extends gfx.Material3
{
    public texture: gfx.Texture | null;
    public color: gfx.Color;

    public static shader = new gfx.ShaderProgram(unlitVertexShader, unlitFragmentShader);
    
    private modelViewUniform: WebGLUniformLocation | null;
    private projectionUniform: WebGLUniformLocation | null;

    private colorUniform: WebGLUniformLocation | null;

    private positionAttribute: number;

    private textureUniform: WebGLUniformLocation | null;
    private useTextureUniform: WebGLUniformLocation | null;

    private texCoordAttribute: number;
    private colorAttribute: number;

    constructor()
    {
        super();

        this.texture = null;
        this.color = new gfx.Color(1, 1, 1);

        SimpleMaterial.shader.initialize(this.gl);

        this.modelViewUniform = SimpleMaterial.shader.getUniform(this.gl, 'modelViewMatrix');
        this.projectionUniform = SimpleMaterial.shader.getUniform(this.gl, 'projectionMatrix');

        this.colorUniform = SimpleMaterial.shader.getUniform(this.gl, 'materialColor');
        this.textureUniform = SimpleMaterial.shader.getUniform(this.gl, 'textureImage');
        this.useTextureUniform = SimpleMaterial.shader.getUniform(this.gl, 'useTexture');

        this.positionAttribute = SimpleMaterial.shader.getAttribute(this.gl, 'position');
        this.texCoordAttribute = SimpleMaterial.shader.getAttribute(this.gl, 'texCoord'); 
        this.colorAttribute = SimpleMaterial.shader.getAttribute(this.gl, 'color');
    }

    draw(mesh: gfx.Mesh, transform: gfx.Transform3, camera: gfx.Camera, lightManager: gfx.LightManager): void
    {
        if(!this.visible || mesh.triangleCount == 0)
            return;

        this.initialize();

        // Switch to this shader
        this.gl.useProgram(SimpleMaterial.shader.getProgram());

        // Set the camera uniforms
        this.gl.uniformMatrix4fv(this.modelViewUniform, false, gfx.Matrix4.multiply(transform.worldMatrix, camera.viewMatrix).mat);
        this.gl.uniformMatrix4fv(this.projectionUniform, false, camera.projectionMatrix.mat);

        // Set the material property uniforms
        this.gl.uniform4f(this.colorUniform, this.color.r, this.color.g, this.color.b, this.color.a);

        // Set the vertex positions
        this.gl.enableVertexAttribArray(this.positionAttribute);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.positionBuffer);
        this.gl.vertexAttribPointer(this.positionAttribute, 3, this.gl.FLOAT, false, 0, 0);

        // Set the vertex colors
        this.gl.enableVertexAttribArray(this.colorAttribute);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.colorBuffer);
        this.gl.vertexAttribPointer(this.colorAttribute, 4, this.gl.FLOAT, false, 0, 0);

        if(this.texture)
        {
            // Activate the texture in the shader
            this.gl.uniform1i(this.useTextureUniform, 1);

            // Set the texture
            this.gl.activeTexture(this.gl.TEXTURE0 + this.texture.id)
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture.texture);
            this.gl.uniform1i(this.textureUniform, this.texture.id);

            // Set the texture coordinates
            this.gl.enableVertexAttribArray(this.texCoordAttribute);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.texCoordBuffer);
            this.gl.vertexAttribPointer(this.texCoordAttribute, 2, this.gl.FLOAT, false, 0, 0);
        }
        else
        {
            // Disable the texture in the shader
            this.gl.uniform1i(this.useTextureUniform, 0);
            this.gl.disableVertexAttribArray(this.texCoordAttribute);
        }

        // Draw the triangles
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
        this.gl.drawElements(this.gl.TRIANGLES, mesh.triangleCount*3, this.gl.UNSIGNED_SHORT, 0);
    }

    setColor(color: gfx.Color): void
    {
        this.color.copy(color);
    }

    getColor(): gfx.Color
    {
        return this.color;
    }
}