
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
    filterBtns: document.querySelectorAll('.filter-btn')
};


let state = {
    repos: [],
    filteredRepos: [],
    visibleCount: CONFIG.REPOS_PER_PAGE,
    currentFilter: 'all',
    ctx: null,
    particles: []
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
    initParticles();
    initCursor();
    initTheme();
    initScrollProgress();
    initEventListeners();
    fetchGitHubRepos();
    startAnimations();
});


function initParticles() {
    const canvas = elements.particlesCanvas;
    const ctx = canvas.getContext('2d');
    state.ctx = ctx;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    
    state.particles = Array.from({ length: 50 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: Math.random() * 1 - 0.5,
        speedY: Math.random() * 1 - 0.5,
        color: Math.random() > 0.5 ? '#58a6ff' : '#8957e5',
        opacity: Math.random() * 0.5 + 0.1
    }));

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        state.particles.forEach(particle => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;

            
            if (particle.x < 0) particle.x = canvas.width;
            if (particle.x > canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = canvas.height;
            if (particle.y > canvas.height) particle.y = 0;

            
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
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
                    ctx.strokeStyle = 'rgba(88, 166, 255, 0.1)';
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(state.particles[i].x, state.particles[i].y);
                    ctx.lineTo(state.particles[j].x, state.particles[j].y);
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(animateParticles);
    }

    animateParticles();
}


function initCursor() {
    document.addEventListener('mousemove', (e) => {
        elements.cursor.style.left = `${e.clientX}px`;
        elements.cursor.style.top = `${e.clientY}px`;
    });

    
    const hoverElements = document.querySelectorAll('a, button, .project-card, .contact-card');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            elements.cursor.classList.add('hover');
        });
        el.addEventListener('mouseleave', () => {
            elements.cursor.classList.remove('hover');
        });
    });
}


function initTheme() {
    elements.themeToggle?.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        const icon = elements.themeToggle.querySelector('i');
        icon.classList.toggle('fa-moon');
        icon.classList.toggle('fa-sun');
    });
}


function initScrollProgress() {
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        elements.navProgress.style.width = `${scrolled}%`;
    });
}


function initEventListeners() {
    
    elements.filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.currentFilter = btn.dataset.filter;
            filterRepos();
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

    document.querySelectorAll('.project-card, .contact-card').forEach(card => {
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
        
        state.repos = data.map(repo => ({
            id: repo.id,
            name: repo.name,
            description: repo.description || 'Sem descrição',
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

        
        elements.repoCount.textContent = state.repos.length;
        
        state.filteredRepos = [...state.repos];
        renderRepos();
        showLoading(false);
        
    } catch (error) {
        console.error('Erro ao carregar repositórios:', error);
        showError('Não foi possível carregar os projetos. Verifique sua conexão.');
        showLoading(false);
    }
}


function filterRepos() {
    if (state.currentFilter === 'all') {
        state.filteredRepos = [...state.repos];
    } else if (state.currentFilter === 'other') {
        state.filteredRepos = state.repos.filter(repo => 
            !['JavaScript', 'Python', 'HTML', 'CSS'].includes(repo.language)
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
    const visibleRepos = state.filteredRepos.slice(0, state.visibleCount);
    
    if (visibleRepos.length === 0) {
        elements.repoContainer.innerHTML = `
            <div class="no-projects">
                <i class="fas fa-code-branch"></i>
                <h3>Nenhum projeto encontrado</h3>
                <p>Tente outro filtro ou volte mais tarde.</p>
            </div>
        `;
        elements.viewMoreBtn.style.display = 'none';
        return;
    }
    
    elements.repoContainer.innerHTML = visibleRepos.map((repo, index) => `
        <div class="project-card" data-aos="fade-up" data-aos-delay="${index * 100}">
            <div class="project-header">
                <div class="project-icon">
                    <i class="${repo.icon}"></i>
                </div>
                <div class="project-actions">
                    ${repo.has_pages ? `
                        <a href="https://${CONFIG.GITHUB_USERNAME}.github.io/${repo.name}" 
                           class="action-btn" 
                           target="_blank" 
                           title="Demo">
                            <i class="fas fa-external-link-alt"></i>
                        </a>
                    ` : ''}
                    <a href="${repo.url}" 
                       class="action-btn" 
                       target="_blank" 
                       title="GitHub">
                        <i class="fab fa-github"></i>
                    </a>
                </div>
            </div>
            
            <h3 class="project-title">${repo.name}</h3>
            
            <p class="project-description">${repo.description}</p>
            
            ${repo.topics.length > 0 ? `
                <div class="project-tech">
                    ${repo.topics.slice(0, 3).map(topic => `
                        <span class="tech-tag">${topic}</span>
                    `).join('')}
                    ${repo.topics.length > 3 ? `<span class="tech-tag">+${repo.topics.length - 3}</span>` : ''}
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
                        <i class="fas fa-circle"></i>
                        <span>${repo.language}</span>
                    </div>
                </div>
                <div class="project-date" title="Última atualização">
                    ${repo.updated}
                </div>
            </div>
        </div>
    `).join('');

    
    elements.viewMoreBtn.style.display = 
        state.visibleCount < state.filteredRepos.length ? 'flex' : 'none';
}


function loadMoreRepos() {
    state.visibleCount += CONFIG.REPOS_PER_PAGE;
    renderRepos();
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
    
    return date.toLocaleDateString('pt-BR');
}


function showLoading(show) {
    if (show) {
        elements.repoContainer.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner">
                    <div class="spinner-ring"></div>
                    <div class="spinner-ring"></div>
                    <div class="spinner-ring"></div>
                </div>
                <p>Carregando projetos...</p>
            </div>
        `;
        elements.viewMoreBtn.style.display = 'none';
    }
}


function showError(message) {
    elements.repoContainer.innerHTML = `
        <div class="error-state">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Oops! Algo deu errado</h3>
            <p>${message}</p>
            <button onclick="fetchGitHubRepos()" class="btn-primary">
                <i class="fas fa-redo"></i>
                Tentar Novamente
            </button>
        </div>
    `;
}


function startAnimations() {
    
    document.querySelectorAll('.stack-icon').forEach((icon, index) => {
        icon.style.animationDelay = `${index * 100}ms`;
    });

    
    const repoCount = parseInt(elements.repoCount.textContent);
    if (repoCount > 0) {
        animateCounter(elements.repoCount, 0, repoCount, 2000);
    }
}


function animateCounter(element, start, end, duration) {
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
    const texts = ['Full Stack Developer', 'GitHub Enthusiast', 'Code Lover', 'Problem Solver'];
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const speed = 100;
    const typewriterElement = document.querySelector('.typewriter-text');

    function type() {
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
            setTimeout(type, 1000);
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            setTimeout(type, 500);
        } else {
            setTimeout(type, isDeleting ? speed / 2 : speed);
        }
    }

    if (typewriterElement) {
        setTimeout(type, 1000);
    }
}


window.addEventListener('load', initTypewriter);

