const loop = document.getElementById("loop");
let position = 0;

window.addEventListener("wheel", (e) => {
    const step = 100; // کمتر از قبل برای حرکت نرم‌تر
    if(e.deltaY > 0){
        position -= step;
    } else {
        position += step;
    }

    loop.style.transition = "transform 0.6s ease"; // کندتر
    loop.style.transform = `translateX(${position}px)`;

    const max = loop.scrollWidth / 2;
    if(Math.abs(position) > max){
        position = 0;
    }
});
let position = 0;


