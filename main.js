document.addEventListener("DOMContentLoaded", () => {
    const currentPage =
        window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".topnav-link").forEach(link => {
        if (link.getAttribute("href") === currentPage) {
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
            if (button.dataset.rippleAdded) {
                return;
            }
            button.dataset.rippleAdded = "true";
            button.addEventListener("click", event => {
                const circle = document.createElement("span");
                const size = Math.max(
                    button.offsetWidth,
                    button.offsetHeight
                );
                const rect = button.getBoundingClientRect();
                circle.className = "ripple";
                circle.style.width = size + "px";
                circle.style.height = size + "px";
                circle.style.left = event.clientX - rect.left - size / 2 + "px";
                circle.style.top = event.clientY - rect.top - size / 2 + "px";
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
    showReveal();
    buttonRipple();
    navbarShadow();
});