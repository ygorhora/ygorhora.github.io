var points = []; // vértices do quadrado triangulado
var colors = []; // cores do quadrado triangulado
var viewMatrix; // Matrix de visão (projeção * lookAt)
var rotateMatrix; // Matrix de rotação
var theta; // ângulo de rotação em todos os eixos cartesianos
var axis; // eixo de giro atual
var lookAt = {
	x: 0.0, 
	y: 3.0, 
	z: 10.0, 
}
var drawOrtho = false;
// Linha paralela
var infLines = [
[-1, -0.5, +100],
[-1, -0.5, -100],
[+1, -0.5, +100],
[+1, -0.5, -100]
];
// Cor da linha paralela
var infLinesColors = [
[1.0, 1.0, 1.0, 1.0],
[1.0, 1.0, 1.0, 1.0],
[1.0, 1.0, 1.0, 1.0],
[1.0, 1.0, 1.0, 1.0],
];

function computeCube(){	
  // Cria cubo
  
  //    v5----- v6
  //   /|      /|
  //  v1------v2|
  //  | |     | |
  //  | |v4---|-|v7
  //  |/      |/
  //  v0------v3

	var vPoints = [
        vec3( -0.5, -0.5,  0.5), // v0
        vec3( -0.5,  0.5,  0.5), // v1
        vec3(  0.5,  0.5,  0.5), // v2
        vec3(  0.5, -0.5,  0.5), // v3
        vec3( -0.5, -0.5, -0.5), // v4
        vec3( -0.5,  0.5, -0.5), // v5
        vec3(  0.5,  0.5, -0.5), // v6
        vec3(  0.5, -0.5, -0.5)  // v7
    ];

    var vColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
        [ 0.0, 1.0, 1.0, 1.0 ],  // cyan
        [ 1.0, 1.0, 1.0, 1.0 ]   // white
    ];

 	// triangulando as faces baseando-se nos índices dos vértices
    triangleFaces( 1, 0, 3, 2, vPoints, vColors);
    triangleFaces( 2, 3, 7, 6, vPoints, vColors);
    triangleFaces( 3, 0, 4, 7, vPoints, vColors);
    triangleFaces( 6, 5, 1, 2, vPoints, vColors);
    triangleFaces( 4, 5, 6, 7, vPoints, vColors);
    triangleFaces( 5, 4, 0, 1, vPoints, vColors);
}

function triangleFaces(a, b, c, d, vertices, fColors){
    var indices = [ a, b, c, a, c, d ];

    // triangula uma face
    for ( var i = 0; i < indices.length; ++i ) {
        // atribui a coordenada do vértice
        points.push( vertices[indices[i]] );

        // atribui cor
        colors.push(fColors[a]);

    }
}

window.onload = function main(){

	// Obtém o contexto WebGL
	var canvas = document.getElementById("gl-canvas");
	var gl = WebGLUtils.setupWebGL(canvas);
	if(!gl){
		alert("WebGL isn't available");
	}

	// Mapeando a Viewport
	gl.viewport(0, 0, canvas.width, canvas.height);
	// Cor do contexto "limpo" RGBA
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	// Habilita o teste de profundidade de superfícies
	gl.enable(gl.DEPTH_TEST);

	// Retorna um programa, pronto para ser usado, linkado com o contexto WebGL
	// e que possui o vertex-shader e fragment-shader especificado.
	var program = initShaders(gl, "vertex-shader", "fragment-shader");

	// Utiliza o programa com os shaders definidos
	gl.useProgram(program);
	gl.program = program;

	init(gl);
};

function init(gl){

	// Computa dados geométricos e de cores do cubo
	computeCube();
	// Matrix de visão
  	viewMatrix = new Matrix4();
    // Matrix de rotação
    rotateMatrix = new Matrix4();
    theta = {
    	x: 0.0,
    	y: 1.0,
    	z: 0.0
    };
    axis = "y";

/*******************************************************************************/
    //Evento rotação em torno do eixo
    document.getElementById( "xButton" ).onclick = function () {
        axis = "x";
    };
    document.getElementById( "yButton" ).onclick = function () {
        axis = "y";
    };
    document.getElementById( "zButton" ).onclick = function () {
        axis = "z";
    };

/*******************************************************************************/
    document.getElementById("lookAtX").onchange = function(event) {
        lookAt.x = parseFloat(event.target.value);
    };

    document.getElementById("lookAtY").onchange = function(event) {
        lookAt.y = parseFloat(event.target.value);
    };

    document.getElementById("lookAtZ").onchange = function(event) {
        lookAt.z = parseFloat(event.target.value);
    };

/*******************************************************************************/
    document.getElementById("ortho").onclick = function(event) {
    	if (document.getElementById("ortho").checked) {
            drawOrtho = true;
        } else {
        	drawOrtho = false;
        }
    };
/*******************************************************************************/

    function render(){
		// eyePoints, lookAtPoints, upVector
		if(!drawOrtho){
			viewMatrix.setPerspective(30, 1, 1, 100);
	   		viewMatrix.lookAt(lookAt.x, lookAt.y, lookAt.z, 0, 0, 0, 0, 1, 0);
		} else {
			viewMatrix.setOrtho(-10, 10, -10, 10, -100, 100);
			viewMatrix.lookAt(lookAt.x, lookAt.y, lookAt.z, 0, 0, 0, 0, 1, 0);
		}

	    // Rotação
	    theta[axis] = (theta[axis] + 1.0) % 360;
		rotateMatrix.setRotate(theta.x, 1, 0, 0)
					.rotate(theta.y, 0, 1, 0)
					.rotate(theta.z, 0, 0, 1);

		/***********************************************************************/
		// Cria um buffer de cores;
		// Vincula colors como o buffer onde cada elemento é uma cor para a face 
		// triangulada
		var colorBuf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, colorBuf);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

		// Associa o buffer criado a uma variável do vertex-shader
		var cLocation = gl.getAttribLocation( gl.program, "a_vColor" );
	    gl.vertexAttribPointer( cLocation, 4, gl.FLOAT, false, 0, 0 );
	    gl.enableVertexAttribArray( cLocation );

	    // Cria um buffer de vértices
		// Vincula points como o buffer onde cada elemento é uma cor para a face 
		// triangulada
		var vertBuf = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, vertBuf);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

		// Associa o buffer criado a uma variável do vertex-shader
		var vLocation = gl.getAttribLocation( gl.program, "a_vPosition" );
	    gl.vertexAttribPointer( vLocation, 3, gl.FLOAT, false, 0, 0 );
	    gl.enableVertexAttribArray( vLocation );

	/***************************************************************************/
	    // Seta a matriz de visão
	  	var vmLocation = gl.getUniformLocation(gl.program,'u_viewMatrix');
		gl.uniformMatrix4fv(vmLocation, false, viewMatrix.elements);

		// Seta a matriz de rotação
		var rmLocation = gl.getUniformLocation(gl.program,'u_rotateMatrix');
		gl.uniformMatrix4fv(rmLocation, false, rotateMatrix.elements);

		// Ativa a parte da cena dinamica
		fsLocation = gl.getUniformLocation(gl.program, 'u_fixedScene');
		gl.uniform1i(fsLocation, 0);

	/***************************************************************************/
		// Limpa canvas com a cor definida em gl.clearColor e o buffer de 
		// profundidade
		// depth test é feito depois do fragment shader
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		// Desenha
		gl.drawArrays( gl.TRIANGLES, 0, points.length );

	/***************************************************************************/
		// Buffer de vértices linhas paralelas
		gl.bindBuffer( gl.ARRAY_BUFFER, colorBuf);
	    gl.bufferData( gl.ARRAY_BUFFER, flatten(infLinesColors), gl.STATIC_DRAW );

	    // Buffer de cores linhas paralelas
		gl.bindBuffer( gl.ARRAY_BUFFER, vertBuf);
	    gl.bufferData( gl.ARRAY_BUFFER, flatten(infLines), gl.STATIC_DRAW );

	/***************************************************************************/
		
		// Ativa a parte da cena fixa
		gl.uniform1i(fsLocation, 1);

	/***************************************************************************/
	    gl.drawArrays( gl.LINES, 0, 2 );
	    gl.drawArrays( gl.LINES, 2, 2 );

	/***************************************************************************/
	    requestAnimFrame( render );
	}

	requestAnimFrame( render );
}

// TODO: 
// * eixos de rotação global
// * eixos de rotação local
// * permitir rotação local ou global
// * cores do eixo (x,y,z) = (r,g,b)
