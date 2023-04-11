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

// These are the material reflection co-efficients (the Ks in the lighting equation)
uniform vec3 kAmbient;
uniform vec3 kDiffuse;
uniform vec3 kSpecular;

// The specular component in the lighting equation requires a shininess coefficent (s)
// and the eye position in world space, which will be used to compute the vector E.
uniform float shininess;
uniform vec3 eyePosition;

// Information about the lights in the scene are passed to the shader in an array.
// The light intensities are the Is in the lighting equation.
const int MAX_LIGHTS = 8;
uniform int numLights;
uniform vec3 ambientIntensities[MAX_LIGHTS];
uniform vec3 diffuseIntensities[MAX_LIGHTS];
uniform vec3 specularIntensities[MAX_LIGHTS];

// The light positions are defined in world space.
uniform vec3 lightPositions[MAX_LIGHTS];

// This shader supports point and directional lights.  The only difference between
// them is the computation of the L vector in the lighting equation.
#define POINT_LIGHT 0
#define DIRECTIONAL_LIGHT 1
uniform int lightTypes[MAX_LIGHTS];

// The inputs are the data for this vertex in a GPU memory buffer.
in vec3 position;
in vec3 normal;
in vec4 color;
in vec2 texCoord;

// The outputs are the data that will be interpolated by the rasterizer and then
// passed as inputs to the fragment shader.
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
    vec3 worldPosition = (modelMatrix * vec4(position, 1)).xyz;

    // This line of code computes the vertex normal in world coordinates.
    // This vector is the N in the lighting equation. We also need to
    // convert to a vec4 before it can be multipled by the normal matrix. 
    // However, note that vectors are represented differently in homogenous 
    // coordinates as (X,Y,Z,0). We then use "swizzling" to extract just
    // the XYZ components of the final vector.
    vec3 worldNormal = (normalMatrix * vec4(normal, 0)).xyz;

    // Make sure to normalize any normals before using them in the lighting
    // equation.  Otherwise, the illumination may have an incorrect scale factor.
    worldNormal = normalize(worldNormal);

    // This variable will be an accumulator for all the light components computed
    // in the lighting equation for all of the lights in the scene.  We start
    // by initializing it to a vec3 of zeros.
    vec3 illumination = vec3(0, 0, 0);

    // We need to loop through every light in the scene and compute the contribution
    // of each one according to the lighting equation.
    for(int i=0; i < numLights; i++)
    {
        // Compute the ambient component: Ka * Ia
        illumination += kAmbient * ambientIntensities[i];

        // Compute the L vector in the lighting equation. 
        vec3 l;
        if(lightTypes[i] == DIRECTIONAL_LIGHT)
        {
            // If it is a direction light, then the light position passed into the shader is the 
            // direction to the light in world space. We just need to normalize it.
            l = normalize(lightPositions[i]);
        }
        else
        {
            // If it is a point light, then we need to compute the vector from the interpolated
            // position to the light position in world space, then normalize it.
            l = normalize(lightPositions[i] - worldPosition);
        }

        // Compute the value of N dot L.  The max function clamps the value above zero.
        // This is necessary because any lights with a dot product of zero will be behind
        // the surface, and will therefore not contribute any light.  Note that this function
        // expects a floating point value, and it causes an error if you don't use the decimal
        // place because GLSL can't implicitly typecast the integer 0 to a float.
        float ndotl = max(dot(worldNormal, l), 0.0);

        // Compute the diffuse component: Kd * Id * (N dot L)
        illumination += ndotl * kDiffuse * diffuseIntensities[i];

        // Compute the vector from the vertex position to the eye position in world space.
        // This is the vector E in the lighting equation.  Don't forget to normalize it!
        vec3 e = normalize(eyePosition - worldPosition);

        // Compute the light vector reflected about the normal.  We don't need to normalize
        // it again because reflection does not change the length of the vector.
        vec3 r = reflect(l, worldNormal);

        // Compute the value of E dot R and clamp it above zero, as explained above.
        float edotr = max(dot(e, -r), 0.0);

        // Compute the specular component: Ks * Is * (E dot R)^s
        illumination += pow(edotr, shininess) * kSpecular * specularIntensities[i];
    }

    // Because the vertex color and texture coordinates are computed for each pixel,
    // we don't do anything here.  We just pass them along to the fragment shader.
    vertColor = color * vec4(illumination, 1);
    uv = texCoord;

    // A vertex shader must assign a value to gl_Position.
    gl_Position = projectionMatrix * viewMatrix * vec4(worldPosition, 1);
}