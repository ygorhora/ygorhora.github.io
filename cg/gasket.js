// Dividindo os triângulos recursivamente
var depth = 3;
var vTriangle = []; // pontos a tracejar de 3 em 3
var edTriangle = []; // pontos a tracejar de 2 em 2
var drawLastOne = false;
var theta = 0.3;

window.onload = function init(){
	var canvas = document.getElementById("gl-canvas");

	// obtém o contexto WebGL
	var gl = WebGLUtils.setupWebGL(canvas);

	if(!gl){
		alert("WebGL isn't available");
	}

	// Definindo as coordenadas dos vértices na Window
	// (0,0) sempre é o ponto central da Window
	var vertices = [
		vec2(-0.6, -0.6),
		vec2( 0, 0.6),
		vec2( 0.6, -0.6)
	];

	divideTriangle(vertices[0], vertices[1], vertices[2], depth, drawLastOne);

	// mapeando a Viewport
	gl.viewport(0, 0, canvas.width, canvas.height);

	// RGBA
	gl.clearColor(0.0, 0.0, 0.0, 1.0);

	// carrega o fragment e o vertex shader
	// interessante notar que ele só faz o link do programa
	// mas não ainda está utilizando no contexto atual
	/*var program = initShaders(gl, "shaders/vertex-shader.glsl"
								, "shaders/fragment-shader.glsl" );*/
	var program = initShaders(gl, "vertex-shader", "fragment-shader");

	// Utiliza o programa com os shaders definidos
	gl.useProgram(program);

	// Cria um buffer para dados
	var vertexBuffer = gl.createBuffer();
	if(!vertexBuffer){
		alert("Buffer object cannot be create.");
	}

	// Vincula vertexBuffer informando tratar-se
	// de um buffer de vértices
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

	// Inicializa o buffer vinculado com os
	// valores especificados em vTriangle, observando
	// tratar-se de um buffer com valores definitivos
	// e utilizados muitas vezes.
	gl.bufferData(gl.ARRAY_BUFFER, flatten(vTriangle), gl.DYNAMIC_DRAW); //gl.STATIC_DRAW

	// Associa a variável do javascript a variável do
	// vertex-shader
	var vLocation = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vLocation, 2, gl.FLOAT, false, 0, 0);
	// gl.vertexAttrib2fv(variableLocation,)
	gl.enableVertexAttribArray(vLocation);

	//modificando theta do shader vertex
	var thetaLoc = gl.getUniformLocation(program, "theta");
	gl.uniform1f(thetaLoc,theta);

	//modificando a cor no fragment shader
	var u_FragColor = gl.getUniformLocation(program, 'u_FragColor');
	gl.uniform4f(u_FragColor, 1.0, 0.0, 0.0, 1.0);

	// limpa canvas com a cor definida em gl.clearColor
	gl.clear(gl.COLOR_BUFFER_BIT);

	// desenha o buffer
	gl.drawArrays( gl.TRIANGLES, 0, vTriangle.length );
	

	// recarrega o buffer com outros dados
	gl.bufferData(gl.ARRAY_BUFFER, flatten(edTriangle), gl.DYNAMIC_DRAW);

	// muda a cor que será desenhada
	gl.uniform4f(u_FragColor, 0.0, 1.0, 0.0, 1.0);

	// desenha o buffer
	gl.drawArrays( gl.LINES, 0, edTriangle.length);

};

function divideTriangle(a, b, c, depth, drawLastOne){
	// fim da recursão
	if(depth === 0){
		vTriangle.push(a, b, c);
		edTriangle.push(a, b, b, c, c, a);
	} else {
		// ponto médio dos lados
		var ab = mix(a, b, 0.5);
		var ac = mix(a, c, 0.5);
		var bc = mix(b, c, 0.5);

		--depth;

		divideTriangle(a, ab, ac, depth, drawLastOne);
		divideTriangle(c, ac, bc, depth, drawLastOne);
		divideTriangle(b, bc, ab, depth, drawLastOne);
		if(drawLastOne){
			divideTriangle(ab, bc, ac, depth, drawLastOne);
		}
	}
}