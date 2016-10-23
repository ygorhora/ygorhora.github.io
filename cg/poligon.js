window.onload = function init(){
	// Número de lados do polígono regular
	var sides = 3;
	var size = 1;

	// Obtém o contexto WebGL
	var canvas = document.getElementById("gl-canvas");
	var gl = WebGLUtils.setupWebGL(canvas);
	if(!gl){
		alert("WebGL isn't available");
	}

	// Mapeando a Viewport
	gl.viewport(0, 0, canvas.width, canvas.height);

	// Retorna um programa, pronto para ser usado, linkado com o contexto WebGL
	// e que possui o vertex-shader e fragment-shader especificado.
	var program = initShaders(gl, "vertex-shader", "fragment-shader");

	// Utiliza o programa com os shaders definidos
	gl.useProgram(program);
	gl.program = program;

	// Cria um buffer de dados: gl.createBuffer();
	// Vincula vertexBuffer como o buffer onde cada elemento é um vértices
	gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());

	document.getElementById("sliderSides").onchange = function(event) {
        sides = parseInt(event.target.value);
        render(gl, sides, size); // Renderiza
    };

    document.getElementById("sliderSize").onchange = function(event) {
        size = parseFloat(event.target.value);
        render(gl, sides, size); // Renderiza
    };

    // Renderiza
	render(gl, sides, size);
};

function render(gl, sides, size){

	// Calcula os pontos a serem traçados
	var arrays = calcPointsOfCircle(sides,size);
	var vertices = arrays["vertices"];
	var lines = arrays["lines"];

	// Cor do contexto "limpo" RGBA
	gl.clearColor(0.75, 0.75, 0.75, 1.0);
	// Limpa canvas com a cor definida em gl.clearColor
	gl.clear(gl.COLOR_BUFFER_BIT);

	/* Trata o buffer de dados como um array de vértices*/
	// Inicializa o buffer vinculado (do tipo gl.ARRAY_BUFFER) com os valores 
	// especificados em points, sendo estes valores mudados constantemente
	gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.DYNAMIC_DRAW);

	// Associa a variável vLocation a variável attribute do vertex-shader
	var vLocation = gl.getAttribLocation(gl.program, "vPosition");
	// Associa o buffer vinculado (do tipo gl.ARRAY_BUFFER) a localização da
	// variável vPosition, sendo que cada posição do buffer tem 2 coordenadas
	// sendo cada uma do tipo Float32Array
	gl.vertexAttribPointer(vLocation, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vLocation);

	/* DESENHA os triângulos formados */
	//modificando a cor no fragment shader
	var u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
	gl.uniform4f(u_FragColor, 1.0, 1.0, 0.0, 1.0);

	// desenha a partir do buffer
	gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length);


	/* DESENHA as linhas de contorno */
	// Inicializa o buffer vinculado (do tipo gl.ARRAY_BUFFER) com os valores 
	// especificados em points, sendo estes valores mudados constantemente
	gl.bufferData(gl.ARRAY_BUFFER, flatten(lines), gl.DYNAMIC_DRAW);

	// Muda a cor que será desenhada
	gl.uniform4f(u_FragColor, 0.0, 0.0, 0.0, 1.0);

	// Desenha a partir do buffer especificado
	gl.drawArrays( gl.LINE_STRIP, 0, lines.length);
}

function calcPointsOfCircle(nPoints, size){
	var vertices = [];
	var lines = [];
	var arrays = {};
	var i;
	vertices.push([0,0]); // ponto inicial
	
	var axisRot = vec3(0,0,1); // servirá como eixo de rotação z'
	var rotAngleDegree = 360.0/nPoints; // ângulo em graus de rotação
	var matRot = rotate(rotAngleDegree,axisRot); // matriz de rotação
	
	vector = mix(vec4(0,0,0,1), vec4(1,0,0,1), size); // vetor inicial para rotação

	for(i = 0; i < nPoints; ++i){
		vector = multiplyMatrixByPoint(matRot,vector); // retorna o vetor rodado
		vertices.push(vector.slice(0,2)); // [0..2)
	}
	vertices.push(vertices[1]);

	lines.push(vertices[0]);
	for(i = 1; i < vertices.length-1; ++i){
		lines.push(vertices[i]);
		lines.push(vertices[i+1]);
		lines.push(vertices[0]);
	}

	arrays["vertices"] = vertices;
	arrays["lines"] = lines;
	return arrays;
}


function multiplyMatrixByPoint(matrix, point){
  var x = point[0];
  var y = point[1];
  var z = point[2];
  var w = point[3];

  var rX = (x * matrix[0][0]) + (y * matrix[1][0]) + (z * matrix[2][0]) + (w * matrix[3][0]);
  var rY = (x * matrix[0][1]) + (y * matrix[1][1]) + (z * matrix[2][1]) + (w * matrix[3][1]);
  var rZ = (x * matrix[0][2]) + (y * matrix[1][2]) + (z * matrix[2][2]) + (w * matrix[3][2]);
  var rW = (x * matrix[0][3]) + (y * matrix[1][3]) + (z * matrix[2][3]) + (w * matrix[3][3]);

  return [rX,rY,rZ,rW];
}