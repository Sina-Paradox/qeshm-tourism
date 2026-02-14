const loop = document.getElementById("loop");
let position = 0;

window.addEventListener("wheel", (e) => {
    if(e.deltaY > 0){
        position -= 200;
    } else {
        position += 200;
    }

    loop.style.transform = `translateX(${position}px)`;

    if(Math.abs(position) > loop.scrollWidth / 2){
        position = 0;
    }
});
