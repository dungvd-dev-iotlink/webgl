function webGLStart() 
{
    var canvas = document.getElementById("canvas");
    initGL(canvas);
    initShaders();
    initBuffers();
    drawScene();
}

function initGL(cv)
{
    // first, try standard WebGL context
    gl = cv.getContext("webgl");
    if (!gl)
    {
        // if failed, try experimental one
        gl = cv.getContext("experimental-webgl");
        if (!gl)
        {
            alert("Your browser does not support WebGL");
            return;
        }
    }
    gl.viewportWidth  = cv.width;
    gl.viewportHeight = cv.height;
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clearColor(0.1, 0.1, 0.2, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

function getShader(id)
{
    var shaderScript = document.getElementById(id);
    if (!shaderScript)
    {
        return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment")
    {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}
function initShaders()
{

    var fragmentShader = getShader( "fshader");
    var vertexShader = getShader( "vshader");
    shaderProgram = gl.createProgram();

    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
    {
        alert("Could not initialise shaders");
    }
}

function initBuffers()
{
    var vertices =  new Float32Array([
        0.0,  0.5,  0.0, 1.0, 0.0, 0.0,
        -0.5, -0.5,  0.0, 0.0, 1.0, 0.0,
        0.5, -0.5,  0.0 , 0.0, 0.0, 1.0
    ]);
    triangleVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    triangleVertexPositionBuffer.itemSize = 6;
    triangleVertexPositionBuffer.numItems = 3;
}

function drawScene()
{
    gl.useProgram(shaderProgram);
    var location = gl.getAttribLocation(shaderProgram, "a_position");
    var color = gl.getAttribLocation(shaderProgram, "a_color");
    gl.enableVertexAttribArray(location);
    gl.enableVertexAttribArray(color);
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
    gl.vertexAttribPointer(location, 3, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(color, 3, gl.FLOAT, false, 24, 12);
    gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);
}
