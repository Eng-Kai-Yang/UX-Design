let currentPage = window.location.pathname.split("/").pop();
if (currentPage === "") {
    currentPage = "index.html";
}
let navLinks = document.querySelectorAll(".topnav-link");
for (let i = 0; i < navLinks.length; i++) {
    if (navLinks[i].href.includes(currentPage)) {
        navLinks[i].classList.add("active");
    }
}

function showReveal() {
    let revealItems = document.querySelectorAll(".reveal");
    let observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add("in");
            }
        });
    }, {
        threshold: 0.15
    });
    for (let i = 0; i < revealItems.length; i++) {
        observer.observe(revealItems[i]);
    }
}
function buttonRipple() {
    let buttons = document.querySelectorAll(
        ".btn-glow, .btn-outline-glow"
    );
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", function(event) {
            let button = buttons[i];
            let circle = document.createElement("span");
            let size = Math.max(
                button.offsetWidth,
                button.offsetHeight
            );
            circle.className = "ripple";
            circle.style.width = size + "px";
            circle.style.height = size + "px";
            circle.style.left =
                event.offsetX - size / 2 + "px";
            circle.style.top =
                event.offsetY - size / 2 + "px";
            button.appendChild(circle);
            setTimeout(function() {
                circle.remove();
            }, 600);
        });
    }
}

function navbarShadow() {
    let navbar = document.querySelector(".navbar-custom");
    if (navbar != null) {
        window.addEventListener("scroll", function() {
            if (window.scrollY > 12) {
                navbar.style.boxShadow =
                "0 10px 30px -18px rgba(0,0,0,0.7)";
            } else {
                navbar.style.boxShadow = "none";
            }
        });
    }
}

document.addEventListener("DOMContentLoaded", function() {
    showReveal();
    buttonRipple();
    navbarShadow();
});