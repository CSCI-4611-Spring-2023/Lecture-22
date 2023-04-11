#version 300 es

precision mediump float;

/* Lecture 22
 * CSCI 4611, Spring 2023, University of Minnesota
 * Instructor: Evan Suma Rosenberg <suma@umn.edu>
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 */ 

// The shader will be identical to the Phong shader in GopherGfx.

// A fragment shader can only have one output, which is the color of the pixel.
out vec4 fragColor;

void main()
{
    fragColor = vec4(0, 0, 0, 1);
}