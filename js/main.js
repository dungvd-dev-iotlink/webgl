var texture;
function webGLStart() 
{
	var currentlyPressedKeys = new Int8Array(1000);
    var canvas = document.getElementById("canvas");
    initGL(canvas);
    initShaders();
    initBuffers();
	texture = loadTexture(gl, "https://webglfundamentals.org/webgl/resources/f-texture.png");
	
	// Key events
	document.onkeydown = handleKeyDown;
	document.onkeyup = handleKeyUp;
	function handleKeyDown(event) {
		currentlyPressedKeys[event.keyCode] = true;
		handleKeys(currentlyPressedKeys);
	}
	
	function handleKeyUp(event) {
		currentlyPressedKeys[event.keyCode] = false;
	}
	// End key events
	
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


function loadTexture(gl, url) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Because images have to be download over the internet
  // they might take a moment until they are ready.
  // Until then put a single pixel in the texture so we can
  // use it immediately. When the image has finished downloading
  // we'll update the texture with the contents of the image.
  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                width, height, border, srcFormat, srcType,
                pixel);

  const image = new Image();
  image.crossOrigin = "anonymous";
  image.onload = function() {
	  
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  srcFormat, srcType, image);
	// WebGL1 has different requirements for power of 2 images
	// vs non power of 2 images so check if the image is a
	// power of 2 in both dimensions.
		if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
			// Yes, it's a power of 2. Generate mips.
			gl.generateMipmap(gl.TEXTURE_2D);
		} else {
		   // No, it's not a power of 2. Turn of mips and set
		   // wrapping to clamp to edge
		   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		}
	};
	image.src = url;
	return texture;	
}

function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}
function initBuffers()
{
    var vertices =  new Float32Array([
		// position       // color				// texcoord
        -0.5,  0.5, 0.0, 	1.0, 1.0, 	0.0, 	0.0, 0.0,
        0.5,  0.5, 0.0, 	1.0, 0.0,  0.0,  	1.0, 0.0,
        -0.5, -0.5, 0.0, 	0.0, 1.0, 	0.0, 	0.0, 1.0,
        0.5, -0.5, 0.0 , 	0.0, 0.0, 1.0, 		1.0, 1.0
    ]);
    triangleVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    triangleVertexPositionBuffer.itemSize = 8;
    triangleVertexPositionBuffer.numItems = 4;
}

function drawScene()
{
    gl.useProgram(shaderProgram);
    var location = gl.getAttribLocation(shaderProgram, "a_position");
    var color = gl.getAttribLocation(shaderProgram, "a_color");
	var texcoord = gl.getAttribLocation(shaderProgram, "a_texcoord");
    gl.enableVertexAttribArray(location);
    gl.enableVertexAttribArray(color);
    gl.enableVertexAttribArray(texcoord);
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
    gl.vertexAttribPointer(location, 3, gl.FLOAT, false, 32, 0);
    gl.vertexAttribPointer(color, 3, gl.FLOAT, false, 32, 12);
    gl.vertexAttribPointer(texcoord, 2, gl.FLOAT, false, 32, 24);
	
	gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
	var textureLocation = gl.getUniformLocation(shaderProgram, "uSampler");
	gl.uniform1i(textureLocation, 0);
	
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, triangleVertexPositionBuffer.numItems);
	requestAnimationFrame(drawScene);
}

function handleKeys(currentlyPressedKeys) {
	if (currentlyPressedKeys[33]) {
		// Page Up
	}
	if (currentlyPressedKeys[34]) {
		// Page Down
	}
	if (currentlyPressedKeys[37]) {
		// Left cursor key
		console.log("#------------------ Bam phim Left");
	}
	if (currentlyPressedKeys[39]) {
		// Right cursor key
		console.log("#------------------ Bam phim Right");
	}
	if (currentlyPressedKeys[38]) {
		// Up cursor key
		console.log("#------------------ Bam phim Up");
	}
	if (currentlyPressedKeys[40]) {
		// Down cursor key
		console.log("#------------------ Bam phim Down");
	}
}