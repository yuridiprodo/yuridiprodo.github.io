const articlesDiv = document.getElementById('articles');
let articles = []; // Array per memorizzare gli articoli

// Funzione per caricare e visualizzare gli articoli
async function loadArticle(articleName) {
    const response = await fetch(`articles/${articleName}`);
    const markdown = await response.text();
    const html = marked(markdown);

    // Modifica il permalink nella barra degli indirizzi
    const permalink = articleName.replace('.md', '.html');
    history.pushState(null, '', permalink);
    
    // Trova l'indice dell'articolo corrente
    const currentIndex = articles.findIndex(article => article.name === articleName);
    
    // Costruisci la navigazione per articoli precedenti e successivi
    let navigation = `<hr>`;
    
    if (currentIndex > 0) {
        const prevArticle = articles[currentIndex - 1];
        const prevPermalink = prevArticle.name.replace('.md', '.html');
        navigation += `<a href="${prevPermalink}" onclick="event.preventDefault(); loadArticle('${prevArticle.name}');">Articolo precedente</a> | `;
    }
    
    if (currentIndex < articles.length - 1) {
        const nextArticle = articles[currentIndex + 1];
        const nextPermalink = nextArticle.name.replace('.md', '.html');
        navigation += `<a href="${nextPermalink}" onclick="event.preventDefault(); loadArticle('${nextArticle.name}');">Articolo successivo</a>`;
    }
    
    // Mostra il contenuto dell'articolo e la navigazione
    articlesDiv.innerHTML = `<div class="article-content">${html}</div>${navigation}`;
}

// Funzione per caricare la pagina dei contatti
async function loadContacts() {
    const response = await fetch('contatti.md');
    const markdown = await response.text();
    const html = marked(markdown);

    // Modifica il permalink nella barra degli indirizzi
    history.pushState(null, '', 'contatti.html');

    // Mostra il contenuto della pagina dei contatti
    articlesDiv.innerHTML = `<div class="article-content">${html}</div>`;
}

// Funzione per recuperare la lista degli articoli
async function fetchArticles() {
    const response = await fetch('https://api.github.com/repos/yuridiprodo/yuridiprodo.github.io/contents/articles');
    const data = await response.json();

    // Ordina gli articoli dal più recente al meno recente
    articles = data.sort((a, b) => b.name.localeCompare(a.name));

    // Crea i link agli articoli
    for (const article of articles) {
        const response = await fetch(article.download_url);
        const markdown = await response.text();

        // Estrai l'h1 dal Markdown
        const titleMatch = markdown.match(/# (.+)/);
        const title = titleMatch ? titleMatch[1] : article.name.replace('.md', '');

        const link = document.createElement('a');
        const permalink = article.name.replace('.md', '.html');
        link.href = permalink; // Imposta il permalink come href
        link.innerText = title;

        // Cambia il tooltip del link per mostrare il permalink
        link.title = permalink;

        const titleElement = document.createElement('h1');
        titleElement.appendChild(link);

        // Aggiungi l'evento click per caricare l'articolo
        link.addEventListener('click', (event) => {
            event.preventDefault();
            loadArticle(article.name);
        });

        articlesDiv.appendChild(titleElement);
    }

    // Aggiungi il link per la pagina dei contatti
    const contactsLink = document.createElement('a');
    contactsLink.innerText = 'Contatti';
    contactsLink.href = 'contatti.html'; // Imposta l'url della pagina
    contactsLink.onclick = (event) => {
        event.preventDefault();
        loadContacts();
    };
    articlesDiv.appendChild(contactsLink);
}

// Carica la lista degli articoli all'avvio
fetchArticles();
