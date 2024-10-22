const articlesDiv = document.getElementById('articles');

// Funzione per caricare e visualizzare gli articoli
async function loadArticle(articleName) {
    const response = await fetch(`articles/${articleName}`);
    const markdown = await response.text();
    const html = marked(markdown);
    
    // Mostra il contenuto dell'articolo
    document.body.innerHTML = html;
}

// Funzione per recuperare la lista degli articoli
async function fetchArticles() {
    const response = await fetch('https://api.github.com/repos/tuo-username/tuo-repository/contents/articles');
    const articles = await response.json();

    // Ordina gli articoli (opzionale, a seconda della struttura del nome file)
    const sortedArticles = articles.sort((a, b) => new Date(b.name) - new Date(a.name));

    // Crea i link agli articoli
    sortedArticles.forEach(article => {
        const link = document.createElement('a');
        link.href = `articles/${article.name}`;
        link.innerText = article.name.replace('.md', '');

        const title = document.createElement('h1');
        title.appendChild(link);

        // Aggiungi l'evento click per caricare l'articolo
        link.addEventListener('click', (event) => {
            event.preventDefault();
            loadArticle(article.name);
        });

        articlesDiv.appendChild(title);
    });
}

// Carica la lista degli articoli all'avvio
fetchArticles();
