(function () {
    const current = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-link-custom").forEach(link => {
        if (link.getAttribute("href") === current) {
            link.classList.add("active");
        }
    });
})();

function initReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!items.length) return;
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
    items.forEach(item => observer.observe(item));
}

function initRipples() {
    document.querySelectorAll(".btn-glow, .btn-outline-glow").forEach(button => {
        button.addEventListener("click", function (e) {
            const rect = button.getBoundingClientRect();
            const ripple = document.createElement("span");
            const size = Math.max(rect.width, rect.height);
            ripple.classList.add("ripple");
            ripple.style.width = ripple.style.height = size + "px";
            ripple.style.left = (e.clientX - rect.left - size / 2) + "px";
            ripple.style.top = (e.clientY - rect.top - size / 2) + "px";
            button.appendChild(ripple);
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
});
}

(function () {
    const navbar = document.querySelector(".navbar-custom");
    if (!navbar) return;
    window.addEventListener("scroll", () => {
        navbar.style.boxShadow =
            window.scrollY > 12
                ? "0 10px 30px -18px rgba(0,0,0,.7)"
                : "none";
    });
})();
document.addEventListener("DOMContentLoaded", () => {
    initReveal();
    initRipples();
});