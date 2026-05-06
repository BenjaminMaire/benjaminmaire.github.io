/* =========================================
   GESTION DU MENU MOBILE
   ========================================= */
const sideMenu = document.querySelector('#sideMenu');

function openMenu() {
    sideMenu.style.transform = 'translateX(0)';
}

function closeMenu() {
    sideMenu.style.transform = 'translateX(100%)';
}

/* =========================================
   GESTION DES MODALES (PROJETS)
   ========================================= */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    const panel = modal.querySelector('.modal-panel');
    if (panel) panel.style.animation = '';
    modal.style.animation = '';
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    const panel = modal.querySelector('.modal-panel');
    if (panel) panel.style.animation = 'modalOut 0.2s ease forwards';
    modal.style.animation = 'backdropOut 0.25s ease forwards';
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.style.animation = '';
        if (panel) panel.style.animation = '';
        document.body.style.overflow = 'auto';
    }, 250);
}

function handleBackdropClick(event, modalId) {
    if (event.target === event.currentTarget) closeModal(modalId);
}

document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = document.querySelector('.modal-backdrop:not(.hidden)');
    if (open) closeModal(open.id);
});

/* EFFET DE BACKGROUND AU SCROLL*/
window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollFraction = scrollTop / docHeight;

    // Dégradé subtil du bleu nuit profond vers un bleu légèrement plus clair
    // Start: #0A0E29 (10, 14, 41) -> End: #1a2352 (26, 35, 82)
    const startRGB = [10, 14, 41];    
    const endRGB = [26, 35, 82];   

    const currentRGB = startRGB.map((start, i) =>
        Math.round(start + (endRGB[i] - start) * scrollFraction)
    );

    document.body.style.backgroundColor = `rgb(${currentRGB.join(",")})`;
});

/* Flux rss pour la veille technologique */
async function fetchRSS() {
    const container = document.getElementById('rss-feed-container');
    const rssUrl = 'https://gamefromscratch.com/feed/';
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.status === 'ok') {
            container.innerHTML = ''; 
            const articles = data.items.slice(0, 6);

            articles.forEach(item => {
                const card = document.createElement('div');
                card.className = 'bg-[#131b40] p-5 rounded-xl border border-white/5 hover:bg-[#1f294f] transition flex flex-col justify-between h-full';
                
                let dateString = item.pubDate;
                if(dateString) dateString = dateString.replace(/-/g, '/');
                const dateObj = new Date(dateString);
                const date = isNaN(dateObj.getTime()) ? "Récemment" : dateObj.toLocaleDateString('fr-FR');


                const cleanContent = cleanDescription(item.description);

                card.innerHTML = `
                    <div>
                        <div class="text-orange-400 text-xs font-bold mb-2 uppercase tracking-wide flex justify-between">
                            <span>GameFromScratch</span>
                            <span>${date}</span>
                        </div>
                        <h4 class="text-white font-semibold text-lg mb-3 leading-snug hover:text-blue-400 transition">
                            <a href="${item.link}" target="_blank">${item.title}</a>
                        </h4>
                        <p class="text-gray-400 text-sm line-clamp-3 mb-4">
                            ${cleanContent}
                        </p>
                    </div>
                    <a href="${item.link}" target="_blank" class="text-sm text-blue-400 hover:text-white font-medium mt-auto flex items-center gap-1">
                        Lire l'article <span class="text-lg">→</span>
                    </a>
                `;
                container.appendChild(card);
            });
        } else {
            container.innerHTML = '<p class="text-red-400">Impossible de charger le flux RSS.</p>';
        }
    } catch (error) {
        console.error('Erreur RSS:', error);
        container.innerHTML = '<p class="text-gray-500">Le flux d\'actualité est temporairement indisponible.</p>';
    }
}


function cleanDescription(html) {

    let tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    let text = tmp.textContent || tmp.innerText || "";


    text = text.replace(/^GameFromScratch\.com\s*/i, "");
    

    text = text.replace(/The post .* appeared first on .*/gi, ""); 

    return text.trim(); 
}

// Lancer le script au chargement
document.addEventListener('DOMContentLoaded', fetchRSS);

// Fonction utilitaire pour enlever les balises HTML de la description RSS 
function stripHtml(html) {
   let tmp = document.createElement("DIV");
   tmp.innerHTML = html;
   return tmp.textContent || tmp.innerText || "";
}
