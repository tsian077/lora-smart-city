var start = new Date();
start.setHours(0,0,0,0);


var end = new Date();
end.setHours(23,59,59,999);

console.log(start.toISOString().split('.')[0] )
console.log(end)