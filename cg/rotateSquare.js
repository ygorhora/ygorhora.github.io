window.onload = function main(){

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

	init(gl);
};

function init(gl){

	// Calcula os pontos a serem traçados
	var squareVer = squareVertices();
	var squareCol = squareColors();

	// Cria um buffer de dados: gl.createBuffer();
	// Vincula vertexBuffer como o buffer onde cada elemento é um vértices
	gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
	gl.bufferData(gl.ARRAY_BUFFER, flatten(squareCol), gl.STATIC_DRAW);

	// Associa a variável vLocation a variável attribute do vertex-shader
	var cLocation = gl.getAttribLocation(gl.program, "a_vColor");
	gl.vertexAttribPointer(cLocation, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(cLocation);

	// Cria matriz de rotação com um certo ângulo de rotação theta
	var matRot = rotate(1.0,vec3(0,0,1));
	document.getElementById("sliderVelDegree").onchange = function(event) {
        var vel = parseFloat(event.target.value);
        matRot = rotate(vel,vec3(0,0,1));
    };

	var selecao = 0;
	// evento ao pressionar tecla
	window.onkeydown = function(event){
    	var key = String.fromCharCode(event.keyCode);
    	switch(key){
    		case "R": selecao = 0; break;
    		case "G": selecao = 1; break;
    		case "W": selecao = 2; break;
    		case "B": selecao = 3; break;
    		default: selecao = 0; break;
    	}
	};

	// Cria um buffer de dados: gl.createBuffer();
	// Vincula vertexBuffer como o buffer onde cada elemento é um vértices
	gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());

	// função com os dados dinâmicos
    function render() {
	    // Cor do contexto "limpo" RGBA
		gl.clearColor(0.75, 0.75, 0.75, 1.0);
		// Limpa canvas com a cor definida em gl.clearColor
		gl.clear(gl.COLOR_BUFFER_BIT);

		// Coloca as coordenadas dos vértices no buffer
		gl.bufferData(gl.ARRAY_BUFFER, flatten(squareVer), gl.DYNAMIC_DRAW);

		// Associa a variável vLocation a variável attribute do vertex-shader
		var vLocation = gl.getAttribLocation(gl.program, "a_vPosition");
		gl.vertexAttribPointer(vLocation, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(vLocation);

		// Desenha
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVer.length);

	    // Obtém ponto central de rotação
	    var rotPoint = squareVer[selecao];

	    // Forma novas coordenadas
	    var translationCoords = subEachCoordBy(squareVer, rotPoint, 2);
	    var rotateTransCoords = multiplyMatrixByEachPoint(matRot,translationCoords);
	    squareVer =  addEachCoordBy(rotateTransCoords, rotPoint, 2);

		window.requestAnimationFrame(render);  // TODO testar requestAnimFrame webgl-utils.js
	}

	window.requestAnimationFrame(render);
}

function multiplyMatrixByEachPoint(matrix, coords){
	var pointsTransformed = [];
	for(var i = 0; i < coords.length; ++i){
		pointsTransformed.push(multiplyMatrixByPoint(matrix, coords[i]));
	}
	return pointsTransformed;
}

function multiplyMatrixByPoint(matrix, point){
  var x = point[0] || 0.0;
  var y = point[1] || 0.0;
  var z = point[2] || 0.0;
  var w = point[3] || 0.0;

  var rX = (x * matrix[0][0]) + (y * matrix[1][0]) + (z * matrix[2][0]) + (w * matrix[3][0]);
  var rY = (x * matrix[0][1]) + (y * matrix[1][1]) + (z * matrix[2][1]) + (w * matrix[3][1]);
  var rZ = (x * matrix[0][2]) + (y * matrix[1][2]) + (z * matrix[2][2]) + (w * matrix[3][2]);
  var rW = (x * matrix[0][3]) + (y * matrix[1][3]) + (z * matrix[2][3]) + (w * matrix[3][3]);

  return [rX,rY,rZ,rW];
}

/*
 * último parâmetro é as dimensão máxima considerada 
*/
function subEachCoordBy(coords, vector, dim){
	var vertices = [];
	for(var i = 0; i < coords.length; ++i){
		var coord = [];
		for(var j = 0; j < Math.min(coords[i].length, dim); ++j){
			var elem = (coords[i][j] - vector[j]);
			coord.push(elem);
		}
		vertices.push(coord);
	}
	return vertices;
}

/*
 * último parâmetro é as dimensão máxima considerada 
*/
function addEachCoordBy(coords, vector, dim){
	var vertices = [];
	for(var i = 0; i < coords.length; ++i){
		var coord = [];
		for(var j = 0; j < Math.min(coords[i].length, dim); ++j){
			var elem = (coords[i][j] + vector[j]);
			coord.push(elem);
		}
		vertices.push(coord);
	}
	return vertices;
}

function squareVertices(){
	// TODO redimensionar usando matriz ortho
	var vertices = [
		vec2(0.5, 0.5),
		vec2(0.5, -0.5),
		vec2(-0.5, 0.5),
		vec2(-0.5, -0.5)
	];

	return vertices;
}

function squareColors(){
	var rgba = [
		vec4(1.0, 0.0, 0.0, 1.0),		// red 0
		vec4(0.0, 1.0, 0.0, 1.0),		// green 1
		vec4(1.0, 1.0, 1.0, 1.0),		// white 2
		vec4(0.0, 0.0, 1.0, 1.0)		// blue 3
	];

	return rgba;
}