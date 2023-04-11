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
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 normalMatrix;

// The inputs are the data for this vertex in a GPU memory buffer.
in vec3 position;
in vec3 normal;
in vec4 color;
in vec2 texCoord;

// The outputs are the data that will be interpolated by the rasterizer and then
// passed as inputs to the fragment shader.
out vec3 worldPosition;
out vec3 worldNormal;
out vec4 vertColor;
out vec2 uv;

void main()
{
    // This line of code computes the vertex position in world coordinates.
    // We will need it to compute the L vector in the lighting equation.
    // Because position is a vec3, we have to convert to a vec4 before it
    // can be multipled by the model matrix. Recall that points in homogenous
    // coordinates are represented as (X,Y,Z,1). We then use "swizzling" to 
    // extract just the XYZ components of the final vector.
    worldPosition = (modelMatrix * vec4(position, 1)).xyz;

    // This line of code computes the vertex normal in world coordinates.
    // This vector is the N in the lighting equation. We also need to
    // convert to a vec4 before it can be multipled by the normal matrix. 
    // However, note that vectors are represented differently in homogenous 
    // coordinates as (X,Y,Z,0). We then use "swizzling" to extract just
    // the XYZ components of the final vector.
    worldNormal = (normalMatrix * vec4(normal, 0)).xyz;

    // Because the vertex color and texture coordinates are computed for each pixel,
    // we don't do anything here.  We just pass them along to the fragment shader.
    vertColor = color;
    uv = texCoord;

    // A vertex shader must assign a value to gl_Position.
    gl_Position = projectionMatrix * viewMatrix * vec4(worldPosition, 1);
}