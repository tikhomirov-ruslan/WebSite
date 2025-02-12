let btn = document.querySelector('.btn')
let circle = document.querySelector('.circle')

btn.addEventListener('click', function(){
    if (!circle.classList.contains('form2')){
        circle.classList.add('form2')
    }
    else {
        circle.classList.remove('form2')
    }
})

all_boxes = document.querySelectorAll('.box');
console.log(all_boxes)

btn = document.querySelector('.refresh');

let cnt = 1;
all_boxes.forEach( (element) => {
    element.addEventListener('click', () => {
        if_end_game();
        if (element.style.background == 'red') {
            if (cnt % 2 == 0) {
                element.style.background = 'green';
                cnt++;
            }
        }
            else {
                element.style.background = 'white';
                cnt++;
            }
        console.log('Hello world!!!'); 
        console.log('cnt');           
    });
})

function if_end_game() {
    white_arr = []
    green_arr = []
    all_boxes.forEach( (elm) => {
        if (elm.style.background == 'white') {
            box_id = elm.dataset.id;
            white_arr.push(btn_id);
        }
        else if (elm.style.background == 'green') {
            green_arr.push(btn_id);
        }   
    })
    return true;

    return false;
}

btn.addEventListener('click', () => {
    cnt = 1;
    all_boxes.forEach( (element) => {
        element.style.background = 'red';
    })
})

function openModal(modalType) {
    document.getElementById(modalType + 'Modal').style.display = 'flex';
}

function closeModal(modalType) {
    document.getElementById(modalType + 'Modal').style.display = 'none';
}

// Закрытие модального окна при клике вне его
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

console.log("end");