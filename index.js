const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const matrixChars = '01 ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const fontSize = 10;
const columns = canvas.width / fontSize;
const drops = Array(Math.floor(columns)).fill(1);

function drawMatrix() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#00ff9d';
    ctx.font = `${fontSize}px monospace`;

    drops.forEach((drop, i) => {
        const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
        ctx.fillText(char, i * fontSize, drop * fontSize);

        if (drop * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    });
}

setInterval(drawMatrix, 35);

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});


const languageIcons = {
    'JavaScript': 'fab fa-js-square',
    'Python': 'fab fa-python',
    'HTML': 'fab fa-html5',
    'CSS': 'fab fa-css3-alt',
    'PHP': 'fab fa-php',
    'Java': 'fab fa-java',
    'Shell': 'fas fa-terminal',
    'default': 'fas fa-code'
};

let repos = [];
let allRepos = [];
let visibleRepos = 6;

async function fetchGitHubRepos() {
    try {
        const response = await fetch('https://api.github.com/users/sentinelzxofc/repos?sort=updated&per_page=100');
        
        if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
        
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('Dados inválidos');
        
        allRepos = data.map(repo => ({
            name: repo.name,
            description: repo.description || 'Projeto sem descrição',
            language: repo.language || 'Code',
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            url: repo.html_url,
            updated: new Date(repo.updated_at).toLocaleDateString('pt-BR'),
            icon: languageIcons[repo.language] || languageIcons['default']
        })).filter(repo => !repo.name.includes('.github.io'));

        repos = allRepos.slice(0, 10);
        renderRepos();
    } catch (error) {
        console.error('Erro ao carregar repositórios:', error);
        showError('Falha ao carregar projetos. Tente recarregar a página.');
    }
}

function renderRepos() {
    const container = document.getElementById('reposContainer');
    const btn = document.getElementById('viewMoreBtn');
    
    if (!repos.length) {
        container.innerHTML = `
            <div class="repo-card" style="grid-column:1/-1;text-align:center">
                <h3><i class="fas fa-info-circle"></i> Nenhum repositório</h3>
                <p>Não encontramos projetos públicos</p>
            </div>
        `;
        btn.style.display = 'none';
        return;
    }

    container.innerHTML = repos.slice(0, visibleRepos).map((repo, i) => `
        <div class="repo-card" style="animation-delay:${i*0.1}s" onclick="window.open('${repo.url}', '_blank')">
            <h3><i class="${repo.icon}"></i> ${repo.name}</h3>
            <p>${repo.description}</p>
            <div class="repo-stats">
                <div title="Estrelas"><i class="fas fa-star"></i> ${repo.stars}</div>
                <div title="Forks"><i class="fas fa-code-branch"></i> ${repo.forks}</div>
                <div title="Linguagem"><i class="fas fa-circle" style="color:#00ff9d"></i> ${repo.language}</div>
                <div title="Atualizado"><i class="fas fa-calendar-alt"></i> ${repo.updated}</div>
            </div>
        </div>
    `).join('');

    btn.style.display = allRepos.length > visibleRepos ? 'block' : 'none';
    btn.onclick = () => {
        visibleRepos += 6;
        renderRepos();
        if (visibleRepos >= allRepos.length) btn.style.display = 'none';
    };
}

function showError(msg) {
    document.getElementById('reposContainer').innerHTML = `
        <div class="repo-card" style="grid-column:1/-1;text-align:center">
            <h3><i class="fas fa-exclamation-triangle"></i> Erro</h3>
            <p>${msg}</p>
            <button onclick="fetchGitHubRepos()" class="cta-button" style="margin-top:20px">
                Tentar Novamente
            </button>
        </div>
    `;
}


function createParticles() {
    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDuration = `${Math.random() * 3 + 5}s`;
            particle.style.animationDelay = `${Math.random() * 2}s`;
            document.body.appendChild(particle);
            setTimeout(() => particle.remove(), 8000);
        }, i * 300);
    }
}


document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    navbar.style.background = window.scrollY > 100 
        ? 'rgba(10, 10, 10, 0.98)' 
        : 'rgba(10, 10, 10, 0.95)';
    navbar.style.backdropFilter = window.scrollY > 100 ? 'blur(30px)' : 'blur(20px)';
});


document.addEventListener('DOMContentLoaded', () => {
    fetchGitHubRepos();
    setInterval(createParticles, 3000);
});