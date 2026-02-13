// Smooth scrolling for internal navigation links on the same page
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
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

// Enhanced form submission with Turnstile token capture
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const submitBtn = this.querySelector('.submit-button');

        // Get form data
        const formData = new FormData(this);
        const data = {};
        let isValid = true;
        let errors = [];

        for (let [key, value] of formData.entries()) {
            data[key] = value.trim();
        }

        // Validation
        if (!data['nombre']) {
            errors.push('El nombre es requerido');
            isValid = false;
        }
        if (!data['empresa']) {
            errors.push('El nombre de la empresa es requerido');
            isValid = false;
        }
        if (!data['email'] || !data['email'].includes('@')) {
            errors.push('Un email válido es requerido');
            isValid = false;
        }
        if (!data['telefono']) {
            errors.push('El teléfono es requerido para contactarte');
            isValid = false;
        }
        if (!data['mensaje'] || data['mensaje'].length < 10) {
            errors.push('El mensaje debe tener al menos 10 caracteres');
            isValid = false;
        }

        // ── Capturar token de Cloudflare Turnstile ──────────────────────────
        // El widget agrega un <input name="cf-turnstile-response"> cuando el
        // usuario pasa el desafío. Si no está presente, el envío se rechaza.
        const turnstileToken = data['cf-turnstile-response'];
        if (!turnstileToken) {
            errors.push('Por favor completá el desafío de seguridad (Turnstile)');
            isValid = false;
        }

        if (!isValid) {
            alert('Por favor completá los siguientes campos:\n• ' + errors.join('\n• '));
            return;
        }

        // Add loading state
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        // Send to FormSubmit (AJAX)
        fetch("https://formsubmit.co/ajax/loomia.contacto@gmail.com", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                nombre: data.nombre,
                empresa: data.empresa,
                email: data.email,
                telefono: data.telefono,
                mensaje: data.mensaje,
                // Token de Turnstile — FormSubmit lo valida automáticamente
                'cf-turnstile-response': turnstileToken,
                _subject: `Nueva consulta de ${data.nombre} (${data.empresa})`,
                _captcha: "false"   // Desactiva el reCAPTCHA propio de FormSubmit (usamos Turnstile)
            })
        })
        .then(response => response.json())
        .then(result => {
            if (result.success === 'true' || result.success === true) {
                alert(`¡Gracias ${data.nombre}! Hemos recibido tu consulta sobre ${data.empresa}. Un especialista de LOOM.IA se pondrá en contacto en las próximas 24 horas.`);
                contactForm.reset();

                // Reiniciar el widget de Turnstile para que el usuario pueda volver a enviar
                if (typeof turnstile !== 'undefined') {
                    turnstile.reset();
                }
            } else {
                alert('Hubo un problema al enviar el formulario. Por favor intentá de nuevo o escribinos directamente a loomia.contacto@gmail.com');
                console.error('FormSubmit error:', result);
            }
        })
        .catch(error => {
            alert('Error de red. Por favor revisá tu conexión e intentá nuevamente.');
            console.error('Error al enviar formulario:', error);
        })
        .finally(() => {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        });
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

document.querySelectorAll('.service-card, .accordion-item').forEach(el => {
    observer.observe(el);
});

// Accordion Functionality
document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
        const item = header.parentElement;
        const body = item.querySelector('.accordion-body');

        item.classList.toggle('active');

        if (item.classList.contains('active')) {
            body.style.maxHeight = body.scrollHeight + "px";
        } else {
            body.style.maxHeight = null;
        }
    });
});

// =========================================
// Blog System Logic
// =========================================

async function fetchPosts() {
    try {
        if (typeof BLOG_POSTS !== 'undefined') {
            return BLOG_POSTS;
        }
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

    document.title = `${post.title} - LOOM.IA`;

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

// Email Obfuscation Logic
const emailElement = document.getElementById('contact-email');
if (emailElement) {
    emailElement.addEventListener('click', function () {
        const user = this.getAttribute('data-user');
        const domain = this.getAttribute('data-domain');
        const email = `${user}@${domain}`;
        this.textContent = email;
        this.style.textDecoration = 'none';
        this.style.cursor = 'default';
        window.location.href = `mailto:${email}`;
    });
}

// =========================================
// Enhanced About Us Section Animations
// =========================================
const aboutSection = document.querySelector('.about-tech');
if (aboutSection) {
    const aboutObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                aboutSection.classList.add('animate');
                const statNumbers = aboutSection.querySelectorAll('.stat-number');
                statNumbers.forEach((stat, index) => {
                    setTimeout(() => {
                        stat.classList.add('counting');
                    }, 500 + (index * 200));
                });
                aboutObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3, rootMargin: '0px' });

    aboutObserver.observe(aboutSection);

    const techCard = aboutSection.querySelector('.tech-card');
    if (techCard) {
        aboutSection.addEventListener('mousemove', (e) => {
            if (!aboutSection.classList.contains('animate')) return;
            const rect = techCard.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const xCenter = rect.width / 2;
            const yCenter = rect.height / 2;
            const rotateX = ((y - yCenter) / yCenter) * -5;
            const rotateY = ((x - xCenter) / xCenter) * 5;
            techCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        aboutSection.addEventListener('mouseleave', () => {
            if (!aboutSection.classList.contains('animate')) return;
            techCard.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    }
}

// Expose functions to global window object
window.loadBlogPosts = loadBlogPosts;
