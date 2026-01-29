// Smooth scrolling for internal navigation links on the same page
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        // Only run for links pointing to sections on the same page
        if (location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') && location.hostname === this.hostname) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Mobile menu toggle with proper accessibility
const mobileMenu = document.querySelector('.mobile-menu');
const navLinks = document.querySelector('.nav-links');
let isMenuOpen = false;

mobileMenu.addEventListener('click', () => {
    isMenuOpen = !isMenuOpen;

    if (isMenuOpen) {
        navLinks.classList.add('is-open');
        mobileMenu.setAttribute('aria-expanded', 'true');
        mobileMenu.setAttribute('aria-label', 'Cerrar menú de navegación móvil');
    } else {
        navLinks.classList.remove('is-open');
        mobileMenu.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-label', 'Abrir menú de navegación móvil');
        isMenuOpen = false;
    }
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!mobileMenu.contains(e.target) && !navLinks.contains(e.target) && isMenuOpen) {
        navLinks.classList.remove('is-open');
        mobileMenu.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-label', 'Abrir menú de navegación móvil');
        isMenuOpen = false;
    }
});

// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
    } else {
        header.style.background = 'var(--white)';
        header.style.backdropFilter = 'none';
    }
});

// Enhanced form submission with better validation
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Get form data
        const formData = new FormData(this);
        const data = {};
        let isValid = true;
        let errors = [];

        for (let [key, value] of formData.entries()) {
            data[key] = value.trim();

            // Validation
            if (key === 'nombre' && !data[key]) {
                errors.push('El nombre es requerido');
                isValid = false;
            }
            if (key === 'empresa' && !data[key]) {
                errors.push('El nombre de la empresa es requerido');
                isValid = false;
            }
            if (key === 'email' && (!data[key] || !data[key].includes('@'))) {
                errors.push('Un email válido es requerido');
                isValid = false;
            }
            if (key === 'telefono' && !data[key]) {
                errors.push('El teléfono es requerido para contactarte');
                isValid = false;
            }
            if (key === 'mensaje' && (!data[key] || data[key].length < 10)) {
                errors.push('El mensaje debe tener al menos 10 caracteres');
                isValid = false;
            }
        }

        if (!isValid) {
            alert('Por favor completa los siguientes campos:\n• ' + errors.join('\n• '));
            return;
        }

        // Show success message with personalization
        alert(`¡Gracias ${data.nombre}! Hemos recibido tu consulta sobre ${data.empresa}. Un especialista de LOOM.IA se pondrá en contacto contigo en las próximas 24 horas al ${data.telefono}.`);

        // Here you would normally send to backend
        console.log('Form data:', data);

        // Reset form
        this.reset();
    });
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe service cards for animations
document.querySelectorAll('.service-card').forEach(card => {
    observer.observe(card);
});

// Card Flip Effect
document.querySelectorAll('.flip-button').forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        const card = e.target.closest('.service-card');
        if (card) {
            card.classList.toggle('flipped');
        }
    });
});
// =========================================
// Blog System Logic
// =========================================

async function fetchPosts() {
    try {
        // Attempt to use global variable first (best for local/file protocol)
        if (typeof BLOG_POSTS !== 'undefined') {
            return BLOG_POSTS;
        }

        // Fallback to fetch for server environments if variable is missing
        const response = await fetch('data/posts.json');
        if (!response.ok) {
            throw new Error('No se pudo cargar los datos del blog');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching posts:', error);
        return [];
    }
}

async function loadBlogPosts() {
    const grid = document.getElementById('posts-grid');
    if (!grid) return;

    const posts = await fetchPosts();

    if (posts.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No hay artículos disponibles por el momento.</p>';
        return;
    }

    grid.innerHTML = posts.map(post => `
        <article class="blog-card" onclick="window.location.href='article.html?id=${post.id}'" style="cursor: pointer;">
            <img src="${post.image}" alt="${post.title}" class="post-image">
            <div class="post-content">
                <span class="post-category">${post.category || 'General'}</span>
                <h3 class="post-title">${post.title}</h3>
                <p class="post-excerpt">${post.description}</p>
                <a href="article.html?id=${post.id}" class="read-more">Leer más &rarr;</a>
            </div>
        </article>
    `).join('');
}

async function loadArticle(articleId) {
    const container = document.getElementById('article-container');
    if (!container) return;

    const posts = await fetchPosts();
    const post = posts.find(p => p.id == articleId);

    if (!post) {
        container.innerHTML = `
            <div style="text-align: center; padding: 4rem;">
                <h2>Artículo no encontrado</h2>
                <p>El artículo que buscas no existe o ha sido movido.</p>
                <a href="blog.html" class="cta-button">Volver al Blog</a>
            </div>
        `;
        return;
    }

    // Set page title (tab)
    document.title = `${post.title} - LOOM.IA`;

    // Render Article Content (LinkedIn Style)
    container.innerHTML = `
        <header class="article-header">
            <img src="${post.image}" alt="${post.title}" class="article-cover-image">
            
            <h1 class="article-title">${post.title}</h1>
            ${post.subtitle ? `<h2 class="article-subtitle">${post.subtitle}</h2>` : ''}

            <div class="author-profile">
                <img src="${post.authorImage || 'assets/img/default-avatar.png'}" alt="${post.author}" class="author-avatar" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(post.author)}&background=random'">
                <div class="author-info">
                    <span class="author-name">${post.author}</span>
                    <span class="author-role">${post.authorRole || 'Colaborador'}</span>
                    <span class="article-meta">Publicado el ${post.date} • 5 min de lectura</span>
                </div>
            </div>
        </header>

        <div class="article-content">
            ${post.content}
        </div>

        <div style="margin-top: 4rem; text-align: center;">
            <p>¿Te gustó este artículo? Compartilo.</p>
            <a href="blog.html" class="back-link">&larr; Volver a todos los artículos</a>
        </div>
    `;
}
