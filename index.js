
const CONFIG = {
    GITHUB_USERNAME: 'sentinelzxofc',
    REPOS_PER_PAGE: 6,
    MAX_REPOS: 100
};


const elements = {
    particlesCanvas: document.getElementById('particles'),
    cursor: document.querySelector('.custom-cursor'),
    repoContainer: document.getElementById('reposContainer'),
    viewMoreBtn: document.getElementById('viewMoreBtn'),
    themeToggle: document.getElementById('themeToggle'),
    navProgress: document.querySelector('.nav-progress'),
    repoCount: document.getElementById('repoCount'),
    filterBtns: document.querySelectorAll('.filter-btn'),
    navbar: document.querySelector('.premium-nav'),
    themeDark: document.getElementById('theme-dark'),
    themePurple: document.getElementById('theme-purple')
};


let state = {
    repos: [],
    filteredRepos: [],
    visibleCount: CONFIG.REPOS_PER_PAGE,
    currentFilter: 'all',
    ctx: null,
    particles: [],
    mouseX: 0,
    mouseY: 0,
    currentTheme: localStorage.getItem('theme') || 'dark'
};


const LANGUAGE_ICONS = {
    'JavaScript': 'fab fa-js',
    'Python': 'fab fa-python',
    'HTML': 'fab fa-html5',
    'CSS': 'fab fa-css3-alt',
    'PHP': 'fab fa-php',
    'Java': 'fab fa-java',
    'Shell': 'fas fa-terminal',
    'TypeScript': 'fab fa-js-square',
    'C++': 'fas fa-cogs',
    'C#': 'fab fa-microsoft',
    'Go': 'fab fa-golang',
    'Ruby': 'fab fa-ruby',
    'Swift': 'fab fa-swift',
    'Kotlin': 'fab fa-android',
    'Rust': 'fas fa-cog',
    'Dart': 'fab fa-dart',
    'default': 'fas fa-code'
};


document.addEventListener('DOMContentLoaded', () => {
    
    applyTheme(state.currentTheme);
    
    initParticles();
    initCursor();
    initThemeToggle();
    initScrollProgress();
    initEventListeners();
    initNavbarScroll();
    fetchGitHubRepos();
    startAnimations();
    initTypewriter();
});


function initThemeToggle() {
    if (!elements.themeToggle) return;
    
    
    updateThemeIcon();
    
    elements.themeToggle.addEventListener('click', () => {
        const newTheme = state.currentTheme === 'dark' ? 'purple' : 'dark';
        switchTheme(newTheme);
        
        
        elements.themeToggle.style.transform = 'scale(0.9) rotate(180deg)';
        setTimeout(() => {
            elements.themeToggle.style.transform = '';
        }, 300);
    });
}

function switchTheme(theme) {
    state.currentTheme = theme;
    
    
    localStorage.setItem('theme', theme);
    
    
    applyTheme(theme);
    
    
    updateThemeIcon();
    
    
    if (state.ctx) {
        initParticles();
    }
}

function applyTheme(theme) {
    
    document.documentElement.setAttribute('data-theme', theme);
    
    
    if (elements.themeDark && elements.themePurple) {
        if (theme === 'dark') {
            elements.themeDark.disabled = false;
            elements.themePurple.disabled = true;
        } else {
            elements.themeDark.disabled = true;
            elements.themePurple.disabled = false;
        }
    }
    
    
    document.body.classList.add('theme-transition');
    setTimeout(() => {
        document.body.classList.remove('theme-transition');
    }, 500);
}

function updateThemeIcon() {
    if (!elements.themeToggle) return;
    
    const icon = elements.themeToggle.querySelector('i');
    if (state.currentTheme === 'dark') {
        icon.className = 'fas fa-moon';
        elements.themeToggle.title = 'Mudar para tema roxo';
    } else {
        icon.className = 'fas fa-sun';
        elements.themeToggle.title = 'Mudar para tema dark';
    }
}


function initParticles() {
    const canvas = elements.particlesCanvas;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    state.ctx = ctx;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    
    const particleConfig = {
        dark: {
            colors: ['#ffffff', '#cccccc', '#888888'],
            opacityRange: [0.05, 0.2],
            count: 80
        },
        purple: {
            colors: ['#58a6ff', '#8957e5', '#8a63d2'],
            opacityRange: [0.1, 0.3],
            count: 60
        }
    };

    const config = particleConfig[state.currentTheme] || particleConfig.dark;

    
    state.particles = Array.from({ length: config.count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speedX: Math.random() * 0.5 - 0.25,
        speedY: Math.random() * 0.5 - 0.25,
        color: config.colors[Math.floor(Math.random() * config.colors.length)],
        opacity: Math.random() * (config.opacityRange[1] - config.opacityRange[0]) + config.opacityRange[0],
        pulse: Math.random() * Math.PI * 2
    }));

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        state.particles.forEach(particle => {
            
            particle.pulse += 0.02;
            const pulseSize = Math.sin(particle.pulse) * 0.2 + 1;
            
            
            const angle = Math.atan2(particle.y - state.mouseY, particle.x - state.mouseX);
            const distanceToMouse = Math.sqrt(
                Math.pow(particle.x - state.mouseX, 2) + 
                Math.pow(particle.y - state.mouseY, 2)
            );
            
            if (distanceToMouse < 150) {
                const repelForce = (150 - distanceToMouse) / 150;
                particle.x += Math.cos(angle) * repelForce * 2;
                particle.y += Math.sin(angle) * repelForce * 2;
            }

            particle.x += particle.speedX;
            particle.y += particle.speedY;

            
            if (particle.x < 0) particle.x = canvas.width;
            if (particle.x > canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = canvas.height;
            if (particle.y > canvas.height) particle.y = 0;

            
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size * pulseSize, 0, Math.PI * 2);
            ctx.fillStyle = particle.color;
            ctx.globalAlpha = particle.opacity;
            ctx.fill();
        });

        
        for (let i = 0; i < state.particles.length; i++) {
            for (let j = i + 1; j < state.particles.length; j++) {
                const dx = state.particles[i].x - state.particles[j].x;
                const dy = state.particles[i].y - state.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    ctx.beginPath();
                    const alpha = state.currentTheme === 'dark' ? 
                        0.1 * (1 - distance/100) : 0.2 * (1 - distance/100);
                    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
                    ctx.lineWidth = state.currentTheme === 'dark' ? 0.3 : 0.5;
                    ctx.moveTo(state.particles[i].x, state.particles[i].y);
                    ctx.lineTo(state.particles[j].x, state.particles[j].y);
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(animateParticles);
    }

    
    document.addEventListener('mousemove', (e) => {
        state.mouseX = e.clientX;
        state.mouseY = e.clientY;
    });

    animateParticles();
}


function initCursor() {
    if (!elements.cursor) return;
    
    
    updateCursorStyle();
    
    document.addEventListener('mousemove', (e) => {
        elements.cursor.style.left = `${e.clientX}px`;
        elements.cursor.style.top = `${e.clientY}px`;
    });

    
    const hoverElements = document.querySelectorAll('a, button, .project-card, .contact-card, .stack-icon, .action-btn');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            elements.cursor.classList.add('hover');
        });
        el.addEventListener('mouseleave', () => {
            elements.cursor.classList.remove('hover');
        });
    });
}

function updateCursorStyle() {
    if (!elements.cursor) return;
    
    if (state.currentTheme === 'dark') {
        elements.cursor.style.borderColor = '#ffffff';
        elements.cursor.style.background = '#ffffff';
    } else {
        elements.cursor.style.borderColor = '#58a6ff';
        elements.cursor.style.background = '#58a6ff';
    }
}


function initScrollProgress() {
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        
        if (elements.navProgress) {
            elements.navProgress.style.width = `${scrolled}%`;
        }
    });
}


function initNavbarScroll() {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            elements.navbar.classList.add('scrolled');
        } else {
            elements.navbar.classList.remove('scrolled');
        }
    });
}


function initEventListeners() {
    
    elements.filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.currentFilter = btn.dataset.filter;
            filterRepos();
            
            
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                btn.style.transform = '';
            }, 150);
        });
    });

    
    elements.viewMoreBtn?.addEventListener('click', loadMoreRepos);

    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    
    document.querySelectorAll('.project-card, .contact-card, .stack-icon').forEach(card => {
        observer.observe(card);
    });
}


async function fetchGitHubRepos() {
    try {
        showLoading(true);
        
        const response = await fetch(
            `https://api.github.com/users/${CONFIG.GITHUB_USERNAME}/repos?sort=updated&per_page=${CONFIG.MAX_REPOS}`
        );

        if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
        
        const data = await response.json();
        
        
        const sortedRepos = data.sort((a, b) => {
            if (b.stargazers_count !== a.stargazers_count) {
                return b.stargazers_count - a.stargazers_count;
            }
            return new Date(b.updated_at) - new Date(a.updated_at);
        });
        
        state.repos = sortedRepos.map(repo => ({
            id: repo.id,
            name: repo.name,
            description: repo.description || 'Sem descrição disponível',
            language: repo.language || 'Other',
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            url: repo.html_url,
            updated: formatDate(repo.updated_at),
            created: formatDate(repo.created_at),
            topics: repo.topics || [],
            homepage: repo.homepage,
            icon: LANGUAGE_ICONS[repo.language] || LANGUAGE_ICONS['default'],
            has_pages: repo.has_pages
        }));

        
        if (elements.repoCount) {
            animateCounter(elements.repoCount, 0, state.repos.length, 1500);
        }
        
        state.filteredRepos = [...state.repos];
        renderRepos();
        showLoading(false);
        
    } catch (error) {
        console.error('Erro ao carregar repositórios:', error);
        showError('Não foi possível carregar os projetos. Verifique sua conexão ou tente novamente mais tarde.');
        showLoading(false);
    }
}


function filterRepos() {
    if (state.currentFilter === 'all') {
        state.filteredRepos = [...state.repos];
    } else if (state.currentFilter === 'other') {
        state.filteredRepos = state.repos.filter(repo => 
            !['JavaScript', 'Python', 'HTML', 'CSS', 'PHP', 'Java'].includes(repo.language)
        );
    } else {
        state.filteredRepos = state.repos.filter(repo => 
            repo.language === state.currentFilter
        );
    }
    
    state.visibleCount = CONFIG.REPOS_PER_PAGE;
    renderRepos();
}


function renderRepos() {
    if (!elements.repoContainer) return;
    
    const visibleRepos = state.filteredRepos.slice(0, state.visibleCount);
    
    if (visibleRepos.length === 0) {
        elements.repoContainer.innerHTML = `
            <div class="no-projects" style="grid-column:1/-1;text-align:center;padding:4rem;">
                <i class="fas fa-code-branch" style="font-size:3rem;color:#666;margin-bottom:1.5rem;"></i>
                <h3 style="color:#fff;margin-bottom:1rem;font-size:1.5rem;">Nenhum projeto encontrado</h3>
                <p style="color:#888;">Tente selecionar outro filtro ou volte mais tarde.</p>
            </div>
        `;
        if (elements.viewMoreBtn) {
            elements.viewMoreBtn.style.display = 'none';
        }
        return;
    }
    
    elements.repoContainer.innerHTML = visibleRepos.map((repo, index) => `
        <div class="project-card" style="animation-delay:${index * 100}ms">
            <div class="project-header">
                <div class="project-icon">
                    <i class="${repo.icon}"></i>
                </div>
                <div class="project-actions">
                    ${repo.homepage ? `
                        <a href="${repo.homepage}" 
                           class="action-btn" 
                           target="_blank" 
                           title="Ver Demo">
                            <i class="fas fa-external-link-alt"></i>
                        </a>
                    ` : repo.has_pages ? `
                        <a href="https://${CONFIG.GITHUB_USERNAME}.github.io/${repo.name}" 
                           class="action-btn" 
                           target="_blank" 
                           title="Ver Demo">
                            <i class="fas fa-external-link-alt"></i>
                        </a>
                    ` : ''}
                    <a href="${repo.url}" 
                       class="action-btn" 
                       target="_blank" 
                       title="Ver no GitHub">
                        <i class="fab fa-github"></i>
                    </a>
                </div>
            </div>
            
            <h3 class="project-title">${repo.name}</h3>
            
            <p class="project-description">${repo.description}</p>
            
            ${repo.topics.length > 0 ? `
                <div class="project-tech">
                    ${repo.topics.slice(0, 4).map(topic => `
                        <span class="tech-tag">${topic}</span>
                    `).join('')}
                    ${repo.topics.length > 4 ? `<span class="tech-tag">+${repo.topics.length - 4}</span>` : ''}
                </div>
            ` : ''}
            
            <div class="project-footer">
                <div class="project-stats">
                    <div class="stat" title="Estrelas">
                        <i class="fas fa-star"></i>
                        <span>${repo.stars}</span>
                    </div>
                    <div class="stat" title="Forks">
                        <i class="fas fa-code-branch"></i>
                        <span>${repo.forks}</span>
                    </div>
                    <div class="stat" title="Linguagem">
                        <i class="fas fa-code"></i>
                        <span>${repo.language}</span>
                    </div>
                </div>
                <div class="project-date" title="Última atualização">
                    ${repo.updated}
                </div>
            </div>
        </div>
    `).join('');

    
    if (elements.viewMoreBtn) {
        elements.viewMoreBtn.style.display = 
            state.visibleCount < state.filteredRepos.length ? 'flex' : 'none';
    }
    
    
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('a')) {
                const link = card.querySelector('.project-actions a:last-child');
                if (link) {
                    window.open(link.href, '_blank');
                }
            }
        });
    });
}


function loadMoreRepos() {
    state.visibleCount += CONFIG.REPOS_PER_PAGE;
    renderRepos();
    
    
    if (elements.viewMoreBtn) {
        elements.viewMoreBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            elements.viewMoreBtn.style.transform = '';
        }, 150);
    }
}


function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses atrás`;
    
    return date.toLocaleDateString('pt-BR');
}


function showLoading(show) {
    if (!elements.repoContainer) return;
    
    if (show) {
        elements.repoContainer.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner">
                    <div class="spinner-ring"></div>
                    <div class="spinner-ring"></div>
                    <div class="spinner-ring"></div>
                </div>
                <p style="color:#888;font-size:1.1rem;">Carregando projetos...</p>
            </div>
        `;
        if (elements.viewMoreBtn) {
            elements.viewMoreBtn.style.display = 'none';
        }
    }
}


function showError(message) {
    if (!elements.repoContainer) return;
    
    elements.repoContainer.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:4rem;">
            <i class="fas fa-exclamation-triangle" style="font-size:3rem;color:#fff;margin-bottom:1.5rem;"></i>
            <h3 style="color:#fff;margin-bottom:1rem;font-size:1.5rem;">Oops! Algo deu errado</h3>
            <p style="color:#888;margin-bottom:2rem;">${message}</p>
            <button onclick="fetchGitHubRepos()" class="btn-secondary" style="display:inline-flex;align-items:center;gap:0.5rem;">
                <i class="fas fa-redo"></i>
                Tentar Novamente
            </button>
        </div>
    `;
}


function startAnimations() {
    
    document.querySelectorAll('.stack-icon').forEach((icon, index) => {
        icon.style.animationDelay = `${index * 100}ms`;
        icon.style.opacity = '0';
        icon.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            icon.style.transition = 'all 0.6s ease';
            icon.style.opacity = '1';
            icon.style.transform = 'translateY(0)';
        }, 300 + (index * 100));
    });
    
    
    document.querySelectorAll('.contact-card').forEach((card, index) => {
        card.style.animationDelay = `${index * 200}ms`;
    });
}


function animateCounter(element, start, end, duration) {
    if (!element) return;
    
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}


function initTypewriter() {
    const typewriterElement = document.querySelector('.typewriter-text');
    if (!typewriterElement) return;
    
    const texts = [
        'Full Stack Developer',
        'GitHub Enthusiast', 
        'Problem Solver',
        'Code Creator'
    ];
    
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let isPaused = false;
    const speed = 100;
    const pauseDuration = 1500;
    
    function type() {
        if (isPaused) {
            setTimeout(() => {
                isPaused = false;
                type();
            }, pauseDuration);
            return;
        }
        
        const currentText = texts[textIndex];
        
        if (isDeleting) {
            typewriterElement.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typewriterElement.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
        }

        if (!isDeleting && charIndex === currentText.length) {
            isDeleting = true;
            isPaused = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            isPaused = true;
        }

        setTimeout(type, isDeleting ? speed / 2 : speed);
    }
    
    
    setTimeout(type, 1000);
}


document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const target = document.querySelector(targetId);
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});


window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.hero-orbs, .hero-glow');
    
    parallaxElements.forEach(el => {
        const speed = el.classList.contains('hero-orbs') ? 0.3 : 0.5;
        el.style.transform = `translateY(${scrolled * speed}px)`;
    });
});
