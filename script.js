 // Smooth scrolling pour les liens de navigation
 document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Animation des cartes au scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observer les cartes de service et de prix
document.querySelectorAll('.service-card, .pricing-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// Variables pour le mode de contact
let contactMethod = 'email'; // Par défaut : email

// Fonction pour afficher la modal de remerciement
function showThankYouModal() {
    document.getElementById('thankYouModal').style.display = 'block';
    document.body.style.overflow = 'hidden'; // Empêche le scroll
}

// Fonction pour fermer la modal
function closeModal() {
    document.getElementById('thankYouModal').style.display = 'none';
    document.body.style.overflow = 'auto'; // Réactive le scroll
    
    // Reset du formulaire
    document.getElementById('contact-form').reset();
}

// Fermer la modal en cliquant en dehors
window.onclick = function(event) {
    const modal = document.getElementById('thankYouModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Fermer avec la touche Escape
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});

// Fonction pour changer de méthode de contact
function selectMethod(method) {
    contactMethod = method;
    
    // Mise à jour des boutons
    document.querySelectorAll('.method-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(method + '-method').classList.add('active');
    
    // Mise à jour du formulaire
    const form = document.getElementById('contact-form');
    const submitButton = document.getElementById('submit-button');
    const submitText = document.getElementById('submit-text');
    const formspreeInfo = document.getElementById('formspree-info');
    
    if (method === 'email') {
        form.setAttribute('action', '');
        form.setAttribute('method', '');
        submitText.textContent = '📧 Ouvrir dans mon email';
        formspreeInfo.style.display = 'none';
    } else {
        form.setAttribute('action', 'https://formsubmit.co/maevadurot02@gmail.com');
        form.setAttribute('method', 'POST');
        submitText.textContent = '📝 Envoyer la demande';
        formspreeInfo.style.display = 'block';
    }
}

// Fonction pour créer l'email automatique
function createEmailContent() {
    const formData = new FormData(document.getElementById('contact-form'));
    const data = Object.fromEntries(formData);
    
    const subject = `Demande de promenade pour ${data.chien || '[Nom du chien]'}`;
    const body = `Bonjour Maeva,

Je souhaite réserver une promenade pour mon chien.

INFORMATIONS CLIENT :
- Nom : ${data.nom || '[Non renseigné]'}
- Email : ${data.email || '[Non renseigné]'}
- Téléphone : ${data.telephone || '[Non renseigné]'}

INFORMATIONS CHIEN :
- Prénom et race : ${data.chien || '[Non renseigné]'}

SERVICE SOUHAITÉ :
- ${data.service ? getServiceName(data.service) : '[Non renseigné]'}

DATE SOUHAITÉE :
- ${data.date ? formatDate(data.date) : '[À définir ensemble]'}

MESSAGE / BESOINS SPÉCIFIQUES :
${data.message || '[Aucun message particulier]'}

Cordialement,
${data.nom || '[Votre nom]'}`;

    return { subject, body };
}

function getServiceName(serviceValue) {
    const services = {
        'express': 'Promenade Express (30min - 15€)',
        'standard': 'Promenade Standard (1h - 25€)',
        'premium': 'Promenade Premium (1h30 - 40€)',
        'groupe': 'Promenade en Groupe',
        'jogging': 'Jogging Canin',
        'domicile': 'Visite à Domicile'
    };
    return services[serviceValue] || serviceValue;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Gestion du formulaire mis à jour
document.getElementById('contact-form').addEventListener('submit', function(e) {
    if (contactMethod === 'email') {
        e.preventDefault();
        
        // Créer l'email automatique
        const { subject, body } = createEmailContent();
        
        // Ouvrir le client email
        const mailtoLink = `mailto:maevadurot02@gmail.com.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
        
        // Feedback utilisateur
        const btn = this.querySelector('.submit-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '✅ Email ouvert !';
        btn.style.background = '#4CAF50';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '#ffd700';
        }, 3000);
        
    } else {
        // Mode FormSubmit - Configuration pour éviter les spams et afficher la modal
        
        // Animation du bouton pour FormSubmit
        const btn = this.querySelector('.submit-btn');
        const originalText = btn.textContent;
        btn.textContent = 'Envoi en cours...';
        btn.disabled = true;
        
        // Soumettre le formulaire
        fetch(this.action, {
            method: 'POST',
            body: new FormData(this)
        })
        .then(response => {
            if (response.ok) {
                // Succès - Afficher la modal
                showThankYouModal();
            } else {
                throw new Error('Erreur d\'envoi');
            }
        })
        .catch(error => {
            // En cas d'erreur, fallback vers la méthode email
            console.log('Erreur FormSubmit, basculement vers email:', error);
            
            const { subject, body } = createEmailContent();
            const mailtoLink = `mailto:maevadurot02@gmail.com.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            window.location.href = mailtoLink;
            
            btn.innerHTML = '📧 Email ouvert (fallback)';
            btn.style.background = '#ff9800';
        })
        .finally(() => {
            // Remettre le bouton en état
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = '#ffd700';
                btn.disabled = false;
            }, 2000);
        });
        
        // Empêcher la soumission normale du formulaire
        e.preventDefault();
    }
});

// Animation du header au scroll
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > lastScroll && currentScroll > 100) {
        header.style.transform = 'translateY(-100%)';
    } else {
        header.style.transform = 'translateY(0)';
    }
    
    lastScroll = currentScroll;
});