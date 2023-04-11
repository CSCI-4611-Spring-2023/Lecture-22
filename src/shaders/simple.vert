#version 300 es

precision mediump float;

/* Lecture 22
 * CSCI 4611, Spring 2023, University of Minnesota
 * Instructor: Evan Suma Rosenberg <suma@umn.edu>
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 */ 

// The shader will be identical to the unlit shader in GopherGfx.

// The uniforms are variables passed in to the shader each frame by the CPU program.
// These are the four matrices needed to convert between coordinate spaces.
// The modelView matrix is a pre-computed combination of the model and view matrices.
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

// The inputs are the data for this vertex in a GPU memory buffer.
in vec3 position;
in vec4 color;
in vec2 texCoord;

// The outputs are the data that will be interpolated by the rasterizer and then
// passed as inputs to the fragment shader.
out vec4 vertColor;
out vec2 uv;

void main()
{
    // Because the vertex color and texture coordinates are computed for each pixel,
    // we don't do anything here.  We just pass them along to the fragment shader.
    vertColor = color;
    uv = texCoord;

    // A vertex shader must assign a value to gl_Position.
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);
}