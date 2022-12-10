var arrExample1 = [[3,20,8,13,4,100,80],[4,4,18,14,3,0,60],[10,4,18,8,6,0,30],[7,19,17,2,1,100,60],[10,30,40,50,70,30]];
var arrExample2 = [[1,2,4,3,6],[4,3,8,5,8],[2,7,6,3,10],[4,6,8,6]]

function getEquation(arr){
	document.getElementById('equations').innerHTML = '';
	var eq = document.createDocumentFragment();

	var h2 = document.createElement('h2');
  h2.innerHTML = "Введите значения";
 	eq.appendChild(h2);
	var sizeRow = parseInt(document.getElementById("x").value)+2;
	var sizeCell = parseInt(document.getElementById("y").value)+2;
  	if (arr != undefined) {
  		sizeRow = arr.length+1;
  		sizeCell = arr[0].length+1;
  	}
  var table = document.createElement('table');
  for (var i = 0; i < sizeRow; i++) {
    var tr = document.createElement('tr');
    for (var j = 0; j < sizeCell; j++) {
      if (i == 0 ) {
        var th = document.createElement('th');
        if (j != 0) th.innerHTML = j;
        if (j == sizeCell-1) th.innerHTML = "Запасы";
        tr.appendChild(th);
      }else {
        var td = document.createElement('td');
        if (j == 0) {
          td.id = "Y"
          if (i != 0) td.innerHTML = i;
          if (i == sizeRow - 1) td.innerHTML = "Потребности";
        }else if (j != sizeCell-1 || i != sizeRow-1) {
          var input = document.createElement('input');
          input.type = "number";
          if (arr == undefined) {
            if (document.getElementById('check1').checked)
              input.value = getRandom();
            else
              input.value = 0;
          }else{
            input.value = arr[i-1][j-1];
          }
          td.appendChild(input);
        }
        tr.appendChild(td);
      }
    }
    table.appendChild(tr);
  }
  eq.appendChild(table);

	var but = document.createElement('input');
    but.setAttribute("type", "submit");
    but.setAttribute("value", "Вычислить");
    but.setAttribute("onclick", "decision()");
	eq.appendChild(but);
	document.getElementById('equations').appendChild(eq);
}

function getRandom(){
   var min = 0;
   var max = 101;
   return Math.floor(Math.random()*(max-min))+min;
}

function decision(){
  document.getElementById('step').innerHTML = '';
  var div_main = document.createDocumentFragment();

  var arr = tableMatrix();
  if (conditionOfSolvability(arr)) {
    var div = document.createElement('div');
    div.setAttribute("id", "step_0");
  
    var h2 = document.createElement('h2');
    h2.innerHTML = "Решение:";
    div_main.appendChild(h2);
  
    var p = document.createElement('p');
    p.innerHTML = "Опорный план";
    div.appendChild(p);

    
    var table = document.createElement('table');
    table.appendChild(conversionStep(basis(arr)));
    div.appendChild(table);

    var bool = true;
    while(bool){
      var arr_ref = optimal(arr);
      p = document.createElement('p');
      p.innerHTML = "Предварительные потенциалы u<sub>i</sub>, v<sub>j</sub>";
      div.appendChild(p);
      var table = document.createElement('table');
      table.appendChild(conversionStep(arr_ref));
      div.appendChild(table);
  
      array = validate(arr_ref);
      if (array.length != 0) {
        p = document.createElement('p');
        var max = array[0];
        var def = 0;
        var def_max = 0;
        for (var k = 0; k < array.length; k++) {
          def = arr_ref[array[k].i][0] + arr_ref[0][array[k].j] - array[k].value;
          if (def_max < def) {
            def_max = def;
            max = array[k];
          }
          p.innerHTML += "("+array[k].i+","+array[k].j+"): "+ arr_ref[array[k].i][0]+"+" +arr_ref[0][array[k].j]+">"+array[k].value + ". ▲ = "+ def +'<br>';
        }
        p.innerHTML += "Максимальная оценка свободной клетки (" + max.i +"," + max.j + "): " + max.value;
        div.appendChild(p);
        var table = document.createElement('table');
        table.appendChild(conversionStep(permutation(arr,max)));
        div.appendChild(table); 
      } else {
        p = document.createElement('p');
        p.innerHTML = "Опорный план является оптимальным, так все оценки свободных клеток удовлетворяют условию u<sub>i</sub> + v<sub>j</sub> ≤ c<sub>ij</sub>.";
        div.appendChild(p);
        var table = document.createElement('table');
        table.appendChild(conversionStep(arr));
        div.appendChild(table);
        var sum = 0;
        p = document.createElement('p');
        p.innerHTML = "Минимальные затраты составят: F(x) = "
        for (var i = 1; i < arr.length; i++) {
          for (var j = 1; j < arr[0].length; j++) {
            if (arr[i][j].toString().indexOf("[") != -1) {
              var a = parseInt(arr[i][j]);
              var b = parseInt(arr[i][j].substr(arr[i][j].toString().indexOf("[")+1));
              if (sum != 0) p.innerHTML += " + ";
              p.innerHTML += a + "*" + b ;
              sum += a*b;
            }
          }
        }
        p.innerHTML += " = " + sum;
        div.appendChild(p);
        bool = false;
      }
    }
    div_main.appendChild(div);
  }else{ 
    alert("Условие баланса не соблюдается. Запасы неравны потребностям. Модель транспортной задачи является открытой.");
  }

  
  document.getElementById('step').appendChild(div_main);

}

function conditionOfSolvability(arr){
  var sum_stocks = 0;
  var sum_needs = 0;
  var number_rows = arr.length-1;
  var number_columns = arr[0].length-1;
  for (var i = 1; i < number_rows; i++) {
    sum_stocks += arr[i][number_columns];
  }
  for (var i = 1; i < number_columns; i++) {
    sum_needs += arr[number_rows][i];
  }
  return sum_needs == sum_stocks;
}

function tableMatrix(){
  var table = document.getElementById('equations');
  var th = table.querySelectorAll('th');
  var tr = table.querySelectorAll('tr');
  var td = table.querySelectorAll('td');
  var sizeRow = tr.length;
  var sizeCell = th.length;
  var arr = [];
  for (var i = 0; i < sizeRow; i++) {
    arr[i] = [];
    for (var j = 0; j < sizeCell; j++) {
      var k = j+(i-1)*sizeCell;
      if (i == 0 ) {
        arr[i][j] = th[j].innerHTML;
      }else{
        if(j == 0 || (j == sizeCell-1 && i == sizeRow-1)){
          arr[i][j] = td[k].innerHTML;
        }else  {
            var input = td[k].querySelector('input');
            arr[i][j] = parseInt(input.value);
          }
      }
    }
  }
  return arr;      
}

function conversionStep(arr){
  var table = document.createDocumentFragment();
  for (var i = 0; i < arr.length; i++) {
    var tr = document.createElement('tr');
    for(var j = 0; j < arr[i].length; j++) {
      if(i == 0){
        var th = document.createElement('th');
        th.innerHTML = arr[i][j]; 
        tr.appendChild(th);
      }else{
        var td = document.createElement('td');
        if (j == 0) { td.id = "Y"}
        td.innerHTML = arr[i][j];
        tr.appendChild(td);
      }
    }
    table.appendChild(tr);
  }
  return table;
}

function basis(arr){
  var count = arr.length + arr[0].length - 5;
  var arr_reference = [];
  var number_rows = arr.length-1;
  var number_columns = arr[0].length-1;
  for (var i = 1; i < number_rows+1; i++) {
    arr_reference[i] = [];
    for (var j = 1; j < number_columns+1; j++) {
      if ((i == number_rows || j == number_columns) && (i != number_rows || j != number_columns)) {
        arr_reference[i][j] = arr[i][j];
      }
    }
  }
  for (var i = 0; i < count; i++) {
    arr_reference = transportationProblem(arr,arr_reference);
  }
  return basicPlan(arr, arr_reference);
}

function transportationProblem(arr,arr_reference){
  var number_rows = arr.length-1;
  var number_columns = arr[0].length-1;
  var arr_min = 1000;
  var arr_i = number_rows;
  var arr_j = number_columns;
  for (var i = 1 ; i < number_rows; i++) {
    for (var j = 1 ; j < number_columns; j++) {
      if (arr[i][j] < arr_min && arr_reference[i][j] == null && arr_reference[number_rows][j] != 0 && arr_reference[i][number_columns] != 0 ) { 
        arr_i = i;
        arr_j = j;
        arr_min = arr[i][j];
      }
    }
  }

  var diff;
  if (arr_reference[number_rows][arr_j] < arr_reference[arr_i][number_columns]) {
    diff = arr_reference[number_rows][arr_j];
  }else{
    diff = arr_reference[arr_i][number_columns];
  }
  arr_reference[arr_i][number_columns] -= diff;
  arr_reference[number_rows][arr_j] -= diff;;
  arr_reference[arr_i][arr_j] = diff;
  return arr_reference;
}

function basicPlan(arr, arr_reference){
  var number_rows = arr.length-1;
  var number_columns = arr[0].length-1;
  for (var i = 1; i < number_rows; i++) {
    for (var j = 1; j < number_columns; j++) {
      if (arr_reference[i][j] != null) arr[i][j] = parseInt(arr[i][j]) + "["+arr_reference[i][j]+"]";
      else if (arr_reference[i][j] == null && arr[i][j].toString().indexOf("[") != -1) {arr[i][j] = arr[i][j]}
    }
  }
  return arr;
}

function checkedDegenerate(arr){
  var count = 0;
  for (var i = 1; i < arr.length-1; i++) {
    for (var j = 1; j < arr[1].length-1; j++) {
      if (arr[i][j] != null) count++
    }
  }
  return count;
}

function optimal(arr){
  var arr_ref = [];
  for (var i = 0; i < arr.length-1; i++) {
    arr_ref[i]=[];
    for (var j = 0; j < arr[1].length-1; j++) {
      if (i != 0 && j !=0) arr_ref[i][j] = arr[i][j];
      else arr_ref[i][j] = null;
    }
  }
  arr_ref[1][0] = 0;

  var blank = true;
  while(blank){
    for (var i = 1; i < arr_ref.length; i++) {
      for (var j = 1; j < arr_ref[0].length; j++) {
        if (arr_ref[i][j].toString().indexOf("[") != -1) {
          if (arr_ref[i][0] != null) {
            arr_ref[0][j] = parseInt(arr_ref[i][j]) - arr_ref[i][0];
          }
          else if (arr_ref[0][j] != null){
            arr_ref[i][0] = parseInt(arr_ref[i][j]) - arr_ref[0][j];
          }

        }
      }
    }
    var count = 0;
    for (var i = 1; i < arr_ref.length; i++) {
      if (arr_ref[i][0] == null) count++;
    }
    for (var i = 1; i < arr_ref[0].length; i++) {
      if (arr_ref[0][i] == null) count++;
    }
    if (count == 0) blank = false;
  }
  return arr_ref;
}

function validate(arr_ref){
  var arr = [];
  for (var i = 1; i < arr_ref.length; i++) {
    for (var j = 1; j < arr_ref[0].length; j++) {
      if (arr_ref[i][j].toString().indexOf("[") == -1) {
        if (arr_ref[i][j] < arr_ref[0][j]+arr_ref[i][0]) {
          var elem = {i: i, j: j, value: arr_ref[i][j]};
          arr.push(elem);
        }
      }
    }
  }
  return arr;
}

function permutation(arr, max){
  var array = [];
  max.sign = "+";
  array.push(max);
  for (var i = 1; i < arr.length; i++) {
    for (var j = 1; j < arr[0].length; j++) {
      if (arr[i][j].toString().indexOf("[") != -1) {
        var elem = {i: i, j: j, value: parseInt(arr[i][j]), delivery: parseInt(arr[i][j].substr(arr[i][j].toString().indexOf("[")+1))};
        array.push(elem);
      }
    }
  }

  do{
  
    for (var i = 1; i < arr.length; i++) {
      var count = 0;
      for (var j = 0; j < array.length; j++) {
        if (array[j].i == i) {count++}
      }
      if (count < 2) {
        array = array.filter(n => n.i !== i)
      }
    }
    for (var i = 1; i < arr[0].length; i++) {
      var count = 0;
      for (var j = 0; j < array.length; j++) {
        if (array[j].j == i) {count++}
      }
      if (count < 2) {
        array = array.filter(n => n.j !== i)
      }
    }
  }while(array.length % 2 != 0)

  
  max.delivery = 0;

  for (var i = 0; i < array.length-1; i++) {
    for (var j = i+1; j <array.length; j++) {
      if ((array[i].i == array[j].i || array[i].j == array[j].j)) {
        if (array[i].sign == "+") {
          array[j].sign = "-";
        }else if (array[i].sign == "-") {
          array[j].sign = "+";
        }else if (array[i].sign == undefined) { 
          array[i].sign = "+";
          array[j].sign = "-";
        }
      }
    }
  }

  var min = array[1].delivery;
  for (var i = 1; i < array.length; i++) {
    if (array[i].sign == "-" && min > array[i].delivery) min = array[i].delivery;
  }

  for (var i = 0; i < arr.length; i++) {
    for (var j = 0; j < arr[0].length; j++) {
      for (var k = 0; k < array.length; k++) {
        if (array[k].i == i && array[k].j == j) {
          if (array[k].sign == "+") {
            array[k].delivery += min;
          }else{
            array[k].delivery -= min;
          }
          if (array[k].delivery == 0 && i == max.i && j == max.j) arr[i][j] = parseInt(arr[i][j]) + "[" + array[k].delivery + "]";
          else if (array[k].delivery == 0 && (i == max.i || j == max.j)) arr[i][j] = parseInt(arr[i][j]);
          else arr[i][j] = parseInt(arr[i][j]) + "[" + array[k].delivery + "]";
        }
      }
    }
  }
  return arr;

}
