let start, end;

function Timer() {
    start = Date.now();
}

Timer.prototype.end = function(){
    end = Date.now();
    return end - start;
}

export default Timer;