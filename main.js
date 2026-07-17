const currentPage = window.location.pathname.split("/").pop() || "index.html";
const navLinks = document.querySelectorAll(".topnav-link");
navLinks.forEach(link => {
    if (link.href.includes(currentPage)) {
        link.classList.add("active");
    }
});

function showReveal() {
    const revealItems = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("in");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15
    });
    revealItems.forEach(item => {
        observer.observe(item);
    });
}

function buttonRipple() {
    const buttons = document.querySelectorAll(
        ".btn-glow, .btn-outline-glow"
    );
    buttons.forEach(button => {
        button.addEventListener("click", event => {
            const circle = document.createElement("span");
            const size = Math.max(
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
            setTimeout(() => {
                circle.remove();
            }, 600);
        });
    });
}

function navbarShadow() {
    const navbar = document.querySelector(".topnav");
    if (!navbar) {
        return;
    }

    window.addEventListener("scroll", () => {
        if (window.scrollY > 12) {
            navbar.style.boxShadow =
                "0 10px 30px -18px rgba(0,0,0,0.7)";
        } else {
            navbar.style.boxShadow = "none";
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    showReveal();
    buttonRipple();
    navbarShadow();
});